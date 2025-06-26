import fs from 'fs';
import path from 'path';
import { Page, Locator } from '@playwright/test';
import logger from '../utils/logger';
import { ErrorHandler, ErrorType } from './errorHandler';

const locatorsDir = path.join(__dirname, '../locators');

interface LocatorStore {
  [pageName: string]: {
    [elementName: string]: string;
  };
}

let loadedLocators: LocatorStore = {};

function loadLocators(): void {
  if (Object.keys(loadedLocators).length > 0) {
    logger.debug('Locators already loaded. Skipping reload.');
    return;
  }

  try {
    logger.info('Loading locators from JSON files...');
    const files = fs.readdirSync(locatorsDir);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const filePath = path.join(locatorsDir, file);
        try {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const pageLocators = JSON.parse(fileContent);
          Object.assign(loadedLocators, pageLocators);
          logger.debug(`Successfully loaded and parsed locators from ${file}.`);
        } catch (parseError: any) {
          ErrorHandler.newError({
            message: `Failed to parse JSON from locator file: ${file}`,
            type: ErrorType.CONFIG_ERROR,
            cause: parseError,
            context: { filePath }
          });
        }
      }
    });
    logger.info('Finished loading locators.');
  } catch (error: any) {
    ErrorHandler.newError({
      message: 'A critical error occurred while trying to read locator files.',
      type: ErrorType.CONFIG_ERROR,
      cause: error,
      context: { locatorsDir }
    }, true);
  }
}

loadLocators();

export function getLocatorString(pageName: string, elementName: string): string {
  const page = loadedLocators[pageName];
  if (!page) {
    throw new Error(`Locators for page "${pageName}" not found. Ensure it's defined in a JSON file under src/locators and the JSON root key matches the pageName.`);
  }
  const locatorString = page[elementName];
  if (!locatorString) {
    throw new Error(`Locator "${elementName}" not found on page "${pageName}".`);
  }
  return locatorString;
}

export function getLocator(
  page: Page,
  pageName: string,
  elementName: string,
  options?: {
    hasText?: string | RegExp;
    hasNotText?: string | RegExp;
    has?: Locator;
    hasNot?: Locator;
    nth?: number;
  }
): Locator {
  const locatorString = getLocatorString(pageName, elementName);
  let finalLocator: Locator;

  if (options?.nth !== undefined) {
    finalLocator = page.locator(locatorString).nth(options.nth);
  } else {
    finalLocator = page.locator(locatorString, options as any);
  }
  return finalLocator;
}

export function getDynamicLocator(
  page: Page,
  pageName: string,
  elementName: string,
  replacements: Record<string, string | number>
): Locator {
  let locatorString = getLocatorString(pageName, elementName);
  for (const key in replacements) {
    const regex = new RegExp(`\\\$\\\{${key}\\\}`, 'g');
    locatorString = locatorString.replace(regex, String(replacements[key]));
  }
  return page.locator(locatorString);
}

export function ensureLocatorsLoaded() {
    if (Object.keys(loadedLocators).length === 0) {
        loadLocators();
    }
}

ensureLocatorsLoaded();
