/**
 * String Utility Functions
 */
export class StringUtils {
  /**
   * Capitalizes the first letter of a string.
   * @param str The input string.
   * @returns The string with the first letter capitalized.
   */
  static capitalizeFirstLetter(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Generates a random string of a specified length.
   * @param length The desired length of the random string.
   * @param characters The set of characters to use for generation (default: Alphanumeric).
   * @returns A random string.
   */
  static generateRandomString(length: number, characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  /**
   * Truncates a string to a maximum length and appends an ellipsis if truncated.
   * @param str The input string.
   * @param maxLength The maximum length of the string (including ellipsis).
   * @param ellipsis The ellipsis string to append (default: '...').
   * @returns The truncated string.
   */
  static truncate(str: string, maxLength: number, ellipsis: string = '...'): string {
    if (!str || str.length <= maxLength) {
      return str;
    }
    if (ellipsis.length >= maxLength) {
        return ellipsis.substring(0, maxLength);
    }
    return str.substring(0, maxLength - ellipsis.length) + ellipsis;
  }

  /**
   * Checks if a string is null, undefined, or empty.
   * @param str The string to check.
   * @returns True if the string is null, undefined, or empty, false otherwise.
   */
  static isNullOrEmpty(str: string | null | undefined): boolean {
    return str === null || str === undefined || str.trim() === '';
  }

  /**
   * Checks if a string is null, undefined, or consists only of whitespace characters.
   * @param str The string to check.
   * @returns True if the string is null, undefined, or whitespace, false otherwise.
   */
  static isNullOrWhitespace(str: string | null | undefined): boolean {
    return str === null || str === undefined || str.trim() === '';
  }

  /**
   * Replaces all occurrences of a substring with another substring.
   * @param originalString The original string.
   * @param find The substring to replace.
   * @param replaceWith The substring to replace with.
   * @returns The new string with replacements.
   */
  static replaceAll(originalString: string, find: string, replaceWith: string): string {
    if (!originalString) return originalString;
    // Using RegExp with global flag for robust replacement
    // Escape special characters in 'find' string for RegExp
    const escapedFind = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return originalString.replace(new RegExp(escapedFind, 'g'), replaceWith);
  }
}

// Example Usage:
// import { StringUtils } from './stringUtils';
// console.log(StringUtils.capitalizeFirstLetter('hello'));
// console.log(StringUtils.generateRandomString(10));
// console.log(StringUtils.truncate('This is a very long string', 10));
// console.log(StringUtils.isNullOrEmpty(null));
// console.log(StringUtils.isNullOrEmpty('  '));
// console.log(StringUtils.replaceAll("hello world, hello universe", "hello", "hi"));
