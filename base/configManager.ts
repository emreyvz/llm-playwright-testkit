import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';

export class ConfigManager {
  private static instance: ConfigManager;

  public readonly BASE_URL: string;
  public readonly API_BASE_URL: string;
  public readonly USERNAME?: string;
  public readonly PASSWORD?: string;
  public readonly LLM_API_KEY?: string;
  public readonly LLM_ENDPOINT?: string;
  public readonly LLM_PROVIDER?: string;
  public readonly LOCAL_LLM_MODEL_NAME?: string;
  public readonly OPENAI_MODEL_NAME?: string;
  public readonly CAPTCHA_SOLVER_ENABLED: boolean;
  public readonly DEFAULT_TIMEOUT: number;
  public readonly DEFAULT_RETRY_ATTEMPTS: number;
  public readonly NODE_ENV: string;
  public readonly BROWSER_LAUNCH_ARGS?: string[];
  public readonly VIEWPORT_WIDTH?: number;
  public readonly VIEWPORT_HEIGHT?: number;

  private constructor() {
    this.NODE_ENV = process.env.NODE_ENV || 'development';
    const envFileName = `.env.${this.NODE_ENV}`;
    const envDirPath = path.resolve(__dirname, '../environments');
    const envFilePath = path.join(envDirPath, envFileName);
    const defaultEnvPath = path.join(envDirPath, '.env');

    if (fs.existsSync(envFilePath)) {
      dotenv.config({ path: envFilePath });
      logger.info(`Loaded configuration from: ${envFilePath}`);
    } else if (fs.existsSync(defaultEnvPath)) {
      dotenv.config({ path: defaultEnvPath });
      logger.info(`Specific environment file ${envFileName} not found. Loaded configuration from: ${defaultEnvPath}`);
    } else {
      logger.warn(
        `No .env file found at ${envFilePath} or ${defaultEnvPath}. Using default process.env variables or hardcoded defaults.`
      );
      const exampleEnvPath = path.join(envDirPath, '.env.example');
      if (fs.existsSync(exampleEnvPath)) {
          logger.info(`Attempting to load defaults from ${exampleEnvPath} as a last resort.`);
          dotenv.config({ path: exampleEnvPath });
      } else {
        logger.warn(`.env.example not found either. Critical settings might be missing.`);
      }
    }

    this.BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
    this.API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080/api';
    this.USERNAME = process.env.USERNAME;
    this.PASSWORD = process.env.PASSWORD;
    this.LLM_API_KEY = process.env.LLM_API_KEY;
    this.LLM_ENDPOINT = process.env.LLM_ENDPOINT;
    this.LLM_PROVIDER = process.env.LLM_PROVIDER || 'local';
    this.LOCAL_LLM_MODEL_NAME = process.env.LOCAL_LLM_MODEL_NAME || 'llama2';
    this.OPENAI_MODEL_NAME = process.env.OPENAI_MODEL_NAME || 'gpt-3.5-turbo';
    this.CAPTCHA_SOLVER_ENABLED = process.env.CAPTCHA_SOLVER_ENABLED === 'true';
    this.DEFAULT_TIMEOUT = parseInt(process.env.DEFAULT_TIMEOUT || '30000', 10);
    this.DEFAULT_RETRY_ATTEMPTS = parseInt(process.env.DEFAULT_RETRY_ATTEMPTS || '2', 10);

    this.BROWSER_LAUNCH_ARGS = process.env.BROWSER_LAUNCH_ARGS
      ? process.env.BROWSER_LAUNCH_ARGS.split(',').map(arg => arg.trim())
      : undefined;
    this.VIEWPORT_WIDTH = process.env.VIEWPORT_WIDTH ? parseInt(process.env.VIEWPORT_WIDTH, 10) : undefined;
    this.VIEWPORT_HEIGHT = process.env.VIEWPORT_HEIGHT ? parseInt(process.env.VIEWPORT_HEIGHT, 10) : undefined;

    logger.info('Configuration loaded.', {
      NODE_ENV: this.NODE_ENV,
      BASE_URL: this.BASE_URL,
      API_BASE_URL: this.API_BASE_URL,
      LLM_PROVIDER: this.LLM_PROVIDER,
      CAPTCHA_SOLVER_ENABLED: this.CAPTCHA_SOLVER_ENABLED,
    });
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public isDevelopment(): boolean {
    return this.NODE_ENV === 'development';
  }

  public isStaging(): boolean {
    return this.NODE_ENV === 'staging';
  }

  public isProduction(): boolean {
    return this.NODE_ENV === 'production';
  }
}

export const config = ConfigManager.getInstance();
