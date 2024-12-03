
/**
 * Checks if a value exists in an array or matches a single value
 * @param args - First argument is the source (array/value), followed by values to check
 * @returns True if any subsequent argument matches source or exists in source array
 */
export function inop(...args: unknown[]): boolean {
    if (args.length < 2) return false;
    
    const [source, ...searchValues] = args;
    
    // Handle array-like objects
    if (source !== null && 'length' in (source as { length?: number })) {
      const arr = Array.from(source as ArrayLike<unknown>);
      return searchValues.some(val => arr.includes(val));
    }
    
    // Handle single value comparison
    return searchValues.some(val => source === val);
  }
  
  /**
   * Case-insensitive version of inop() for string comparisons
   * @param args - First argument is source (string/array), followed by values to check
   * @returns True if any subsequent argument matches source with case-insensitive comparison
   */
  export function iinop(...args: unknown[]): boolean {
    if (args.length < 2) return false;
    
    const [source, ...searchValues] = args;
    
    // Handle array-like objects
    if (source !== null && 'length' in (source as { length?: number })) {
      const arr = Array.from(source as ArrayLike<unknown>);
      return searchValues.some(val => {
        return arr.some(item => {
          if (typeof item === 'string' && typeof val === 'string') {
            return item.toLowerCase() === val.toLowerCase();
          }
          return item === val;
        });
      });
    }
    
    // Handle single value comparison
    if (typeof source === 'string') {
      return searchValues.some(val => {
        if (typeof val === 'string') {
          return source.toLowerCase() === val.toLowerCase();
        }
        return source === val;
      });
    }
    
    return searchValues.some(val => source === val);
  }

/**
 * Base date for Clarion date calculations (December 28, 1800)
 */
const CLARION_EPOCH = new Date(1800, 11, 28);

  /**
 * Converts a Clarion integer time value to a formatted time string
 * @param val - Clarion time value (HHMMSS.CC format where CC is centiseconds)
 * @param detail - If true, includes centiseconds in output
 * @returns Formatted time string (HH:MM:SS or HH:MM:SS.CC)
 */
export function clarionIntToTime(val: number, detail?: boolean): string {
    // Ensure non-negative value
    if (val < 0) {
        val = 0;
    }

    // Convert to seconds
    const sec_num = val / 100;

    // Extract time components
    const hours: number = Math.floor(val / 360000);
    const minutes: number = Math.floor((sec_num - hours * 3600) / 60);
    const seconds: number = Math.floor(
        sec_num - hours * 3600 - minutes * 60
    );
    const ms: number = Math.floor(
        val - hours * 360000 - minutes * 6000 - seconds * 100
    );

    // Format time components with leading zeros
    const paddedHours = hours.toString().padStart(2, '0');
    const paddedMinutes = minutes.toString().padStart(2, '0');
    const paddedSeconds = seconds.toString().padStart(2, '0');

    // Handle centiseconds formatting
    let msString: string;
    if (ms < 10) {
        msString = ms.toString() + '00';
    } else if (ms < 100) {
        msString = ms.toString() + '0';
    } else {
        msString = ms.toString();
    }

    // Return formatted time string
    return detail 
        ? `${paddedHours}:${paddedMinutes}:${paddedSeconds}.${msString}`
        : `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
}

/**
 * Converts a time string to a Clarion integer time value
 * @param timeStr - Time string in format "HH:MM:SS" or "HH:MM:SS.CC"
 * @returns Clarion time value (HHMMSS.CC format where CC is centiseconds)
 * @throws Error if the time string format is invalid
 */
export function clarionTimeToInt(timeStr: string): number {
    // Regular expressions to match both formats
    const basicTimeRegex = /^(\d{2}):(\d{2}):(\d{2})$/;
    const detailedTimeRegex = /^(\d{2}):(\d{2}):(\d{2})\.(\d{1,3})$/;
    
    let hours: number;
    let minutes: number;
    let seconds: number;
    let centiseconds: number = 0;

    // Try matching both formats
    const basicMatch = timeStr.match(basicTimeRegex);
    const detailedMatch = timeStr.match(detailedTimeRegex);

    if (detailedMatch) {
        // Parse detailed time format (HH:MM:SS.CC)
        [, hours, minutes, seconds, centiseconds] = detailedMatch.map(Number);
        
        // Handle different centisecond precision
        if (centiseconds < 10) {
            centiseconds *= 100;
        } else if (centiseconds < 100) {
            centiseconds *= 10;
        }
    } else if (basicMatch) {
        // Parse basic time format (HH:MM:SS)
        [, hours, minutes, seconds] = basicMatch.map(Number);
    } else {
        throw new Error('Invalid time format. Expected HH:MM:SS or HH:MM:SS.CC');
    }

    // Validate time components
    if (hours >= 24 || minutes >= 60 || seconds >= 60 || centiseconds >= 1000) {
        throw new Error('Invalid time values');
    }

    // Convert to Clarion integer format
    return hours * 360000 + minutes * 6000 + seconds * 100 + centiseconds;
}

/**
 * Gets the current Clarion clock value (centiseconds since midnight)
 * @returns Number of centiseconds since midnight
 */
export function clarionClock(): number {
    // Get current date and midnight
    const today = new Date();
    const midnight = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0,
        0
    );

    // Calculate milliseconds since midnight
    const millisecondsPassed = today.getTime() - midnight.getTime();

    // Convert to centiseconds and add 1 (Clarion offset)
    // Division by 10 converts milliseconds to centiseconds
    return Math.floor(millisecondsPassed / 10 + 1);
}


/**
 * Converts a JavaScript Date object to a Clarion date integer
 * @param date - JavaScript Date object
 * @returns Number of days since December 28, 1800 (Clarion date format)
 */
export function clarionDateToInt(date: Date): number {
    // Clone the input date to avoid modifying it
    const inputDate = new Date(date);
    
    // Set time to noon to avoid daylight saving time issues
    inputDate.setHours(12, 0, 0, 0);
    CLARION_EPOCH.setHours(12, 0, 0, 0);
    
    // Calculate days difference
    const diffTime = inputDate.getTime() - CLARION_EPOCH.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

/**
 * Converts a Clarion date integer to a JavaScript Date object
 * @param days - Number of days since December 28, 1800 (Clarion date format)
 * @returns JavaScript Date object
 */
export function clarionIntToDate(days: number): Date {
    // Create new date to avoid modifying the epoch constant
    const resultDate = new Date(CLARION_EPOCH);
    
    // Set to noon to avoid daylight saving time issues
    resultDate.setHours(12, 0, 0, 0);
    
    // Add the days
    resultDate.setDate(CLARION_EPOCH.getDate() + days);
    
    return resultDate;
}

/**
 * Converts a date string to a Clarion date integer
 * @param dateStr - Date string in format "YYYY-MM-DD" or "MM/DD/YYYY"
 * @returns Number of days since December 28, 1800 (Clarion date format)
 * @throws Error if the date string format is invalid
 */
export function clarionDateStringToInt(dateStr: string): number {
    // Regular expressions for supported date formats
    const isoFormatRegex = /^(\d{4})-(\d{2})-(\d{2})$/;  // YYYY-MM-DD
    const usFormatRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/; // MM/DD/YYYY
    
    let year: number;
    let month: number;
    let day: number;
    
    const isoMatch = dateStr.match(isoFormatRegex);
    const usMatch = dateStr.match(usFormatRegex);
    
    if (isoMatch) {
        [, year, month, day] = isoMatch.map(Number);
        month--; // JavaScript months are 0-based
    } else if (usMatch) {
        [, month, day, year] = usMatch.map(Number);
        month--; // JavaScript months are 0-based
    } else {
        throw new Error('Invalid date format. Expected YYYY-MM-DD or MM/DD/YYYY');
    }
    
    // Validate date components
    if (month < 0 || month > 11 || day < 1 || day > 31 || year < 1800) {
        throw new Error('Invalid date values');
    }
    
    const date = new Date(year, month, day);
    
    // Check if the date is valid
    if (date.getMonth() !== month || date.getDate() !== day) {
        throw new Error('Invalid date');
    }
    
    return clarionDateToInt(date);
}

/**
 * Converts a Clarion date integer to a formatted date string
 * @param days - Number of days since December 28, 1800 (Clarion date format)
 * @param format - Output format ('iso' for YYYY-MM-DD or 'us' for MM/DD/YYYY)
 * @returns Formatted date string
 */
export function clarionIntToDateString(days: number, format: 'iso' | 'us' = 'iso'): string {
    const date = clarionIntToDate(days);
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return format === 'iso' 
        ? `${year}-${month}-${day}`
        : `${month}/${day}/${year}`;
}
