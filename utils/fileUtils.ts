import fs from 'fs';
import path from 'path';
import logger from './logger';
import { ErrorHandler, ErrorType } from '../base/errorHandler'; // Corrected path

export class FileUtils {
  /**
   * Reads the content of a file.
   * @param filePath The path to the file.
   * @param encoding The encoding to use (default: 'utf-8').
   * @returns The file content as a string, or null if an error occurs.
   */
  static readFile(filePath: string, encoding: BufferEncoding = 'utf-8'): string | null {
    try {
      logger.debug(`Reading file: ${filePath}`);
      return fs.readFileSync(filePath, encoding);
    } catch (error: any) {
      logger.error(`Error reading file ${filePath}: ${error.message}`, { stack: error.stack });
      ErrorHandler.handle(error, ErrorType.GENERIC_ERROR); // Or a specific FileError type
      return null;
    }
  }

  /**
   * Writes content to a file. Creates the directory if it doesn't exist.
   * @param filePath The path to the file.
   * @param content The content to write.
   * @param encoding The encoding to use (default: 'utf-8').
   * @returns True if successful, false otherwise.
   */
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
      logger.error(`Error writing file ${filePath}: ${error.message}`, { stack: error.stack });
      ErrorHandler.handle(error, ErrorType.GENERIC_ERROR);
      return false;
    }
  }

  /**
   * Deletes a file.
   * @param filePath The path to the file.
   * @returns True if successful or file doesn't exist, false if an error occurs.
   */
  static deleteFile(filePath: string): boolean {
    try {
      if (fs.existsSync(filePath)) {
        logger.debug(`Deleting file: ${filePath}`);
        fs.unlinkSync(filePath);
        return true;
      }
      logger.warn(`File not found for deletion, skipping: ${filePath}`);
      return true; // Considered success if file doesn't exist
    } catch (error: any) {
      logger.error(`Error deleting file ${filePath}: ${error.message}`, { stack: error.stack });
      ErrorHandler.handle(error, ErrorType.GENERIC_ERROR);
      return false;
    }
  }

  /**
   * Checks if a file or directory exists.
   * @param itemPath The path to the file or directory.
   * @returns True if it exists, false otherwise.
   */
  static exists(itemPath: string): boolean {
    return fs.existsSync(itemPath);
  }

  /**
   * Creates a directory if it doesn't already exist.
   * @param dirPath The path to the directory.
   * @returns True if directory was created or already exists, false on error.
   */
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
      logger.error(`Error creating directory ${dirPath}: ${error.message}`, { stack: error.stack });
      ErrorHandler.handle(error, ErrorType.GENERIC_ERROR);
      return false;
    }
  }
}

// Example Usage (requires ErrorHandler and ErrorType to be defined and accessible)
// import { FileUtils } from './fileUtils';
// import { ErrorHandler, ErrorType } from '../base/errorHandler'; // Adjust path as needed
//
// const testFilePath = path.join(__dirname, '../../test-data/sample.txt');
// const testDirPath = path.join(__dirname, '../../test-data/newDir');
//
// FileUtils.ensureDirectoryExists(testDirPath);
// FileUtils.writeFile(testFilePath, 'Hello, Jules!');
// console.log(FileUtils.readFile(testFilePath));
// console.log(FileUtils.exists(testFilePath));
// FileUtils.deleteFile(testFilePath);
// console.log(FileUtils.exists(testFilePath));
