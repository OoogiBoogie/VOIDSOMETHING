import fs from "fs";
import path from "path";

/**
 * QA Event Logger
 * 
 * Logs test events to JSONL files for historical tracking
 * Each day gets its own log file: qa-reports/YYYY-MM-DD.jsonl
 * 
 * Usage:
 * ```typescript
 * import { logQA } from '@/scripts/qa-log';
 * 
 * logQA("swap_fee_accrual", { before, after, delta });
 * logQA("stake", { amount, tx });
 * logQA("land_ownership", { parcelId, owner });
 * ```
 */

export interface QALogEntry {
  timestamp: string;
  event: string;
  payload: unknown;
}

const QA_REPORTS_DIR = path.join(process.cwd(), "qa-reports");

/**
 * Ensure qa-reports directory exists
 */
function ensureReportsDir() {
  if (!fs.existsSync(QA_REPORTS_DIR)) {
    fs.mkdirSync(QA_REPORTS_DIR, { recursive: true });
  }
}

/**
 * Get today's log file path
 */
function getTodayLogFile(): string {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return path.join(QA_REPORTS_DIR, `${today}.jsonl`);
}

/**
 * Log a QA event
 * 
 * @param event - Event name/type (e.g., "swap_fee_accrual", "stake", "approve")
 * @param payload - Event data (amounts, addresses, tx hashes, etc.)
 * 
 * @example
 * logQA("swap_executed", {
 *   amountIn: "10000000000000000000",
 *   amountOut: "9970000000000000000",
 *   fee: "30000000000000000",
 *   txHash: "0x123...",
 *   user: "0xabc...",
 *   status: "success"
 * });
 */
export function logQA(event: string, payload: unknown): void {
  try {
    ensureReportsDir();
    
    const logEntry: QALogEntry = {
      timestamp: new Date().toISOString(),
      event,
      payload,
    };
    
    const logFile = getTodayLogFile();
    const logLine = JSON.stringify(logEntry) + "\n";
    
    fs.appendFileSync(logFile, logLine, "utf8");
    
    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[QA LOG] ${event}`, payload);
    }
  } catch (error) {
    console.error("[QA LOG ERROR]", error);
  }
}

/**
 * Read all QA logs for a specific date
 * 
 * @param date - Date string in YYYY-MM-DD format (defaults to today)
 * @returns Array of log entries
 */
export function readQALogs(date?: string): QALogEntry[] {
  try {
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const logFile = path.join(QA_REPORTS_DIR, `${targetDate}.jsonl`);
    
    if (!fs.existsSync(logFile)) {
      return [];
    }
    
    const content = fs.readFileSync(logFile, "utf8");
    const lines = content.trim().split("\n").filter(line => line);
    
    return lines.map(line => JSON.parse(line) as QALogEntry);
  } catch (error) {
    console.error("[QA LOG READ ERROR]", error);
    return [];
  }
}

/**
 * Get summary statistics for a specific event type
 * 
 * @param event - Event name to filter
 * @param date - Date string (defaults to today)
 */
export function getQAEventStats(event: string, date?: string): {
  count: number;
  events: QALogEntry[];
} {
  const logs = readQALogs(date);
  const filtered = logs.filter(log => log.event === event);
  
  return {
    count: filtered.length,
    events: filtered,
  };
}
