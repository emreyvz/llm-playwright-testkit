import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { BrowserContext, Page, PlaywrightTestOptions, APIRequestContext, FrameLocator } from '@playwright/test';
import { Browser } from '@playwright/test'; // Removed specific browser imports as they are not used here
// import playwrightConfig from '../playwright.config'; // playwrightConfig is not used in this file
import { BasePage } from '../pages/basePage'; // For type hinting

export interface ICustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  request?: APIRequestContext;
  featureName?: string;
  scenarioName?: string;
  playwrightOptions?: PlaywrightTestOptions;

  // Added properties
  basePage?: BasePage;
  worldMap?: Map<string, any>;
  currentFrame?: FrameLocator;
  lastJsResult?: any;
}

export class CustomWorld extends World implements ICustomWorld {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  request?: APIRequestContext;
  featureName?: string;
  scenarioName?: string;
  playwrightOptions?: PlaywrightTestOptions;

  // Added properties
  basePage?: BasePage;
  worldMap?: Map<string, any>;
  currentFrame?: FrameLocator;
  lastJsResult?: any;

  constructor(options: IWorldOptions) {
    super(options);
    this.worldMap = new Map<string, any>();
  }
}

setWorldConstructor(CustomWorld);
