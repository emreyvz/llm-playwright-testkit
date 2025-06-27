import { When, Then, Given } from '@cucumber/cucumber';
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

When('I click the {string} element on the {string} page with options:', async function (this: ICustomWorld, elementKey: string, pageName: string, optionsTable: any) {
    const basePage = getBasePage(this);
    const options = optionsTable.rowsHash();
    const clickOptions: any = {};
    if (options.button) clickOptions.button = options.button as 'left' | 'right' | 'middle';
    if (options.clickCount) clickOptions.clickCount = parseInt(options.clickCount, 10);
    if (options.delay) clickOptions.delay = parseInt(options.delay, 10);
    if (options.timeout) clickOptions.timeout = parseInt(options.timeout, 10);
    if (options.nth) clickOptions.nth = parseInt(options.nth, 10);
    if (options.positionX && options.positionY) clickOptions.position = { x: parseInt(options.positionX, 10), y: parseInt(options.positionY, 10) };

    await basePage.clickElement(pageName, elementKey, clickOptions);
});


When('I right click the {string} element on the {string} page', async function (this: ICustomWorld, elementKey: string, pageName: string) {
  const basePage = getBasePage(this);
  await basePage.rightClickElement(pageName, elementKey);
});

When('I double click the {string} element on the {string} page', async function (this: ICustomWorld, elementKey: string, pageName: string) {
  const basePage = getBasePage(this);
  await basePage.doubleClickElement(pageName, elementKey);
});

When('I click and hold the {string} element on the {string} page', async function (this: ICustomWorld, elementKey: string, pageName: string) {
    const basePage = getBasePage(this);
    await basePage.clickAndHoldElement(pageName, elementKey);
});

When('I release the mouse button', async function(this: ICustomWorld) {
    const basePage = getBasePage(this);
    await basePage.releaseMouse();
});

When('I fill the {string} element on the {string} page with {string}', async function (this: ICustomWorld, elementKey: string, pageName: string, text: string) {
  const basePage = getBasePage(this);
  await basePage.fillElement(pageName, elementKey, text);
});

When('I type {string} into the {string} element on the {string} page', async function (this: ICustomWorld, text: string, elementKey: string, pageName: string) {
  const basePage = getBasePage(this);
  await basePage.typeElement(pageName, elementKey, text);
});

When('I clear the {string} element on the {string} page', async function (this: ICustomWorld, elementKey: string, pageName: string) {
  const basePage = getBasePage(this);
  await basePage.clearElement(pageName, elementKey);
});

When('I hover over the {string} element on the {string} page', async function (this: ICustomWorld, elementKey: string, pageName: string) {
  const basePage = getBasePage(this);
  await basePage.hoverElement(pageName, elementKey);
});

When('I drag the {string} element on the {string} page to the {string} element on the {string} page', async function (this: ICustomWorld, sourceKey: string, sourcePage: string, targetKey: string, targetPage: string) {
  const basePage = getBasePage(this);
  await basePage.dragAndDropElement(sourcePage, sourceKey, targetPage, targetKey);
});


Then('the text of the {string} element on the {string} page should be {string}', async function (this: ICustomWorld, elementKey: string, pageName: string, expectedText: string) {
  const basePage = getBasePage(this);
  const actualText = await basePage.getElementText(pageName, elementKey);
  expect(actualText).toBe(expectedText);
});

Then('the text of the {string} element on the {string} page should contain {string}', async function (this: ICustomWorld, elementKey: string, pageName: string, expectedTextPart: string) {
  const basePage = getBasePage(this);
  const actualText = await basePage.getElementText(pageName, elementKey);
  expect(actualText).toContain(expectedTextPart);
});

Then('the {string} attribute of the {string} element on the {string} page should be {string}', async function (this: ICustomWorld, attributeName: string, elementKey: string, pageName: string, expectedValue: string) {
  const basePage = getBasePage(this);
  const actualValue = await basePage.getElementAttribute(pageName, elementKey, attributeName);
  expect(actualValue).toBe(expectedValue);
});

Then('the {string} element on the {string} page should be visible', async function (this: ICustomWorld, elementKey: string, pageName: string) {
  const basePage = getBasePage(this);
  const isVisible = await basePage.isElementVisible(pageName, elementKey);
  expect(isVisible).toBe(true);
});

Then('the {string} element on the {string} page should be hidden', async function (this: ICustomWorld, elementKey: string, pageName: string) {
  const basePage = getBasePage(this);
  const isHidden = await basePage.isElementHidden(pageName, elementKey);
  expect(isHidden).toBe(true);
});

Then('the {string} element on the {string} page should be enabled', async function (this: ICustomWorld, elementKey: string, pageName: string) {
  const basePage = getBasePage(this);
  const isEnabled = await basePage.isElementEnabled(pageName, elementKey);
  expect(isEnabled).toBe(true);
});

Then('the {string} element on the {string} page should be disabled', async function (this: ICustomWorld, elementKey: string, pageName: string) {
  const basePage = getBasePage(this);
  const isEnabled = await basePage.isElementEnabled(pageName, elementKey);
  expect(isEnabled).toBe(false);
});

Then('the {string} element on the {string} page should be checked', async function (this: ICustomWorld, elementKey: string, pageName: string) {
    const basePage = getBasePage(this);
    const isChecked = await basePage.isElementChecked(pageName, elementKey);
    expect(isChecked).toBe(true);
});

Then('the {string} element on the {string} page should not be checked', async function (this: ICustomWorld, elementKey: string, pageName: string) {
    const basePage = getBasePage(this);
    const isChecked = await basePage.isElementChecked(pageName, elementKey);
    expect(isChecked).toBe(false);
});


When('I wait for the {string} element on the {string} page to be visible', async function (this: ICustomWorld, elementKey: string, pageName: string) {
  const basePage = getBasePage(this);
  await basePage.waitForElementToBeVisible(pageName, elementKey);
});

When('I wait for the {string} element on the {string} page to be hidden', async function (this: ICustomWorld, elementKey: string, pageName: string) {
  const basePage = getBasePage(this);
  await basePage.waitForElementToBeHidden(pageName, elementKey);
});

When('I wait for the {string} element on the {string} page to be clickable', async function (this: ICustomWorld, elementKey: string, pageName: string) {
  const basePage = getBasePage(this);
  await basePage.waitForElementToBeClickable(pageName, elementKey);
});

When('I select the option with label {string} from the {string} dropdown on the {string} page', async function (this: ICustomWorld, label: string, elementKey: string, pageName: string) {
  const basePage = getBasePage(this);
  await basePage.selectOptionByLabel(pageName, elementKey, label);
});

When('I select the option with value {string} from the {string} dropdown on the {string} page', async function (this: ICustomWorld, value: string, elementKey: string, pageName: string) {
  const basePage = getBasePage(this);
  await basePage.selectOptionByValue(pageName, elementKey, value);
});

When('I select the option at index {int} from the {string} dropdown on the {string} page', async function (this: ICustomWorld, index: number, elementKey: string, pageName: string) {
  const basePage = getBasePage(this);
  await basePage.selectOptionByIndex(pageName, elementKey, index);
});

When('I take a screenshot of the {string} element on the {string} page and save it as {string}', async function (this: ICustomWorld, elementKey: string, pageName: string, filePath: string) {
  const basePage = getBasePage(this);
  await basePage.takeScreenshotOfElement(pageName, elementKey, filePath);
});

When('I take a full page screenshot and save it as {string}', async function (this: ICustomWorld, filePath: string) {
  const basePage = getBasePage(this);
  await basePage.takeFullPageScreenshot(filePath);
});

When('I scroll to the {string} element on the {string} page', async function (this: ICustomWorld, elementKey: string, pageName: string) {
  const basePage = getBasePage(this);
  await basePage.scrollToElement(pageName, elementKey);
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
    this.lastJsResult = await basePage.executeJavaScript(script);
});

When('I execute javascript {string} with arguments:', async function(this: ICustomWorld, script: string, argsTable: any) {
    const basePage = getBasePage(this);
    const args = argsTable.rows().map((row: any) => row[0]);
    this.lastJsResult = await basePage.executeJavaScript(script, args);
});

Then('the last javascript result should be {string}', function(this: ICustomWorld, expectedResult: string) {
    expect(String(this.lastJsResult)).toBe(expectedResult);
});

Then('the last javascript result should be {int}', function(this: ICustomWorld, expectedResult: number) {
    expect(Number(this.lastJsResult)).toBe(expectedResult);
});

Then('I expect the {string} element on the {string} page to have text {string}', async function (this: ICustomWorld, elementKey: string, pageName: string, expectedText: string) {
    const basePage = getBasePage(this);
    await basePage.expectElementToHaveText(pageName, elementKey, expectedText);
});

Then('I expect the {string} element on the {string} page to be visible', async function (this: ICustomWorld, elementKey: string, pageName: string) {
    const basePage = getBasePage(this);
    await basePage.expectElementToBeVisible(pageName, elementKey);
});

Then('I expect the {string} element on the {string} page to be hidden', async function (this: ICustomWorld, elementKey: string, pageName: string) {
    const basePage = getBasePage(this);
    await basePage.expectElementToBeHidden(pageName, elementKey);
});

Then('I expect the {string} element on the {string} page to be enabled', async function (this: ICustomWorld, elementKey: string, pageName: string) {
    const basePage = getBasePage(this);
    await basePage.expectElementToBeEnabled(pageName, elementKey);
});

Then('I expect the {string} element on the {string} page to be disabled', async function (this: ICustomWorld, elementKey: string, pageName: string) {
    const basePage = getBasePage(this);
    await basePage.expectElementToBeDisabled(pageName, elementKey);
});

When('I interact with the {string} element on the {string} page using {string} action with placeholders:', async function (this: ICustomWorld, elementKey: string, pageName: string, action: string) {
    const basePage = getBasePage(this);

    switch (action.toLowerCase()) {
        case 'click':
            await basePage.clickElement(pageName, elementKey);
            break;
        case 'fill':
            throw new Error(`Action 'fill' requires text. Please use a more specific step or modify this one.`);
        default:
            throw new Error(`Action "${action}" is not implemented in this generic step.`);
    }
});

