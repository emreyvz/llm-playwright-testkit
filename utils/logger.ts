import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logsDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const { combine, timestamp, printf, colorize, align, json, splat } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, service, ...metadata }) => {
  let msg = `${ts} [${service || 'app'}] ${level}: ${message} `;
  if (metadata && Object.keys(metadata).length > 0) {
    if (typeof metadata === 'object') {
      try {
        JSON.stringify(metadata);
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

const consoleTransport = new winston.transports.Console({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    align(),
    splat(),
    logFormat
  ),
  handleExceptions: true,
});

const fileTransportAll = new winston.transports.File({
  level: 'debug',
  filename: path.join(logsDir, 'app-all.log'),
  format: combine(timestamp(), json(), splat()),
  maxsize: 5242880, // 5MB
  maxFiles: 5,
  tailable: true,
  handleExceptions: true,
});

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
  exitOnError: false,
  defaultMeta: { service: 'test-automation-framework' },
});

export default logger;
