import logger from '../utils/logger';

export enum ErrorType {
  UI_ERROR = 'UIError',
  API_ERROR = 'APIError',
  LLM_ERROR = 'LLMError',
  VALIDATION_ERROR = 'ValidationError',
  CONFIG_ERROR = 'ConfigError',
  TIMEOUT_ERROR = 'TimeoutError',
  GENERIC_ERROR = 'GenericError',
  NAVIGATION_ERROR = 'NAVIGATION_ERROR',
  UI_ACTION_ERROR = 'UI_ACTION_ERROR',
  UI_QUERY_ERROR = 'UI_QUERY_ERROR',
  JAVASCRIPT_ERROR = 'JAVASCRIPT_ERROR',
  DIALOG_ERROR = 'DIALOG_ERROR',
  FRAME_ERROR = 'FRAME_ERROR',
  PAGE_ERROR = 'PAGE_ERROR',
  IO_ERROR = 'IO_ERROR',
  WAIT_ERROR = 'WAIT_ERROR',
  FILE_ERROR = 'FILE_ERROR',
  SECURITY_ERROR = 'SECURITY_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  INTEGRATION_ERROR = 'INTEGRATION_ERROR',
  CAPTCHA_ERROR = 'CAPTCHA_ERROR',
  ASSERTION_ERROR = 'ASSERTION_ERROR',
  
}

export interface CustomErrorDetails {
  message: string;
  type: ErrorType;
  cause?: any;
  context?: Record<string, any>;
  isOperational?: boolean;
}

export class CustomError extends Error {
  public readonly type: ErrorType;
  public readonly cause?: any;
  public readonly context?: Record<string, any>;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(details: CustomErrorDetails) {
    super(details.message);
    this.name = details.type;
    this.type = details.type;
    this.cause = details.cause;
    this.context = details.context;
    this.isOperational = details.isOperational || false;
    this.timestamp = new Date().toISOString();

    Object.setPrototypeOf(this, new.target.prototype);

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
      let type = defaultErrorType;
      if (error.name === 'TimeoutError' || error.message.toLowerCase().includes('timeout')) {
        type = ErrorType.TIMEOUT_ERROR;
      }

      customError = new CustomError({
        message: error.message,
        type: type,
        cause: error,
        context: { stack: error.stack },
        isOperational: false,
      });
    } else {
      customError = new CustomError({
        message: typeof error === 'string' ? error : 'An unknown error occurred.',
        type: defaultErrorType,
        cause: error,
        isOperational: false,
      });
    }

    this.logError(customError);
    return customError;
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

    if (error.isOperational) {
      logger.warn(`Operational Error: ${error.type} - ${error.message}`, logObject);
    } else {
      logger.error(`Critical Error: ${error.type} - ${error.message}`, logObject);
    }
  }

  public static newError(details: CustomErrorDetails, throwError: boolean = false): CustomError {
    const error = new CustomError(details);
    this.logError(error);
    if (throwError) {
      throw error;
    }
    return error;
  }
}
