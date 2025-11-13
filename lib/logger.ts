/**
 * VOID Centralized Logger
 * 
 * Purpose: Structured logging for API routes, errors, and performance metrics
 * Usage: import { logger } from '@/lib/logger';
 *        logger.info('Message', { metadata });
 * 
 * Features:
 * - Structured JSON logging
 * - Environment-aware (dev vs production)
 * - Sentry integration for errors
 * - Performance timing helpers
 * - Request/response tracking
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogMetadata {
  [key: string]: any;
  userId?: string;
  sessionId?: string;
  endpoint?: string;
  duration?: number;
  statusCode?: number;
  error?: string | Error;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: LogMetadata;
  environment: string;
}

/**
 * Logger class - Singleton instance for consistent logging
 */
class Logger {
  private isDevelopment: boolean;
  private sentryEnabled: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.sentryEnabled = !!process.env.SENTRY_DSN;
  }

  /**
   * Format log entry as JSON
   */
  private formatEntry(level: LogLevel, message: string, metadata?: LogMetadata): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata: this.sanitizeMetadata(metadata),
      environment: process.env.NODE_ENV || 'unknown',
    };
  }

  /**
   * Remove sensitive data from metadata
   */
  private sanitizeMetadata(metadata?: LogMetadata): LogMetadata | undefined {
    if (!metadata) return undefined;

    const sanitized = { ...metadata };

    // Remove sensitive fields
    const sensitiveKeys = ['password', 'token', 'secret', 'privateKey', 'apiKey'];
    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    }

    // Truncate long error messages
    if (sanitized.error && typeof sanitized.error === 'object') {
      sanitized.error = (sanitized.error as Error).message;
    }

    return sanitized;
  }

  /**
   * Write log to console (development) or stdout (production)
   */
  private write(entry: LogEntry): void {
    if (this.isDevelopment) {
      // Colorized console output for development
      const colors = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m',  // Green
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m', // Red
      };
      const reset = '\x1b[0m';
      
      console.log(
        `${colors[entry.level]}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp} - ${entry.message}`,
        entry.metadata || ''
      );
    } else {
      // JSON output for production (easier to parse by log aggregators)
      console.log(JSON.stringify(entry));
    }
  }

  /**
   * Send error to Sentry (if configured)
   */
  private async sendToSentry(message: string, metadata?: LogMetadata): Promise<void> {
    if (!this.sentryEnabled) return;

    try {
      // Lazy load Sentry to avoid import errors if not configured
      const Sentry = await import('@sentry/nextjs');
      
      const error = metadata?.error 
        ? (typeof metadata.error === 'string' ? new Error(metadata.error) : metadata.error)
        : new Error(message);

      Sentry.captureException(error, {
        level: 'error',
        contexts: {
          metadata: metadata || {},
        },
      });
    } catch (err) {
      // Silently fail if Sentry is not configured
      console.error('[Logger] Failed to send to Sentry:', err);
    }
  }

  /**
   * DEBUG level - Only logged in development
   */
  debug(message: string, metadata?: LogMetadata): void {
    if (!this.isDevelopment) return; // Skip in production
    
    const entry = this.formatEntry('debug', message, metadata);
    this.write(entry);
  }

  /**
   * INFO level - General information
   */
  info(message: string, metadata?: LogMetadata): void {
    const entry = this.formatEntry('info', message, metadata);
    this.write(entry);
  }

  /**
   * WARN level - Non-critical issues
   */
  warn(message: string, metadata?: LogMetadata): void {
    const entry = this.formatEntry('warn', message, metadata);
    this.write(entry);
  }

  /**
   * ERROR level - Critical errors (also sent to Sentry)
   */
  error(message: string, metadata?: LogMetadata): void {
    const entry = this.formatEntry('error', message, metadata);
    this.write(entry);
    
    // Send to Sentry in production
    if (!this.isDevelopment && this.sentryEnabled) {
      this.sendToSentry(message, metadata).catch(() => {
        // Ignore Sentry errors
      });
    }
  }

  /**
   * Start a performance timer
   * Returns a function to end the timer and log the duration
   */
  startTimer(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = Math.round(performance.now() - start);
      this.info(`${label} completed`, { duration });
    };
  }

  /**
   * Log API request
   */
  logRequest(endpoint: string, method: string, metadata?: LogMetadata): void {
    this.info(`API Request: ${method} ${endpoint}`, {
      endpoint,
      method,
      ...metadata,
    });
  }

  /**
   * Log API response
   */
  logResponse(endpoint: string, statusCode: number, duration: number, metadata?: LogMetadata): void {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    
    this[level](`API Response: ${endpoint}`, {
      endpoint,
      statusCode,
      duration,
      ...metadata,
    });
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();

/**
 * Express/Next.js middleware for automatic request/response logging
 * 
 * Usage in API route:
 * export default withLogging(async (req, res) => { ... });
 */
export function withLogging(handler: any) {
  return async (req: any, res: any) => {
    const start = performance.now();
    const endpoint = req.url || req.path;
    const method = req.method || 'GET';

    logger.logRequest(endpoint, method, {
      userId: req.userId, // Set by auth middleware
      sessionId: req.sessionId,
    });

    try {
      await handler(req, res);
      
      const duration = Math.round(performance.now() - start);
      logger.logResponse(endpoint, res.statusCode || 200, duration);
    } catch (error) {
      const duration = Math.round(performance.now() - start);
      logger.error(`API Error: ${endpoint}`, {
        endpoint,
        method,
        error: error as Error,
        duration,
      });
      
      throw error; // Re-throw to let Next.js handle it
    }
  };
}

/**
 * Helper function for timing async operations
 * 
 * Usage:
 * const data = await timeAsync('Fetch leaderboards', async () => {
 *   return await db.leaderboards.findMany();
 * });
 */
export async function timeAsync<T>(
  label: string,
  fn: () => Promise<T>,
  metadata?: LogMetadata
): Promise<T> {
  const start = performance.now();
  
  try {
    const result = await fn();
    const duration = Math.round(performance.now() - start);
    
    logger.info(`${label} completed`, {
      duration,
      ...metadata,
    });
    
    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - start);
    
    logger.error(`${label} failed`, {
      error: error as Error,
      duration,
      ...metadata,
    });
    
    throw error;
  }
}

/**
 * Helper function for timing sync operations
 */
export function timeSync<T>(
  label: string,
  fn: () => T,
  metadata?: LogMetadata
): T {
  const start = performance.now();
  
  try {
    const result = fn();
    const duration = Math.round(performance.now() - start);
    
    logger.debug(`${label} completed`, {
      duration,
      ...metadata,
    });
    
    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - start);
    
    logger.error(`${label} failed`, {
      error: error as Error,
      duration,
      ...metadata,
    });
    
    throw error;
  }
}

/**
 * Create a child logger with default metadata
 * Useful for module-specific logging
 * 
 * Usage:
 * const chatLogger = createChildLogger({ module: 'chat' });
 * chatLogger.info('Message sent', { userId: '0x123' });
 * // Logs: { module: 'chat', userId: '0x123' }
 */
export function createChildLogger(defaultMetadata: LogMetadata) {
  return {
    debug: (message: string, metadata?: LogMetadata) => 
      logger.debug(message, { ...defaultMetadata, ...metadata }),
    
    info: (message: string, metadata?: LogMetadata) => 
      logger.info(message, { ...defaultMetadata, ...metadata }),
    
    warn: (message: string, metadata?: LogMetadata) => 
      logger.warn(message, { ...defaultMetadata, ...metadata }),
    
    error: (message: string, metadata?: LogMetadata) => 
      logger.error(message, { ...defaultMetadata, ...metadata }),
  };
}

// Export default instance
export default logger;
