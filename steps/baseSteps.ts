import { When, Then } from '@cucumber/cucumber';
import { ICustomWorld } from './customWorld';
import { expect } from '@playwright/test';

When('I wait for {int} seconds', async function (this: ICustomWorld, seconds: number) {
  await this.page?.waitForTimeout(seconds * 1000);
});

Then('I should see the page title contains {string}', async function (this: ICustomWorld, expectedTitlePart: string) {
  const page = this.page!;
  await expect(page).toHaveTitle(new RegExp(expectedTitlePart));
});

When('I navigate to {string}', async function (this: ICustomWorld, url: string) {
  await this.page?.goto(url);
});

Then('the current URL should be {string}', async function (this: ICustomWorld, expectedUrl: string) {
  const page = this.page!;
  await expect(page).toHaveURL(expectedUrl);
});
