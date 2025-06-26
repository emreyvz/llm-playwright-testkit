import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logsDir = path.join(__dirname, '../../logs'); // Place logs directory in project root

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const { combine, timestamp, printf, colorize, align, json, splat } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp: ts, service, ...metadata }) => {
  let msg = `${ts} [${service || 'app'}] ${level}: ${message} `;
  if (metadata && Object.keys(metadata).length > 0) {
    // Only stringify if metadata is not already a string (to avoid double quotes)
    if (typeof metadata === 'object') {
      try {
        // Check for circular references before stringifying
        JSON.stringify(metadata); // Test for circularity
        msg += JSON.stringify(metadata);
      } catch (e) {
        msg += "{ Error: Could not stringify metadata due to circular reference or other issue }";
      }
    } else {
      msg += metadata;
    }
  }
  return msg;
});

// Console transport with colorization
const consoleTransport = new winston.transports.Console({
  level: process.env.LOG_LEVEL || 'info', // Default to info, can be set via env var
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    align(),
    splat(), // Enables string interpolation e.g. logger.info('User %s logged in', 'Alice');
    logFormat
  ),
  handleExceptions: true, // Log unhandled exceptions
});

// File transport for all logs
const fileTransportAll = new winston.transports.File({
  level: 'debug', // Log everything from debug level up to file
  filename: path.join(logsDir, 'app-all.log'),
  format: combine(timestamp(), json(), splat()),
  maxsize: 5242880, // 5MB
  maxFiles: 5, // Keep up to 5 log files
  tailable: true,
  handleExceptions: true,
});

// File transport for error logs only
const fileTransportError = new winston.transports.File({
  level: 'error',
  filename: path.join(logsDir, 'app-error.log'),
  format: combine(timestamp(), json(), splat()),
  maxsize: 5242880, // 5MB
  maxFiles: 3,
  tailable: true,
  handleExceptions: true,
});

const logger = winston.createLogger({
  transports: [
    consoleTransport,
    fileTransportAll,
    fileTransportError,
  ],
  exitOnError: false, // Do not exit on handled exceptions
  defaultMeta: { service: 'test-automation-framework' }, // Default service tag
});

// Stream for morgan (HTTP request logger for Express, if used)
// export const stream = {
//   write: (message: string) => {
//     logger.info(message.trim());
//   },
// };

// Override console.log, console.error etc. to use Winston (Optional)
// This can be useful for capturing logs from third-party libraries that use console.log
// Be cautious with this approach in larger applications or libraries.
// console.log = (...args: any[]) => logger.info.call(logger, ...args);
// console.info = (...args: any[]) => logger.info.call(logger, ...args);
// console.warn = (...args: any[]) => logger.warn.call(logger, ...args);
// console.error = (...args: any[]) => logger.error.call(logger, ...args);
// console.debug = (...args: any[]) => logger.debug.call(logger, ...args);

export default logger;

// Example Usage:
// import logger from './logger';
// logger.info('This is an info message');
// logger.error('This is an error message', { errorDetails: 'Something went wrong' });
// logger.debug('This is a debug message with object:', { key: 'value' });
// logger.warn('A warning occurred: %s', 'Disk space low');
