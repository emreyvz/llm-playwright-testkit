export class StringUtils {
  static capitalizeFirstLetter(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static generateRandomString(length: number, characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  static truncate(str: string, maxLength: number, ellipsis: string = '...'): string {
    if (!str || str.length <= maxLength) {
      return str;
    }
    if (ellipsis.length >= maxLength) {
        return ellipsis.substring(0, maxLength);
    }
    return str.substring(0, maxLength - ellipsis.length) + ellipsis;
  }

  static isNullOrEmpty(str: string | null | undefined): boolean {
    return str === null || str === undefined || str.trim() === '';
  }

  static isNullOrWhitespace(str: string | null | undefined): boolean {
    return str === null || str === undefined || str.trim() === '';
  }

  static replaceAll(originalString: string, find: string, replaceWith: string): string {
    if (!originalString) return originalString;
    const escapedFind = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return originalString.replace(new RegExp(escapedFind, 'g'), replaceWith);
  }
}
