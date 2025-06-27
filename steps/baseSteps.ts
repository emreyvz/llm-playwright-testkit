import { When, Then, Given, DataTable } from '@cucumber/cucumber';
import { ICustomWorld } from './customWorld';
import { expect } from '@playwright/test';
import { BasePage } from '../base/basePage'; // Import BasePage
import { FrameLocator } from 'playwright';

// Helper function to get BasePage instance
function getBasePage(world: ICustomWorld): BasePage {
  if (!world.basePage) {
    world.basePage = new BasePage(world);
  }
  return world.basePage;
}

// Helper function to parse optional timeout from step
function parseTimeout(optionsString?: string): number | undefined {
  if (!optionsString) return undefined;
  const match = optionsString.match(/timeout:(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

// Helper function to parse dynamic replacements from DataTable
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
  const page = this.page!; // Assuming page is always available from ICustomWorld
  await expect(page).toHaveTitle(new RegExp(expectedTitlePart));
});

When('I navigate to {string}', async function (this: ICustomWorld, url: string) {
  // This step now uses BasePage's navigateTo for consistency and error handling
  const basePage = getBasePage(this);
  await basePage.navigateTo(url);
});

Then('the current URL should be {string}', async function (this: ICustomWorld, expectedUrl: string) {
  const page = this.page!;
  await expect(page).toHaveURL(expectedUrl);
});

// --- New Steps for BasePage methods ---

// Click Actions
When('I click the {string} element on the {string} page', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  await basePage.clickElement(pageName, elementKey, undefined, replacements);
});

When('I click the {string} element on the {string} page with options:', async function (this: ICustomWorld, elementKey: string, pageName: string, optionsTable: DataTable) {
    const basePage = getBasePage(this);
    const options = optionsTable.rowsHash(); // { button: 'right', clickCount: '2', delay: '100', timeout: '5000', nth: '0' }
    const clickOptions: any = {};
    if (options.button) clickOptions.button = options.button as 'left' | 'right' | 'middle';
    if (options.clickCount) clickOptions.clickCount = parseInt(options.clickCount, 10);
    if (options.delay) clickOptions.delay = parseInt(options.delay, 10);
    if (options.timeout) clickOptions.timeout = parseInt(options.timeout, 10);
    if (options.nth) clickOptions.nth = parseInt(options.nth, 10);
    if (options.positionX && options.positionY) clickOptions.position = { x: parseInt(options.positionX, 10), y: parseInt(options.positionY, 10) };

    let replacements: Record<string, string | number> | undefined;
    if (options.dynamicPlaceholders) { // Assuming dynamicPlaceholders is a JSON string or similar in the table
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

// Input Actions
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

// Hover Action
When('I hover over the {string} element on the {string} page', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  await basePage.hoverElement(pageName, elementKey, undefined, replacements);
});

// Drag and Drop
When('I drag the {string} element on the {string} page to the {string} element on the {string} page', async function (this: ICustomWorld, sourceKey: string, sourcePage: string, targetKey: string, targetPage: string) {
  const basePage = getBasePage(this);
  // This step could be extended with DataTables for dynamic replacements for source/target if needed
  await basePage.dragAndDropElement(sourcePage, sourceKey, targetPage, targetKey);
});


// Getters and Assertions
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


// Waits
When('I wait for the {string} element on the {string} page to be visible( with options: {string})?', async function (this: ICustomWorld, elementKey: string, pageName: string, optionsStr?: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const timeout = parseTimeout(optionsStr);
  const replacements = parseDynamicReplacements(dataTable);
  await basePage.waitForElementToBeVisible(pageName, elementKey, timeout, replacements);
});

When('I wait for the {string} element on the {string} page to be hidden( with options: {string})?', async function (this: ICustomWorld, elementKey: string, pageName: string, optionsStr?: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const timeout = parseTimeout(optionsStr);
  const replacements = parseDynamicReplacements(dataTable);
  await basePage.waitForElementToBeHidden(pageName, elementKey, timeout, replacements);
});

When('I wait for the {string} element on the {string} page to be clickable( with options: {string})?', async function (this: ICustomWorld, elementKey: string, pageName: string, optionsStr?: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const timeout = parseTimeout(optionsStr);
  const replacements = parseDynamicReplacements(dataTable);
  await basePage.waitForElementToBeClickable(pageName, elementKey, timeout, replacements);
});

// Select (Dropdown) Actions
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

// Screenshot Actions
When('I take a screenshot of the {string} element on the {string} page and save it as {string}', async function (this: ICustomWorld, elementKey: string, pageName: string, filePath: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  await basePage.takeScreenshotOfElement(pageName, elementKey, filePath, undefined, replacements);
});

When('I take a full page screenshot and save it as {string}', async function (this: ICustomWorld, filePath: string) {
  const basePage = getBasePage(this);
  await basePage.takeFullPageScreenshot(filePath);
});

// Scrolling
When('I scroll to the {string} element on the {string} page', async function (this: ICustomWorld, elementKey: string, pageName: string, dataTable?: DataTable) {
  const basePage = getBasePage(this);
  const replacements = parseDynamicReplacements(dataTable);
  await basePage.scrollToElement(pageName, elementKey, undefined, replacements);
});

When('I scroll the page by {int} pixels horizontally and {int} pixels vertically', async function (this: ICustomWorld, deltaX: number, deltaY: number) {
    const basePage = getBasePage(this);
    await basePage.scrollPage(deltaX, deltaY);
});

// Frame/Page Switching
When('I switch to the {string} frame identified by element {string} on the {string} page', async function (this: ICustomWorld, frameNameAlias: string, elementKey: string, pageName: string, dataTable?: DataTable) {
    const basePage = getBasePage(this);
    const replacements = parseDynamicReplacements(dataTable);
    const frameLocator = await basePage.switchToFrame(pageName, elementKey, undefined, replacements);
    if (frameLocator) {
        this.worldMap.set(frameNameAlias, frameLocator); // Store FrameLocator in world for further use
        this.currentFrame = frameLocator; // Optionally set current frame context
    } else {
        throw new Error(`Could not switch to frame ${pageName}.${elementKey}`);
    }
});

When('I switch to the default content', async function(this: ICustomWorld) {
    const basePage = getBasePage(this);
    await basePage.switchToDefaultContent();
    this.currentFrame = undefined; // Reset current frame context
});

// To use operations within a frame after switching:
// Given I am in the "myFrame" frame
// When I click the "internalButton" element on the "somePage" page (this step would need modification to use this.currentFrame)

When('I switch to page with index {int}', async function(this: ICustomWorld, pageIndex: number) {
    const basePage = getBasePage(this);
    const newPage = await basePage.switchToPage(pageIndex);
    expect(newPage).not.toBeNull();
    if (newPage) this.page = newPage; // Update world's current page
});

// Example for switching by title (predicate)
// When('I switch to page with title containing {string}', async function(this: ICustomWorld, titlePart: string) {
//     const basePage = getBasePage(this);
//     const newPage = await basePage.switchToPage(async (p) => (await p.title()).includes(titlePart));
//     expect(newPage).not.toBeNull();
//     if (newPage) this.page = newPage;
// });

When('I close the current page', async function(this: ICustomWorld) {
    const basePage = getBasePage(this);
    await basePage.closeCurrentPage();
    // this.page will be updated by basePage.closeCurrentPage() if other pages are available
});


// Dialog Handling
When('I accept the dialog', async function(this: ICustomWorld) {
    const basePage = getBasePage(this);
    // Setup listener before action that triggers dialog for more robust handling
    // this.page.once('dialog', dialog => dialog.accept());
    // await basePage.triggerActionThatOpensDialog(); // e.g. click a button
    // For reactive handling (if dialog is already expected or appears fast):
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
    // This step is tricky due to the async nature of dialogs.
    // It's better to capture the message via page.on('dialog') and store it in the world context.
    // For this example, we'll try the reactive getDialogMessage, but it might be flaky.
    const message = await basePage.getDialogMessage();
    expect(message).toBe(expectedMessage);
});

// JavaScript Execution
When('I execute javascript {string}', async function(this: ICustomWorld, script: string) {
    const basePage = getBasePage(this);
    this.lastJsResult = await basePage.executeJavaScript(script); // Store result in world context
});

// Example for script with arguments:
// When I execute javascript "return arguments[0] * arguments[1];" with arguments:
//  | arg1 | 10 |
//  | arg2 | 5  |
// Then the last javascript result should be 50
When('I execute javascript {string} with arguments:', async function(this: ICustomWorld, script: string, argsTable: DataTable) {
    const basePage = getBasePage(this);
    const args = argsTable.rows().map(row => row[0]); // Simple list of args
    // For key-value args, you'd parse argsTable.hashes()
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

// Step for dynamic locators using DataTable (generic example)
// When I click the "userRow" element on the "userTable" page with placeholders:
//   | placeholder | value    |
//   | userId      | 123      |
//   | action      | "edit"   |
// (Assuming locator string is like: //tr[@data-user-id='${userId}']//button[text()='${action}'] )
When('I interact with the {string} element on the {string} page using {string} action with placeholders:', async function (this: ICustomWorld, elementKey: string, pageName: string, action: string, dataTable: DataTable) {
    const basePage = getBasePage(this);
    const replacements = parseDynamicReplacements(dataTable);
    if (!replacements) throw new Error("DataTable for dynamic replacements was not provided or was empty.");

    // Example: Extend this for various actions
    switch (action.toLowerCase()) {
        case 'click':
            await basePage.clickElement(pageName, elementKey, undefined, replacements);
            break;
        case 'fill':
            // This specific step would need another parameter for the text to fill
            // e.g. When I "fill" the "inputField" element on "formPage" with "some text" using placeholders:
            throw new Error(`Action 'fill' requires text. Please use a more specific step or modify this one.`);
        // Add more cases for other actions: hover, getText, etc.
        default:
            throw new Error(`Action "${action}" is not implemented in this generic step.`);
    }
});

// Note: The CAPTCHA solving step is complex and might be better suited for a specific step in exampleSteps.ts
// or a higher-level abstraction, as it requires an LLM client instance.
// If you want a generic one here, it would look something like:
// When I solve CAPTCHA using image {string} on page {string} and input {string} on page {string}
// This would require the LLM client to be available in `this.world`.
// For now, skipping direct BaseStep for solveAndFillCaptcha.
