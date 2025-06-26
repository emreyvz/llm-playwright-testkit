import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { BrowserContext, Page, PlaywrightTestOptions, APIRequestContext } from '@playwright/test';
import { Browser, chromium, firefox, webkit } from '@playwright/test'; // Corrected import
import playwrightConfig from '../playwright.config'; // Adjusted path

export interface ICustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  request?: APIRequestContext;
  featureName?: string;
  scenarioName?: string;
  playwrightOptions?: PlaywrightTestOptions;
}

export class CustomWorld extends World implements ICustomWorld {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  request?: APIRequestContext;
  featureName?: string;
  scenarioName?: string;
  playwrightOptions?: PlaywrightTestOptions;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);
