/**
 * Sanitizes a cell value before writing to an Excel worksheet to prevent
 * CSV / Spreadsheet Formula Injection (OWASP CSV Injection).
 *
 * Any string starting with '=', '+', '-', '@', '\t', or '\r' is prefixed
 * with a single quote ("'") so spreadsheet applications treat it as literal text.
 */
export function sanitizeExcelCell<T>(value: T): T | string {
  if (typeof value !== "string") {
    return value;
  }
  if (/^[=+\-@\t\r]/.test(value)) {
    return `'${value}`;
  }
  return value;
}

/**
 * Sanitizes all string properties of a row object for safe Excel export.
 */
export function sanitizeExcelRow<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(row)) {
    sanitized[key] = sanitizeExcelCell(val);
  }
  return sanitized;
}
