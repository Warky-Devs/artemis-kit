/**
 * Converts bytes to human readable file size string with units
 * @param bytes - Number of bytes to format
 * @param si - Use SI units (1000) instead of binary units (1024)
 * @param dp - Decimal places to display
 * @returns Formatted string with appropriate unit suffix
 */
export function humanFileSize(bytes: number, si: boolean = false, dp: number = 1): string {
  // Define base unit (1000 for SI, 1024 for binary)
  const thresh: number = si ? 1000 : 1024;

  // Return bytes if below threshold
  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`;
  }

  // Define unit suffixes based on SI/binary preference
  const units: string[] = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  let u: number = -1;
  const r: number = 10 ** dp;

  // Divide by threshold until result is less than threshold or we run out of units
  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  // Format with specified decimal places and appropriate unit
  return `${bytes.toFixed(dp)} ${units[u]}`;
}