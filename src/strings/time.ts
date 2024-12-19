/**
 * Format a time in seconds to a string.
 *
 * @param totalSeconds time in seconds
 * @returns a string in the format HH:MM:SS or MM:SS if hours are zero
 */
export function formatSecondToTime(totalSeconds: number): string {
  const prefix = totalSeconds < 0 ? "-" : "";
  totalSeconds = Math.abs(Math.floor(totalSeconds));

  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const hours = Math.floor(totalSeconds / 3600);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${prefix}${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${prefix}${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Converts a time string in the format HH:MM:SS or MM:SS to a total number of seconds.
 *
 * @param timeStr - a string in the format HH:MM:SS or MM:SS
 * @returns the total number of seconds
 */
export function timeStringToSeconds(timeStr: string): number {
  // Validate input is not empty
  if (!timeStr || !timeStr.trim()) {
    throw new Error("Time string cannot be empty");
  }

  const parts = timeStr.split(":");
  if (parts.length < 2 || parts.length > 3) {
    throw new Error("Invalid time format. Expected HH:MM:SS or MM:SS");
  }

  // Parse numbers and validate ranges
  let hours = 0,
    minutes = 0,
    seconds = 0;

  if (parts.length === 3) {
    // HH:MM:SS format
    [hours, minutes, seconds] = parts.map((n) => parseInt(n, 10));

    if (isNaN(hours) || hours < 0 || hours > 23) {
      throw new Error("Hours must be between 0 and 23");
    }
  } else {
    // MM:SS format
    [minutes, seconds] = parts.map((n) => parseInt(n, 10));
  }

  if (isNaN(minutes) || minutes < 0 || minutes > 59) {
    throw new Error("Minutes must be between 0 and 59");
  }

  if (isNaN(seconds) || seconds < 0 || seconds > 59) {
    throw new Error("Seconds must be between 0 and 59");
  }

  return hours * 3600 + minutes * 60 + seconds;
}
