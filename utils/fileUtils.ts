import fs from 'fs';
import path from 'path';
import logger from './logger';
import { ErrorHandler, ErrorType } from '../base/errorHandler';

export class FileUtils {
  static readFile(filePath: string, encoding: BufferEncoding = 'utf-8'): string | null {
    try {
      logger.debug(`Reading file: ${filePath}`);
      return fs.readFileSync(filePath, encoding);
    } catch (error: any) {
      logger.error(`Error reading file ${filePath}: ${error.message}`);
      ErrorHandler.handle(error, ErrorType.GENERIC_ERROR);
      return null;
    }
  }

  static writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf-8'): boolean {
    try {
      logger.debug(`Writing file: ${filePath}`);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.debug(`Created directory: ${dir}`);
      }
      fs.writeFileSync(filePath, content, encoding);
      return true;
    } catch (error: any) {
      logger.error(`Error writing file ${filePath}: ${error.message}`);
      ErrorHandler.handle(error, ErrorType.GENERIC_ERROR);
      return false;
    }
  }

  static deleteFile(filePath: string): boolean {
    try {
      if (fs.existsSync(filePath)) {
        logger.debug(`Deleting file: ${filePath}`);
        fs.unlinkSync(filePath);
        return true;
      }
      logger.warn(`File not found for deletion, skipping: ${filePath}`);
      return true;
    } catch (error: any) {
      logger.error(`Error deleting file ${filePath}: ${error.message}`);
      ErrorHandler.handle(error, ErrorType.GENERIC_ERROR);
      return false;
    }
  }

  static exists(itemPath: string): boolean {
    return fs.existsSync(itemPath);
  }

  static ensureDirectoryExists(dirPath: string): boolean {
    try {
      if (!fs.existsSync(dirPath)) {
        logger.debug(`Creating directory: ${dirPath}`);
        fs.mkdirSync(dirPath, { recursive: true });
      } else {
        logger.debug(`Directory already exists: ${dirPath}`);
      }
      return true;
    } catch (error: any) {
      logger.error(`Error creating directory ${dirPath}: ${error.message}`);
      ErrorHandler.handle(error, ErrorType.GENERIC_ERROR);
      return false;
    }
  }
}
