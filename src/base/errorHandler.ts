import logger from '@utils/logger'; // Corrected path

export enum ErrorType {
  UI_ERROR = 'UIError',
  API_ERROR = 'APIError',
  LLM_ERROR = 'LLMError',
  VALIDATION_ERROR = 'ValidationError',
  CONFIG_ERROR = 'ConfigError',
  TIMEOUT_ERROR = 'TimeoutError',
  GENERIC_ERROR = 'GenericError',
}

export interface CustomErrorDetails {
  message: string;
  type: ErrorType;
  cause?: any; // Original error object or additional details
  context?: Record<string, any>; // Additional context for debugging
  isOperational?: boolean; // True if the error is expected (e.g., validation error)
}

export class CustomError extends Error {
  public readonly type: ErrorType;
  public readonly cause?: any;
  public readonly context?: Record<string, any>;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(details: CustomErrorDetails) {
    super(details.message);
    this.name = details.type; // Set the error name to its type
    this.type = details.type;
    this.cause = details.cause;
    this.context = details.context;
    this.isOperational = details.isOperational || false;
    this.timestamp = new Date().toISOString();

    // This line is needed to restore the correct prototype chain.
    Object.setPrototypeOf(this, new.target.prototype);

    // Capturing the stack trace, excluding the constructor call from it.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ErrorHandler {
  public static handle(error: Error | CustomError | any, defaultErrorType: ErrorType = ErrorType.GENERIC_ERROR): CustomError {
    let customError: CustomError;

    if (error instanceof CustomError) {
      customError = error;
    } else if (error instanceof Error) {
      // Check for specific error types based on message or name if needed
      let type = defaultErrorType;
      if (error.name === 'TimeoutError' || error.message.toLowerCase().includes('timeout')) {
        type = ErrorType.TIMEOUT_ERROR;
      }
      // Add more specific error type detection here if needed

      customError = new CustomError({
        message: error.message,
        type: type,
        cause: error,
        context: { stack: error.stack },
        isOperational: false, // Assume non-operational if it's a generic Error
      });
    } else {
      // For non-Error objects (e.g., strings or other primitives thrown)
      customError = new CustomError({
        message: typeof error === 'string' ? error : 'An unknown error occurred.',
        type: defaultErrorType,
        cause: error,
        isOperational: false,
      });
    }

    this.logError(customError);
    return customError; // Optionally re-throw or return the processed error
  }

  public static logError(error: CustomError): void {
    const logObject = {
      type: error.type,
      message: error.message,
      timestamp: error.timestamp,
      isOperational: error.isOperational,
      stack: error.stack,
      cause: error.cause ? (error.cause instanceof Error ? { name: error.cause.name, message: error.cause.message, stack: error.cause.stack } : error.cause) : undefined,
      context: error.context,
    };

    // Use logger (Winston)
    if (error.isOperational) {
      logger.warn(`Operational Error: ${error.type} - ${error.message}`, logObject);
    } else {
      logger.error(`Critical Error: ${error.type} - ${error.message}`, logObject);
    }
  }

  // Convenience method to create and log/throw an error
  public static newError(details: CustomErrorDetails, throwError: boolean = false): CustomError {
    const error = new CustomError(details);
    this.logError(error);
    if (throwError) {
      throw error;
    }
    return error;
  }
}

// Example Usage:
// try {
//   // Some operation that might fail
//   throw new Error("Something went wrong in UI interaction");
// } catch (err) {
//   const handledError = ErrorHandler.handle(err, ErrorType.UI_ERROR);
//   // console.error("Caught handled error:", handledError.message);
//   // Decide whether to re-throw, or if logging is enough
// }

// ErrorHandler.newError({
//   message: "LLM failed to respond as expected",
//   type: ErrorType.LLM_ERROR,
//   context: { prompt: "some prompt" },
//   isOperational: true
// }, true); // This will create, log, and throw the error
