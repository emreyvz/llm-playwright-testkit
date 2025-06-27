// import { Locator } from '@playwright/test'; // No longer directly returning Locator objects
import { BasePage } from './basePage';
import { ICustomWorld } from '../steps/customWorld';
// import { getLocator } from '../base/locatorManager'; // getLocator is now used within BasePage methods

export class ExamplePage extends BasePage {
  private pageName = 'PlaywrightSite'; // This is the key used in examplePageLocators.json

  constructor(world: ICustomWorld) {
    super(world);
  }

  // Element keys - these correspond to the keys in examplePageLocators.json under "PlaywrightSite"
  private locators = {
    mainHeading: 'mainHeading',
    getStartedButton: 'getStartedButton',
    searchInput: 'searchInput',
    // Example of a dynamic locator key, if you had one like: "menuItemDynamic": "a[data-testid='menu-${itemName}']"
    // dynamicMenuItem: 'menuItemDynamic'
  };

  async open(): Promise<void> {
    await this.navigateTo('https://playwright.dev/');
  }

  async clickGetStarted(): Promise<void> {
    // Now calls the updated clickElement method from BasePage
    await this.clickElement(this.pageName, this.locators.getStartedButton);
  }

  async searchFor(text: string): Promise<void> {
    // Uses fillElement and then a separate action for 'Enter'
    // Note: BasePage doesn't have a generic 'press' method for a locator key yet.
    // We can add it or handle it here. For now, let's use page.press after filling.
    await this.fillElement(this.pageName, this.locators.searchInput, text);
    // To press Enter on the search input after filling:
    // One way is to get the locator and then press Enter.
    // This shows a limitation if BasePage doesn't expose raw locators or a specific pressKey method.
    // For now, we'll use page.press which is simpler if the input is focused or if we provide a selector.
    // Assuming the search input is focused after fill, or playwright.dev auto-submits or has a search button.
    // If a specific press on the element is needed:
    // const searchInputElement = getLocator(this.page, this.pageName, this.locators.searchInput);
    // await searchInputElement.press('Enter');
    // Or, if the form submits on Enter or there's a search button to click:
    await this.page.press(`input[placeholder='Search']`, 'Enter'); // Using the raw selector for simplicity here
                                                                    // Ideally, add a pressKey method to BasePage.
  }

  async getMainHeadingText(): Promise<string | null> {
    return this.getElementText(this.pageName, this.locators.mainHeading);
  }

  async verifyTitleContains(expectedText: string): Promise<void> {
    // This method is fine as it uses this.page directly for a page-level assertion
    // But for consistency, we could also have a getTitle method in BasePage.
    await this.page.waitForLoadState('domcontentloaded');
    const title = await this.page.title();
    if (!title.includes(expectedText)) {
      throw new Error(`Expected title to contain "${expectedText}", but found "${title}"`);
    }
    // Alternatively, using expect from Playwright test library for a cleaner assertion
    // await expect(this.page).toHaveTitle(new RegExp(expectedText));
    // This type of assertion might be better in a step definition or a BasePage expect method.
  }

  // Example using a new BasePage method: rightClickGetStartedButton
  async rightClickGetStartedButton(): Promise<void> {
    await this.rightClickElement(this.pageName, this.locators.getStartedButton);
  }

  // Example using a dynamic locator (if one was defined in examplePageLocators.json)
  // async clickDynamicMenuItem(itemName: string): Promise<void> {
  //   await this.clickElement(this.pageName, this.locators.dynamicMenuItem, undefined, { itemName: itemName });
  // }
}
