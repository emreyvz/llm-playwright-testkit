import { Before, After, BeforeAll, AfterAll, Status, ITestCaseHookParameter } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium, firefox, webkit } from '@playwright/test';
import { ICustomWorld, CustomWorld } from '../steps/customWorld';
import playwrightConfig from '../playwright.config';
import logger from '../utils/logger';
import { ErrorHandler } from '../base/errorHandler';
import { ErrorType } from '../base/errorHandler';
import { CustomError } from '../base/errorHandler';

let browser: Browser;
const browserName = process.env.BROWSER || 'chromium';

BeforeAll(async function () {
  switch (browserName.toLowerCase()) {
    case 'firefox':
      browser = await firefox.launch(playwrightConfig.use);
      break;
    case 'webkit':
      browser = await webkit.launch(playwrightConfig.use);
      break;
    default:
      browser = await chromium.launch(playwrightConfig.use);
  }
});

Before(async function (this: ICustomWorld, scenario: ITestCaseHookParameter) {
  this.featureName = scenario.gherkinDocument.feature?.name;
  this.scenarioName = scenario.pickle.name;

  const context = await browser.newContext({
    viewport: null,
    ...playwrightConfig.use,
  });
  const page = await context.newPage();

  this.browser = browser;
  this.context = context;
  this.page = page;
  this.request = context.request;

  logger.info(`Running scenario: "${this.scenarioName}" in feature: "${this.featureName}" using browser: ${browserName}`);
});

After(async function (this: ICustomWorld, scenario: ITestCaseHookParameter) {
  if (scenario.result?.status === Status.FAILED) {
    if (this.page) {
      const screenshotName = `${this.scenarioName?.replace(/\s+/g, '_')}_failure_${Date.now()}.png`;
      const screenshotPath = `reports/screenshots/${screenshotName}`;
      try {
        const imageBuffer = await this.page.screenshot({
          path: screenshotPath,
          fullPage: true
        });
        if (imageBuffer) {
          this.attach(imageBuffer, 'image/png');
          logger.info(`Screenshot taken for failed scenario: "${this.scenarioName}"`, { path: screenshotPath });
        } else {
          logger.warn(`Could not capture screenshot buffer for failed scenario: "${this.scenarioName}"`);
        }
      } catch (error: any) {
        ErrorHandler.handle(error, ErrorType.UI_ERROR);
        logger.error(`Failed to take or attach screenshot for scenario: "${this.scenarioName}"`, { error: error.message });
      }
    }
  }
  if (this.page) await this.page.close();
  if (this.context) await this.context.close();
});

AfterAll(async function () {
  if (browser) {
    await browser.close();
  }
});
