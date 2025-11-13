/**
 * DeFi Input Validation & Error Handling Helpers
 * 
 * Safe parsing and validation for all numeric inputs (stake, swap, transfer)
 */

/**
 * Parse user input string to bigint (18 decimals)
 * Returns null if invalid format
 * 
 * @example
 * parseAmount("10.5") // 10500000000000000000n
 * parseAmount("abc") // null
 * parseAmount("1.123456789012345678") // valid
 * parseAmount("1.1234567890123456789") // null (too many decimals)
 */
export function parseAmount(input: string, decimals: number = 18): bigint | null {
  if (!input || typeof input !== 'string') return null;
  
  // Only allow digits and optional decimal point
  if (!/^\d*\.?\d*$/.test(input)) return null;
  
  try {
    const [integerPart = "0", fractionalPart = ""] = input.split(".");
    
    // Too many decimal places
    if (fractionalPart.length > decimals) return null;
    
    // Pad fractional part to exact decimals
    const paddedFractional = (fractionalPart + "0".repeat(decimals)).slice(0, decimals);
    
    const integerValue = BigInt(integerPart || "0");
    const fractionalValue = BigInt(paddedFractional || "0");
    const multiplier = 10n ** BigInt(decimals);
    
    return integerValue * multiplier + fractionalValue;
  } catch {
    return null;
  }
}

/**
 * Ensure amount is within valid range
 * Throws descriptive error if out of bounds
 * 
 * @example
 * ensureRange(amount, { min: 1n }) // must be > 0
 * ensureRange(amount, { max: userBalance }) // can't exceed balance
 */
export function ensureRange(
  value: bigint, 
  options: { min?: bigint; max?: bigint } = {}
): bigint {
  const { min = 0n, max = 2n**256n - 1n } = options;
  
  if (value < min) {
    throw new Error(min === 0n ? "Amount must be greater than 0" : `Amount must be at least ${min}`);
  }
  
  if (value > max) {
    throw new Error("Amount too large");
  }
  
  return value;
}

/**
 * Convert contract/wallet errors to human-friendly messages
 * 
 * @example
 * try { await swap() }
 * catch (e) { setError(humanError(e)) }
 */
export function humanError(err: unknown): string {
  const errorString = String(err);
  
  // User-initiated cancellations
  if (errorString.includes("user rejected") || 
      errorString.includes("User denied") ||
      errorString.includes("rejected")) {
    return "Transaction cancelled";
  }
  
  // Balance/allowance errors
  if (errorString.includes("INSUFFICIENT") || 
      errorString.includes("insufficient") ||
      errorString.includes("exceeds balance")) {
    return "Insufficient balance";
  }
  
  // Slippage/deadline errors
  if (errorString.includes("SLIPPAGE") || 
      errorString.includes("slippage") ||
      errorString.includes("EXPIRED") ||
      errorString.includes("deadline")) {
    return "Price changed too much, please try again";
  }
  
  // Network errors
  if (errorString.includes("network") || 
      errorString.includes("NETWORK_ERROR")) {
    return "Network error, please check connection";
  }
  
  // Gas errors
  if (errorString.includes("gas") || 
      errorString.includes("out of gas")) {
    return "Transaction would fail, insufficient gas";
  }
  
  // Generic fallback
  return "Transaction failed, please try again";
}

/**
 * Validate amount input and return formatted error message
 * Returns null if valid
 * 
 * @example
 * const error = validateAmountInput(input, balance);
 * if (error) return <ErrorMessage>{error}</ErrorMessage>;
 */
export function validateAmountInput(
  input: string,
  balance: bigint,
  options: { min?: bigint; decimals?: number } = {}
): string | null {
  const { min = 1n, decimals = 18 } = options;
  
  if (!input || input.trim() === '') {
    return "Enter an amount";
  }
  
  const parsed = parseAmount(input, decimals);
  
  if (parsed === null) {
    return "Invalid number format";
  }
  
  if (parsed === 0n) {
    return "Amount must be greater than 0";
  }
  
  if (parsed < min) {
    return `Amount must be at least ${min}`;
  }
  
  if (parsed > balance) {
    return "Insufficient balance";
  }
  
  return null; // Valid
}
