import { When, Then, Given, DataTable } from '@cucumber/cucumber';
import { ICustomWorld } from './customWorld';
import { expect } from '@playwright/test';
import { BasePage } from '../pages/basePage';
import { FrameLocator } from 'playwright';

function getBasePage(world: ICustomWorld): BasePage {
  if (!world.basePage) {
    world.basePage = new BasePage(world);
  }
  return world.basePage;
}

function parseTimeout(optionsString?: string): number | undefined {
  if (!optionsString) return undefined;
  const match = optionsString.match(/timeout:(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

function parseDynamicReplacements(dataTable?: DataTable): Record<string, string | number> | undefined {
    if (!dataTable) return undefined;
    const replacements: Record<string, string | number> = {};
    dataTable.hashes().forEach(row => {
        replacements[row.placeholder] = row.value;
    });
    return Object.keys(replacements).length > 0 ? replacements : undefined;
}


When('I wait for {int} seconds', async function (this: ICustomWorld, seconds: number) {
  await this.page?.waitForTimeout(seconds * 1000);
});

Then('I should see the page title contains {string}', async function (this: ICustomWorld, expectedTitlePart: string) {
  const page = this.page!; 
  expect(await page.title()).toContain(expectedTitlePart);
});

When('I navigate to {string}', async function (this: ICustomWorld, url: string) {
  const basePage = getBasePage(this);
  await basePage.navigateTo(url);
});

Then('the current URL should be {string}', async function (this: ICustomWorld, expectedUrl: string) {
  const page = this.page!;
  await expect(page).toHaveURL(expectedUrl);
});

When('I click the {string} element on the {string} page', async function (this: ICustomWorld, elementKey: string, pageName: string) {
  const basePage = getBasePage(this);
  await basePage.clickElement(pageName, elementKey, { nth: 1 });
});

When('I click the {string} element on the {string} page with options:', async function (this: ICustomWorld, elementKey: string, pageName: string, optionsTable: DataTable) {
    const basePage = getBasePage(this);
    const options = optionsTable.rowsHash();
    const clickOptions: any = {};
    if (options.button) clickOptions.button = options.button as 'left' | 'right' | 'middle';
    if (options.clickCount) clickOptions.clickCount = parseInt(options.clickCount, 10);
    if (options.delay) clickOptions.delay = parseInt(options.delay, 10);
    if (options.timeout) clickOptions.timeout = parseInt(options.timeout, 10);
    if (options.nth) clickOptions.nth = parseInt(options.nth, 10);
    if (options.positionX && options.positionY) clickOptions.position = { x: parseInt(options.positionX, 10), y: parseInt(options.positionY, 10) };

    let replacements: Record<string, string | number> | undefined;
    if (options.dynamicPlaceholders) { 
        try {
            replacements = JSON.parse(options.dynamicPlaceholders);
        } catch (e) {
            console.warn("Could not parse dynamicPlaceholders JSON from step options", e);
        }
    }
    await basePage.clickElement(pageName, elementKey, clickOptions, replacements);
});


When('I right click the {string} element on the {string} page', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  await basePage.rightClickElement(pageName, elementKey, undefined, replacements);
});

When('I double click the {string} element on the {string} page', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  await basePage.doubleClickElement(pageName, elementKey, undefined, replacements);
});

When('I click and hold the {string} element on the {string} page', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
    const basePage = getBasePage(this);
    const replacements = parseDynamicReplacements(dataTable);
    await basePage.clickAndHoldElement(pageName, elementKey, undefined, replacements);
});

When('I release the mouse button', async function(this: ICustomWorld) {
    const basePage = getBasePage(this);
    await basePage.releaseMouse();
});

When('I fill the {string} element on the {string} page with {string}', async function (this: ICustomWorld, elementKey: string, pageName: string, text: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  await basePage.fillElement(pageName, elementKey, text, undefined, replacements);
});

When('I type {string} into the {string} element on the {string} page', async function (this: ICustomWorld, text: string, elementKey: string, pageName: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  await basePage.typeElement(pageName, elementKey, text, undefined, replacements);
});

When('I clear the {string} element on the {string} page', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  await basePage.clearElement(pageName, elementKey, undefined, replacements);
});

When('I hover over the {string} element on the {string} page', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  await basePage.hoverElement(pageName, elementKey, undefined, replacements);
});

When('I drag the {string} element on the {string} page to the {string} element on the {string} page', async function (this: ICustomWorld, sourceKey: string, sourcePage: string, targetKey: string, targetPage: string) {
  const basePage = getBasePage(this);
  // This step could be extended with DataTables for dynamic replacements for source/target if needed
  await basePage.dragAndDropElement(sourcePage, sourceKey, targetPage, targetKey);
});


Then('the text of the {string} element on the {string} page should be {string}', async function (this: ICustomWorld, elementKey: string, pageName: string, expectedText: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  const actualText = await basePage.getElementText(pageName, elementKey, undefined, replacements);
  expect(actualText).toBe(expectedText);
});

Then('the text of the {string} element on the {string} page should contain {string}', async function (this: ICustomWorld, elementKey: string, pageName: string, expectedTextPart: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  const actualText = await basePage.getElementText(pageName, elementKey, undefined, replacements);
  expect(actualText).toContain(expectedTextPart);
});

Then('the {string} attribute of the {string} element on the {string} page should be {string}', async function (this: ICustomWorld, attributeName: string, elementKey: string, pageName: string, expectedValue: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  const actualValue = await basePage.getElementAttribute(pageName, elementKey, attributeName, undefined, replacements);
  expect(actualValue).toBe(expectedValue);
});

Then('the {string} element on the {string} page should be visible', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  const isVisible = await basePage.isElementVisible(pageName, elementKey, undefined, replacements);
  expect(isVisible).toBe(true);
});

Then('the {string} element on the {string} page should be hidden', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  const isHidden = await basePage.isElementHidden(pageName, elementKey, undefined, replacements);
  expect(isHidden).toBe(true);
});

Then('the {string} element on the {string} page should be enabled', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  const isEnabled = await basePage.isElementEnabled(pageName, elementKey, undefined, replacements);
  expect(isEnabled).toBe(true);
});

Then('the {string} element on the {string} page should be disabled', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  const isEnabled = await basePage.isElementEnabled(pageName, elementKey, undefined, replacements);
  expect(isEnabled).toBe(false);
});

Then('the {string} element on the {string} page should be checked', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
    const basePage = getBasePage(this);
    const replacements = parseDynamicReplacements(dataTable);
    const isChecked = await basePage.isElementChecked(pageName, elementKey, undefined, replacements);
    expect(isChecked).toBe(true);
});

Then('the {string} element on the {string} page should not be checked', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
    const basePage = getBasePage(this);
    const replacements = parseDynamicReplacements(dataTable);
    const isChecked = await basePage.isElementChecked(pageName, elementKey, undefined, replacements);
    expect(isChecked).toBe(false);
});


When('I wait for the {string} element on the {string} page to be visible', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  await basePage.waitForElementToBeVisible(pageName, elementKey, 10, replacements);
});

When('I wait for the {string} element on the {string} page to be hidden', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  await basePage.waitForElementToBeHidden(pageName, elementKey, 10, replacements);
});

When('I wait for the {string} element on the {string} page to be clickable', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  await basePage.waitForElementToBeClickable(pageName, elementKey, 10, replacements);
});

When('I select the option with label {string} from the {string} dropdown on the {string} page', async function (this: ICustomWorld, label: string, elementKey: string, pageName: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  await basePage.selectOptionByLabel(pageName, elementKey, label, undefined, replacements);
});

When('I select the option with value {string} from the {string} dropdown on the {string} page', async function (this: ICustomWorld, value: string, elementKey: string, pageName: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  await basePage.selectOptionByValue(pageName, elementKey, value, undefined, replacements);
});

When('I select the option at index {int} from the {string} dropdown on the {string} page', async function (this: ICustomWorld, index: number, elementKey: string, pageName: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  await basePage.selectOptionByIndex(pageName, elementKey, index, undefined, replacements);
});

When('I take a screenshot of the {string} element on the {string} page and save it as {string}', async function (this: ICustomWorld, elementKey: string, pageName: string, filePath: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  await basePage.takeScreenshotOfElement(pageName, elementKey, filePath, undefined, replacements);
});

When('I take a full page screenshot and save it as {string}', async function (this: ICustomWorld, filePath: string) {
  const basePage = getBasePage(this);
  await basePage.takeFullPageScreenshot(filePath);
});

When('I scroll to the {string} element on the {string} page', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  await basePage.scrollToElement(pageName, elementKey, undefined, replacements);
});

When('I scroll the page by {int} pixels horizontally and {int} pixels vertically', async function (this: ICustomWorld, deltaX: number, deltaY: number) {
    const basePage = getBasePage(this);
    await basePage.scrollPage(deltaX, deltaY);
});


When('I switch to the default content', async function(this: ICustomWorld) {
    const basePage = getBasePage(this);
    await basePage.switchToDefaultContent();
    this.currentFrame = undefined;
});


When('I switch to page with index {int}', async function(this: ICustomWorld, pageIndex: number) {
    const basePage = getBasePage(this);
    const newPage = await basePage.switchToPage(pageIndex);
    expect(newPage).not.toBeNull();
    if (newPage) this.page = newPage; 
});

When('I close the current page', async function(this: ICustomWorld) {
    const basePage = getBasePage(this);
    await basePage.closeCurrentPage();
});


When('I accept the dialog', async function(this: ICustomWorld) {
    const basePage = getBasePage(this);
    await basePage.acceptDialog();
});

When('I dismiss the dialog', async function(this: ICustomWorld) {
    const basePage = getBasePage(this);
    await basePage.dismissDialog();
});

When('I fill the dialog with {string}', async function(this: ICustomWorld, text: string) {
    const basePage = getBasePage(this);
    await basePage.fillInDialog(text);
});

Then('the dialog message should be {string}', async function(this: ICustomWorld, expectedMessage: string) {
    const basePage = getBasePage(this);
    const message = await basePage.getDialogMessage();
    expect(message).toBe(expectedMessage);
});

When('I execute javascript {string}', async function(this: ICustomWorld, script: string) {
    const basePage = getBasePage(this);
    this.lastJsResult = await basePage.executeJavaScript(script); // Store result in world context
});

When('I execute javascript {string} with arguments:', async function(this: ICustomWorld, script: string, argsTable: DataTable) {
    const basePage = getBasePage(this);
    const args = argsTable.rows().map(row => row[0]); // Simple list of args
    this.lastJsResult = await basePage.executeJavaScript(script, args);
});

Then('the last javascript result should be {string}', function(this: ICustomWorld, expectedResult: string) {
    expect(String(this.lastJsResult)).toBe(expectedResult);
});

Then('the last javascript result should be {int}', function(this: ICustomWorld, expectedResult: number) {
    expect(Number(this.lastJsResult)).toBe(expectedResult);
});

// Expect steps from BasePage (already good, just ensure they use getBasePage)
Then('I expect the {string} element on the {string} page to have text {string}', async function (this: ICustomWorld, elementKey: string, pageName: string, expectedText: string, dataTable?: DataTable) {
    const basePage = getBasePage(this);
    const replacements = parseDynamicReplacements(dataTable);
    await basePage.expectElementToHaveText(pageName, elementKey, expectedText, undefined, replacements);
});

Then('I expect the {string} element on the {string} page to be visible', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
    const basePage = getBasePage(this);
    const replacements = parseDynamicReplacements(dataTable);
    await basePage.expectElementToBeVisible(pageName, elementKey, undefined, replacements);
});

Then('I expect the {string} element on the {string} page to be hidden', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
    const basePage = getBasePage(this);
    const replacements = parseDynamicReplacements(dataTable);
    await basePage.expectElementToBeHidden(pageName, elementKey, undefined, replacements);
});

Then('I expect the {string} element on the {string} page to be enabled', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
    const basePage = getBasePage(this);
    const replacements = parseDynamicReplacements(dataTable);
    await basePage.expectElementToBeEnabled(pageName, elementKey, undefined, replacements);
});

Then('I expect the {string} element on the {string} page to be disabled', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
    const basePage = getBasePage(this);
    const replacements = parseDynamicReplacements(dataTable);
    await basePage.expectElementToBeDisabled(pageName, elementKey, undefined, replacements);
});

When('I interact with the {string} element on the {string} page using {string} action with placeholders:', async function (this: ICustomWorld, elementKey: string, pageName: string, action: string, dataTable: DataTable) {
    const basePage = getBasePage(this);
    const replacements = parseDynamicReplacements(dataTable);
    if (!replacements) throw new Error("DataTable for dynamic replacements was not provided or was empty.");

    switch (action.toLowerCase()) {
        case 'click':
            await basePage.clickElement(pageName, elementKey, undefined, replacements);
            break;
        case 'fill':
            throw new Error(`Action 'fill' requires text. Please use a more specific step or modify this one.`);
        default:
            throw new Error(`Action "${action}" is not implemented in this generic step.`);
    }
});

