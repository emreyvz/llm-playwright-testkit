import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { config } from '../base/configManager';
import logger from '../utils/logger'; // Import the logger
import { ErrorHandler } from '../base/errorHandler';
import { ErrorType } from '../base/errorHandler';
import { CustomError } from '../base/errorHandler';


interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  data?: T;
  error?: string;
  headers?: any;
}

export class ApiClient {
  private httpClient: AxiosInstance;
  private authToken?: string;

  constructor(baseURL: string = config.API_BASE_URL) {
    if (!baseURL) {
      logger.warn('API_BASE_URL is not defined in configuration. APIClient may not work as expected for relative paths.');
    }
    this.httpClient = axios.create({
      baseURL: baseURL,
      timeout: config.DEFAULT_TIMEOUT || 30000,
      headers: {
        'Content-Type': 'application/json',
        // Add other common headers here
      },
    });

    // Interceptors can be used for logging or modifying requests/responses globally
    this.initializeInterceptors();
  }

  private initializeInterceptors() {
    this.httpClient.interceptors.request.use(
      (axiosConfig: any) => {
        const method = axiosConfig.method?.toUpperCase();
        const fullUrl = `${axiosConfig.baseURL || ''}${axiosConfig.url || ''}`;
        logger.info(`API Request: ${method} ${fullUrl}`, {
          headers: axiosConfig.headers,
          payload: axiosConfig.data,
        });

        if (this.authToken) {
          axiosConfig.headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        return axiosConfig;
      },
      (error: AxiosError) => {
        ErrorHandler.handle(error, ErrorType.API_ERROR);
        return Promise.reject(error);
      }
    );

    this.httpClient.interceptors.response.use(
      (response: AxiosResponse) => {
        logger.info(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          // headers: response.headers, // Can be too verbose
          data: response.data,
        });
        return response;
      },
      (error: AxiosError) => {
        // The error will be caught by the handleRequest method's catch block.
        // Logging the raw error here can be redundant if handleRequest also logs.
        // However, this is a good place for generic interceptor-level error logging if needed.
        // For instance, if the error is not an AxiosError or doesn't have a response.
        if (!error.isAxiosError) {
             ErrorHandler.handle(error, ErrorType.API_ERROR);
        }
        return Promise.reject(error);
      }
    );
  }

  public setAuthToken(token: string): void {
    this.authToken = token;
    logger.info('Auth token set for APIClient.');
  }

  public clearAuthToken(): void {
    this.authToken = undefined;
    logger.info('Auth token cleared for APIClient.');
  }

  private async handleRequest<T>(requestPromise: Promise<AxiosResponse<T>>): Promise<ApiResponse<T>> {
    try {
      const response = await requestPromise;
      return {
        success: true,
        status: response.status,
        data: response.data,
        headers: response.headers,
      };
    } catch (error: any) {
      const handledError = ErrorHandler.handle(error, ErrorType.API_ERROR);
      return {
        success: false,
        status: (error.isAxiosError && error.response?.status) || 0,
        error: handledError.message,
        data: (error.isAxiosError && error.response?.data) || undefined,
      };
    }
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(this.httpClient.get<T>(url, config));
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(this.httpClient.post<T>(url, data, config));
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(this.httpClient.put<T>(url, data, config));
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(this.httpClient.delete<T>(url, config));
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(this.httpClient.patch<T>(url, data, config));
  }

  // Basic validation example (can be expanded)
  public validateResponse<T>(
    response: ApiResponse<T>,
    expectedStatus: number,
    schema?: any // Optional: Joi schema or similar for payload validation
  ): boolean {
    if (response.status !== expectedStatus) {
      ErrorHandler.newError({
        message: `Response validation failed: Expected status ${expectedStatus}, got ${response.status}. Error: ${response.error}`,
        type: ErrorType.VALIDATION_ERROR,
        context: { responseStatus: response.status, expectedStatus, responseError: response.error, responseData: response.data },
        isOperational: true,
      });
      return false;
    }

    if (schema && response.data) {
      // Example with a generic schema validation function (you'd need to implement this)
      // const { error: schemaError } = validateWithSchema(response.data, schema);
      // if (schemaError) {
      //   ErrorHandler.newError({
      //     message: `Response payload validation failed: ${schemaError.message}`,
      //     type: ErrorType.VALIDATION_ERROR,
      //     context: { errors: schemaError.details, data: response.data },
      //     isOperational: true,
      //   });
      //   return false;
      // }
      logger.debug("Schema validation would happen here if a schema and validation function were provided.", { data: response.data });
    }

    logger.info(`Response status ${response.status} validated successfully.`);
    return true;
  }
}

// Example Usage:
// (async () => {
//   const apiClient = new ApiClient(); // Uses API_BASE_URL from config
//   // apiClient.setAuthToken('your_jwt_token_here');
//
//   const usersResponse = await apiClient.get('/users');
//   if (usersResponse.success && apiClient.validateResponse(usersResponse, 200)) {
//     console.log('Users:', usersResponse.data);
//   } else {
//     console.error('Failed to fetch users or validation failed.');
//   }
//
//   const newUser = { name: 'Jules Verne', job: 'Author' };
//   const createUserResponse = await apiClient.post('/users', newUser);
//   if (createUserResponse.success && apiClient.validateResponse(createUserResponse, 201)) {
//     console.log('Created User:', createUserResponse.data);
//   } else {
//     console.error('Failed to create user or validation failed.');
//   }
// })();
