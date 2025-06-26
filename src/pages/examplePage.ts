import { Locator } from '@playwright/test';
import { BasePage } from '@base/basePage';
import { ICustomWorld } from '@steps/customWorld';
import { getLocator, getLocatorString } from '@base/locatorManager'; // Updated import

export class ExamplePage extends BasePage {
  // Define locators for this page using the locator manager
  // The pageName 'PlaywrightSite' should match a key in your locator JSON files.
  private pageName = 'PlaywrightSite'; // Or pass this in constructor if page name varies

  constructor(world: ICustomWorld) {
    super(world);
  }

  // Define getters for elements on this page
  get mainHeading(): Locator {
    return getLocator(this.page, this.pageName, 'mainHeading');
  }

  get getStartedButton(): Locator {
    return getLocator(this.page, this.pageName, 'getStartedButton');
  }

  get searchInput(): Locator {
    // Example of getting just the string if needed elsewhere
    // public static searchInputSelector: string = getLocatorString('PlaywrightSite', 'searchInput');
    return getLocator(this.page, this.pageName, 'searchInput');
  }

  // Define page-specific actions
  async open(): Promise<void> {
    await this.navigateTo('https://playwright.dev/');
  }

  async clickGetStarted(): Promise<void> {
    await this.clickElement(this.getStartedButton);
  }

  async searchFor(text: string): Promise<void> {
    await this.fillText(this.searchInput, text);
    await this.page.press('Enter'); // Example of using page directly for specific actions
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
