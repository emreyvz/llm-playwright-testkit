import { Locator } from '@playwright/test';
import { BasePage } from '../base/basePage';
import { ICustomWorld } from '../steps/customWorld';
import { getLocator } from '../base/locatorManager';

export class ExamplePage extends BasePage {
  private pageName = 'PlaywrightSite';

  constructor(world: ICustomWorld) {
    super(world);
  }

  get mainHeading(): Locator {
    return getLocator(this.page, this.pageName, 'mainHeading');
  }

  get getStartedButton(): Locator {
    return getLocator(this.page, this.pageName, 'getStartedButton');
  }

  get searchInput(): Locator {
    return getLocator(this.page, this.pageName, 'searchInput');
  }

  async open(): Promise<void> {
    await this.navigateTo('https://playwright.dev/');
  }

  async clickGetStarted(): Promise<void> {
    await this.clickElement(this.getStartedButton);
  }

  async searchFor(text: string): Promise<void> {
    await this.fillText(this.searchInput, text);
    await this.searchInput.press('Enter');
  }

  async getMainHeadingText(): Promise<string | null> {
    return this.getText(this.mainHeading);
  }

  async verifyTitleContains(expectedText: string): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    const title = await this.page.title();
    if (!title.includes(expectedText)) {
      throw new Error(`Expected title to contain "${expectedText}", but found "${title}"`);
    }
  }
}
