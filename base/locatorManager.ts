import fs from 'fs';
import path from 'path';
import { Page, Locator } from '@playwright/test';
import logger from '../utils/logger'; // Import logger
import { ErrorHandler, ErrorType } from './errorHandler'; // Import ErrorHandler

const locatorsDir = path.join(__dirname, '../locators'); // Adjust path as necessary

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
          // Continue loading other files if one fails to parse
        }
      }
    });
    logger.info('Finished loading locators.');
  } catch (error: any) {
    // This catch is for fs.readdirSync or other unexpected errors during the loading process itself
    ErrorHandler.newError({
      message: 'A critical error occurred while trying to read locator files.',
      type: ErrorType.CONFIG_ERROR,
      cause: error,
      context: { locatorsDir }
    }, true); // Throw this as it's a fundamental issue
  }
}

// Load locators when this module is imported
loadLocators();

/**
 * Retrieves a locator string from the loaded JSON files.
 * @param pageName The name of the page (e.g., "PlaywrightSite" from examplePageLocators.json).
 * @param elementName The logical name of the element (e.g., "mainHeading").
 * @returns The CSS selector or XPath string for the element.
 * @throws Error if the locator is not found.
 */
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

/**
 * Retrieves a Playwright Locator object.
 * This is a convenience function to be used within page objects or steps.
 * @param page The Playwright Page object.
 * @param pageName The name of the page.
 * @param elementName The logical name of the element.
 * @param options Optional: Playwright locator options like `hasText` or `nth`.
 * @returns A Playwright Locator object.
 */
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
    // Add other Playwright locator options as needed
  }
): Locator {
  const locatorString = getLocatorString(pageName, elementName);
  let finalLocator: Locator;

  if (options?.nth !== undefined) {
    finalLocator = page.locator(locatorString).nth(options.nth);
  } else {
    finalLocator = page.locator(locatorString, options as any); // Cast as any to simplify options handling here
  }

  // The options like hasText, has, hasNot are part of the locator method chaining in Playwright v1.22+
  // For example: page.locator('role=button', { hasText: 'Sign in' })
  // Or for more complex cases, you might need to chain them:
  // page.locator(locatorString).filter({ hasText: options.hasText })

  return finalLocator;
}

/**
 * A more flexible way to get a locator with dynamic replacements.
 * Example: getDynamicLocator(page, "UserPage", "userRow", { userName: "John Doe" })
 * Assuming "userRow": "tr[data-username='${userName}']"
 * @param page Playwright Page object
 * @param pageName Name of the page in JSON
 * @param elementName Name of the element in JSON
 * @param replacements Object with key-value pairs for dynamic parts
 * @returns Playwright Locator
 */
export function getDynamicLocator(
  page: Page,
  pageName: string,
  elementName: string,
  replacements: Record<string, string | number>
): Locator {
  let locatorString = getLocatorString(pageName, elementName);
  for (const key in replacements) {
    const regex = new RegExp(`\\\$\\\{${key}\\\}`, 'g'); // Matches ${key}
    locatorString = locatorString.replace(regex, String(replacements[key]));
  }
  return page.locator(locatorString);
}

// Example of how BasePage might use this (conceptual)
// In BasePage:
// protected getEl(pageName: string, elementName: string): Locator {
//   return getLocator(this.page, pageName, elementName);
// }
//
// In a specific Page Object (e.g., HomePage.ts)
// class HomePage extends BasePage {
//   constructor(world: ICustomWorld) {
//     super(world);
//   }
//   get mainHeading(): Locator {
//     return getLocator(this.page, "PlaywrightSite", "mainHeading");
//   }
//   async clickGetStarted(): Promise<void> {
//     await this.clickElement(this.mainHeading); // clickElement would take Locator or string
//   }
// }

// To ensure locators are loaded at least once.
export function ensureLocatorsLoaded() {
    if (Object.keys(loadedLocators).length === 0) {
        loadLocators();
    }
}

// Call it once to make sure they are loaded when manager is imported.
ensureLocatorsLoaded();
