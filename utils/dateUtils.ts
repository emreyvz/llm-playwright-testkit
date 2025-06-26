/**
 * Date Utility Functions
 */
export class DateUtils {
  /**
   * Formats a Date object or a date string into a specified string format.
   * @param date The date to format (Date object, or string parsable by Date constructor).
   * @param format The desired format string (e.g., 'YYYY-MM-DD HH:mm:ss').
   *               Supported tokens: YYYY, YY, MM, DD, HH, hh, mm, ss, A (for AM/PM).
   * @returns The formatted date string.
   */
  static formatDate(date: Date | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) {
      throw new Error('Invalid date provided to formatDate');
    }

    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();

    let formattedString = format;

    formattedString = formattedString.replace(/YYYY/g, year.toString());
    formattedString = formattedString.replace(/YY/g, (year % 100).toString().padStart(2, '0'));
    formattedString = formattedString.replace(/MM/g, month.toString().padStart(2, '0'));
    formattedString = formattedString.replace(/DD/g, day.toString().padStart(2, '0'));
    formattedString = formattedString.replace(/HH/g, hours.toString().padStart(2, '0'));
    formattedString = formattedString.replace(/hh/g, (hours % 12 || 12).toString().padStart(2, '0'));
    formattedString = formattedString.replace(/mm/g, minutes.toString().padStart(2, '0'));
    formattedString = formattedString.replace(/ss/g, seconds.toString().padStart(2, '0'));
    formattedString = formattedString.replace(/A/g, hours < 12 ? 'AM' : 'PM');

    return formattedString;
  }

  /**
   * Gets the current date and time formatted as 'YYYY-MM-DD_HH-mm-ss'.
   * Useful for creating unique filenames or timestamps.
   * @returns The formatted current timestamp string.
   */
  static getCurrentTimestampForFilename(): string {
    return this.formatDate(new Date(), 'YYYY-MM-DD_HH-mm-ss');
  }

  /**
   * Adds a specified number of days to a date.
   * @param date The starting date (Date object or string).
   * @param days The number of days to add (can be negative to subtract).
   * @returns A new Date object with the days added.
   */
  static addDays(date: Date | string, days: number): Date {
    const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
    if (isNaN(d.getTime())) {
      throw new Error('Invalid date provided to addDays');
    }
    d.setDate(d.getDate() + days);
    return d;
  }
}

// Example Usage:
// import { DateUtils } from './dateUtils';
// console.log(DateUtils.formatDate(new Date())); // Uses default format
// console.log(DateUtils.formatDate(new Date(), 'MM/DD/YY hh:mm A'));
// console.log(DateUtils.getCurrentTimestampForFilename());
// console.log(DateUtils.addDays(new Date(), 5));
// console.log(DateUtils.addDays('2023-01-01', -10));
