import { Given, When, Then, World, setWorldConstructor } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';
import { ICustomWorld } from './customWorld';

Given('I am on the Playwright website', async function (this: ICustomWorld) {
  const page = this.page!;
  await page.goto('https://playwright.dev/');
});

When('I check the title', async function () {
});

Then('the title should contain {string}', async function (this: ICustomWorld, expectedTitlePart: string) {
  const page = this.page!;
  await expect(page).toHaveTitle(new RegExp(expectedTitlePart));
});
