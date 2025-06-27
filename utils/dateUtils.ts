export class DateUtils {
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

  static getCurrentTimestampForFilename(): string {
    return this.formatDate(new Date(), 'YYYY-MM-DD_HH-mm-ss');
  }

  static addDays(date: Date | string, days: number): Date {
    const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
    if (isNaN(d.getTime())) {
      throw new Error('Invalid date provided to addDays');
    }
    d.setDate(d.getDate() + days);
    return d;
  }
}
