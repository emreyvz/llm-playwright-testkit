import { Page, Locator, expect, FrameLocator } from '@playwright/test';
import { ICustomWorld } from '../steps/customWorld';
import logger from '../utils/logger';
import { ErrorHandler, ErrorType } from '../base/errorHandler';
import { getLocator, getDynamicLocator } from '../base/locatorManager';

export class BasePage {
  protected page: Page;

  constructor(world: ICustomWorld) {
    if (!world.page) {
      const err = new Error("Page object is not initialized in the current world context. Ensure hooks are set up correctly.");
      ErrorHandler.handle(err, ErrorType.VALIDATION_ERROR);
      throw err;
    }
    this.page = world.page;
  }

  private getElement(
    pageName: string,
    elementKey: string,
    options?: {
      hasText?: string | RegExp;
      hasNotText?: string | RegExp;
      has?: Locator;
      hasNot?: Locator;
      nth?: number;
    }
  ): Locator {
    return getLocator(this.page, pageName, elementKey, options);
  }

  async navigateTo(url: string): Promise<void> {
    try {
      logger.info(`Navigating to URL: ${url}`);
      await this.page.goto(url);
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.NAVIGATION_ERROR);
      throw error;
    }
  }

  async clickElement(
    pageName: string,
    elementKey: string,
    options?: {
      button?: 'left' | 'right' | 'middle';
      clickCount?: number;
      delay?: number;
      position?: { x: number; y: number };
      timeout?: number;
      nth?: number;
    }
  ): Promise<void> {
    const timeout = options?.timeout || 10000;
    try {
      logger.info(`Clicking element: ${pageName}.${elementKey}`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await element.waitFor({ state: 'visible', timeout });
      await element.click({
        button: options?.button,
        clickCount: options?.clickCount,
        delay: options?.delay,
        position: options?.position,
        timeout: timeout,
      });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.UI_ACTION_ERROR);
      throw error;
    }
  }

  async fillElement(
    pageName: string,
    elementKey: string,
    text: string,
    options?: { timeout?: number; nth?: number }
  ): Promise<void> {
    const timeout = options?.timeout || 10000;
    try {
      logger.info(`Filling element: ${pageName}.${elementKey} with text: "${text}"`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await element.waitFor({ state: 'visible', timeout });
      await element.fill(text, { timeout });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.UI_ACTION_ERROR);
      throw error;
    }
  }

  async typeElement(
    pageName: string,
    elementKey: string,
    text: string,
    options?: { delay?: number; timeout?: number; nth?: number }
  ): Promise<void> {
    const timeout = options?.timeout || 10000;
    try {
      logger.info(`Typing into element: ${pageName}.${elementKey} text: "${text}"`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await element.waitFor({ state: 'visible', timeout });
      await element.type(text, { delay: options?.delay, timeout });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.UI_ACTION_ERROR);
      throw error;
    }
  }

  async getElementText(
    pageName: string,
    elementKey: string,
    options?: { timeout?: number; nth?: number }
  ): Promise<string | null> {
    const timeout = options?.timeout || 10000;
    try {
      logger.debug(`Getting text from element: ${pageName}.${elementKey}`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await element.waitFor({ state: 'visible', timeout });
      return await element.textContent();
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.UI_QUERY_ERROR);
      throw error;
    }
  }

  async getElementAttribute(
    pageName: string,
    elementKey: string,
    attributeName: string,
    options?: { timeout?: number; nth?: number }
  ): Promise<string | null> {
    const timeout = options?.timeout || 10000;
    try {
      logger.debug(`Getting attribute "${attributeName}" from element: ${pageName}.${elementKey}`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await element.waitFor({ state: 'visible', timeout });
      return await element.getAttribute(attributeName, { timeout });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.UI_QUERY_ERROR);
      throw error;
    }
  }

  async isElementVisible(
    pageName: string,
    elementKey: string,
    options?: { timeout?: number; nth?: number }
  ): Promise<boolean> {
    const timeout = options?.timeout || 5000;
    try {
      logger.debug(`Checking visibility of element: ${pageName}.${elementKey}`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await element.waitFor({ state: 'visible', timeout });
      return true;
    } catch (error) {
      logger.warn(`Element ${pageName}.${elementKey} is not visible within ${timeout}ms.`);
      return false;
    }
  }

  async isElementHidden(
    pageName: string,
    elementKey: string,
    options?: { timeout?: number; nth?: number }
  ): Promise<boolean> {
    const timeout = options?.timeout || 5000;
    try {
      logger.debug(`Checking if element is hidden: ${pageName}.${elementKey}`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await element.waitFor({ state: 'hidden', timeout });
      return true;
    } catch (error) {
      logger.warn(`Element ${pageName}.${elementKey} is not hidden (still visible or attached) within ${timeout}ms.`);
      return false;
    }
  }

  async isElementEnabled(
    pageName: string,
    elementKey: string,
    options?: { timeout?: number; nth?: number }
  ): Promise<boolean> {
    const timeout = options?.timeout || 5000;
    try {
      logger.debug(`Checking if element is enabled: ${pageName}.${elementKey}`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await element.waitFor({ state: 'visible', timeout }).catch(() => {
        logger.warn(`Element ${pageName}.${elementKey} not visible before checking enabled state.`);
      });
      return await element.isEnabled({ timeout });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.UI_QUERY_ERROR);
      throw error;
    }
  }

  async selectOptionByLabel(
    pageName: string,
    elementKey: string,
    label: string | string[] | { label: string } | { label: string }[],
    options?: { timeout?: number; nth?: number }
  ): Promise<void> {
    const timeout = options?.timeout || 10000;
    try {
      logger.info(`Selecting option by label: "${JSON.stringify(label)}" for element: ${pageName}.${elementKey}`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await element.waitFor({ state: 'visible', timeout });
      await element.selectOption(label as any, { timeout });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.UI_ACTION_ERROR);
      throw error;
    }
  }

  async waitForElementToBeVisible(
    pageName: string,
    elementKey: string,
    timeout: number = 10000,
    nth?: number
  ): Promise<Locator> {
    try {
      logger.debug(`Waiting for element to be visible: ${pageName}.${elementKey}`, { timeout, nth });
      const element = this.getElement(pageName, elementKey, { nth });
      await element.waitFor({ state: 'visible', timeout });
      return element;
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.WAIT_ERROR);
      throw error;
    }
  }

  async waitForElementToBeHidden(
    pageName: string,
    elementKey: string,
    timeout: number = 10000,
    nth?: number
  ): Promise<void> {
    try {
      logger.debug(`Waiting for element to be hidden: ${pageName}.${elementKey}`, { timeout, nth });
      const element = this.getElement(pageName, elementKey, { nth });
      await element.waitFor({ state: 'hidden', timeout });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.WAIT_ERROR);
      throw error;
    }
  }

  async scrollToElement(
    pageName: string,
    elementKey: string,
    options?: { timeout?: number; nth?: number }
  ): Promise<void> {
    const timeout = options?.timeout || 10000;
    try {
      logger.info(`Scrolling to element: ${pageName}.${elementKey}`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await element.waitFor({ state: 'attached', timeout }); // Element should at least be in the DOM
      await element.scrollIntoViewIfNeeded({ timeout });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.UI_ACTION_ERROR);
      throw error;
    }
  }

  async hoverElement(
    pageName: string,
    elementKey: string,
    options?: { timeout?: number; nth?: number }
  ): Promise<void> {
    const timeout = options?.timeout || 10000;
    try {
      logger.info(`Hovering over element: ${pageName}.${elementKey}`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await element.waitFor({ state: 'visible', timeout });
      await element.hover({ timeout });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.UI_ACTION_ERROR);
      throw error;
    }
  }

  async takeFullPageScreenshot(path: string, options?: { timeout?: number }): Promise<Buffer> {
    try {
      logger.info(`Taking full page screenshot, saving to: ${path}`, { options });
      return await this.page.screenshot({ path, fullPage: true, timeout: options?.timeout });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.IO_ERROR);
      throw error;
    }
  }

  async expectElementToHaveText(
    pageName: string,
    elementKey: string,
    expectedText: string | RegExp,
    options?: { timeout?: number; nth?: number }
  ): Promise<void> {
    const timeout = options?.timeout || 10000;
    try {
      logger.debug(`Expecting element ${pageName}.${elementKey} to have text: "${expectedText}"`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await expect(element).toHaveText(expectedText, { timeout });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.ASSERTION_ERROR);
      throw error;
    }
  }

  async expectElementToBeVisible(
    pageName: string,
    elementKey: string,
    options?: { timeout?: number; nth?: number }
  ): Promise<void> {
    const timeout = options?.timeout || 10000;
    try {
      logger.debug(`Expecting element ${pageName}.${elementKey} to be visible`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await expect(element).toBeVisible({ timeout });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.ASSERTION_ERROR);
      throw error;
    }
  }

  async expectElementToBeHidden(
    pageName: string,
    elementKey: string,
    options?: { timeout?: number; nth?: number }
  ): Promise<void> {
    const timeout = options?.timeout || 10000;
    try {
      logger.debug(`Expecting element ${pageName}.${elementKey} to be hidden`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await expect(element).toBeHidden({ timeout });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.ASSERTION_ERROR);
      throw error;
    }
  }

  async expectElementToBeEnabled(
    pageName: string,
    elementKey: string,
    options?: { timeout?: number; nth?: number }
  ): Promise<void> {
    const timeout = options?.timeout || 10000;
    try {
      logger.debug(`Expecting element ${pageName}.${elementKey} to be enabled`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await expect(element).toBeEnabled({ timeout });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.ASSERTION_ERROR);
      throw error;
    }
  }

  async expectElementToBeDisabled(
    pageName: string,
    elementKey: string,
    options?: { timeout?: number; nth?: number }
  ): Promise<void> {
    const timeout = options?.timeout || 10000;
    try {
      logger.debug(`Expecting element ${pageName}.${elementKey} to be disabled`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await expect(element).toBeDisabled({ timeout });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.ASSERTION_ERROR);
      throw error;
    }
  }

  // Placeholder for solveAndFillCaptcha - will need to update its locator parameters
  async solveAndFillCaptcha(
    captchaImagePageName: string,
    captchaImageElementKey: string,
    captchaInputPageName: string,
    captchaInputElementKey: string,
    llmClientInstance: any, // Consider defining a type/interface for this
    maxRetries: number = 3,
    instructions?: string
  ): Promise<boolean> {
    logger.info(`Starting CAPTCHA solving process for image ${captchaImagePageName}.${captchaImageElementKey} and input ${captchaInputPageName}.${captchaInputElementKey}`);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      logger.info(`Attempting to solve CAPTCHA, attempt ${attempt}/${maxRetries}`);
      try {
        const imageElement = this.getElement(captchaImagePageName, captchaImageElementKey);
        // Input element is resolved later, only if image is processed

        await imageElement.waitFor({ state: 'visible', timeout: 10000 });
        const imageBuffer = await imageElement.screenshot();
        if (!imageBuffer) {
          logger.error('Failed to capture CAPTCHA image buffer.', { attempt, captchaImagePageName, captchaImageElementKey });
          continue;
        }
        const imageBase64 = imageBuffer.toString('base64');

        const response = await llmClientInstance.solveCaptcha(imageBase64, instructions); // Assuming llmClientInstance is correctly passed

        if (response.success && response.data) {
          const captchaSolution = response.data.replace(/[^a-zA-Z0-9]/g, '');
          if (captchaSolution) {
            // Now get the input element and fill it
            await this.fillElement(captchaInputPageName, captchaInputElementKey, captchaSolution, {timeout: 5000});
            logger.info(`CAPTCHA solution "${captchaSolution}" filled successfully.`, { attempt });
            return true;
          } else {
            logger.warn(`LLM provided an empty or invalid solution for CAPTCHA.`, { attempt, solution: response.data });
          }
        } else {
          logger.warn(`Failed to solve CAPTCHA with LLM. Error: ${response.error}`, { attempt, llmError: response.error });
        }
      } catch (error: any) {
        // ErrorHandler.handle is called within fillElement if it fails.
        // We need to handle errors from getElement, screenshot, or llmClientInstance.solveCaptcha
        ErrorHandler.handle(error, ErrorType.CAPTCHA_ERROR);
      }

      if (attempt < maxRetries) {
        logger.info(`Retrying CAPTCHA after a short delay (2s)...`, { attempt });
        await this.page.waitForTimeout(2000); // Use page.waitForTimeout for delays
      }
    }
    logger.error('Failed to solve CAPTCHA after all retries.', {
        captchaImagePageName, captchaImageElementKey,
        captchaInputPageName, captchaInputElementKey,
        maxRetries
    });
    return false;
  }

  async rightClickElement(
    pageName: string,
    elementKey: string,
    options?: { delay?: number; position?: { x: number; y: number }; timeout?: number; nth?: number }
  ): Promise<void> {
    const timeout = options?.timeout || 10000;
    try {
      logger.info(`Right-clicking element: ${pageName}.${elementKey}`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await element.waitFor({ state: 'visible', timeout });
      await element.click({ button: 'right', delay: options?.delay, position: options?.position, timeout });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.UI_ACTION_ERROR);
      throw error;
    }
  }

  async doubleClickElement(
    pageName: string,
    elementKey: string,
    options?: { delay?: number; position?: { x: number; y: number }; timeout?: number; nth?: number }
  ): Promise<void> {
    const timeout = options?.timeout || 10000;
    try {
      logger.info(`Double-clicking element: ${pageName}.${elementKey}`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await element.waitFor({ state: 'visible', timeout });
      await element.dblclick({ delay: options?.delay, position: options?.position, timeout });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.UI_ACTION_ERROR);
      throw error;
    }
  }

  async clickAndHoldElement(
    pageName: string,
    elementKey: string,
    options?: { timeout?: number; nth?: number }
  ): Promise<void> {
    const timeout = options?.timeout || 10000;
    try {
      logger.info(`Clicking and holding element: ${pageName}.${elementKey}`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await element.waitFor({ state: 'visible', timeout });
      const boundingBox = await element.boundingBox();
      if (boundingBox) {
        await this.page.mouse.move(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
        await this.page.mouse.down();
        logger.info(`Mouse down performed on ${pageName}.${elementKey}. Remember to call mouse.up() or a drag/drop action.`);
      } else {
        throw new Error('Element bounding box not found for clickAndHold.');
      }
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.UI_ACTION_ERROR);
      throw error;
    }
  }

  async releaseMouse(): Promise<void> {
    try {
      logger.info('Releasing mouse (mouse.up())');
      await this.page.mouse.up();
    } catch (error: any) {
        ErrorHandler.handle(error, ErrorType.UI_ACTION_ERROR);
        throw error;
    }
  }

  async dragAndDropElement(
    sourcePageName: string,
    sourceElementKey: string,
    targetPageName: string,
    targetElementKey: string,
    options?: { sourcePosition?: { x: number; y: number }; targetPosition?: { x: number; y: number }; timeout?: number; sourceNth?: number; targetNth?: number }
  ): Promise<void> {
    const timeout = options?.timeout || 10000;
    try {
      logger.info(`Dragging element ${sourcePageName}.${sourceElementKey} to ${targetPageName}.${targetElementKey}`, { options });
      const sourceElement = this.getElement(sourcePageName, sourceElementKey, { nth: options?.sourceNth });
      const targetElement = this.getElement(targetPageName, targetElementKey, { nth: options?.targetNth });
      await sourceElement.waitFor({ state: 'visible', timeout });
      await targetElement.waitFor({ state: 'visible', timeout });
      await sourceElement.dragTo(targetElement, {
        sourcePosition: options?.sourcePosition,
        targetPosition: options?.targetPosition,
        timeout,
      });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.UI_ACTION_ERROR);
      throw error;
    }
  }

  async clearElement(
    pageName: string,
    elementKey: string,
    options?: { timeout?: number; nth?: number }
  ): Promise<void> {
    const timeout = options?.timeout || 10000;
    try {
      logger.info(`Clearing element: ${pageName}.${elementKey}`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await element.waitFor({ state: 'visible', timeout });
      await element.fill('', { timeout }); // Playwright's recommended way to clear
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.UI_ACTION_ERROR);
      throw error;
    }
  }

  async isElementChecked(
    pageName: string,
    elementKey: string,
    options?: { timeout?: number; nth?: number }
  ): Promise<boolean> {
    const timeout = options?.timeout || 5000;
    try {
      logger.debug(`Checking if element is checked: ${pageName}.${elementKey}`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await element.waitFor({ state: 'visible', timeout }); // Ensure it's visible before checking state
      return await element.isChecked({ timeout });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.UI_QUERY_ERROR);
      throw error;
    }
  }

  async switchToFrame(
    framePageName: string,
    frameElementKey: string,
    options?: { timeout?: number; nth?: number }
  ): Promise<FrameLocator | null> {
    const timeout = options?.timeout || 10000;
    try {
      logger.info(`Switching to frame: ${framePageName}.${frameElementKey}`, { options });
      const frameAsElement = this.getElement(framePageName, frameElementKey, { nth: options?.nth });
      await frameAsElement.waitFor({ state: 'attached', timeout });
      const frameLocator = this.page.frameLocator(this.getLocatorString(framePageName, frameElementKey));
      logger.info(`Successfully switched to frame: ${framePageName}.${frameElementKey}. Subsequent element interactions will be relative to this frame if using the returned FrameLocator's methods.`);
      return frameLocator;
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.FRAME_ERROR);
      throw error;
    }
  }

  private getLocatorString(pageName: string, elementKey: string): string {
    const { getLocatorString: getString } = require('./locatorManager');
    return getString(pageName, elementKey);
  }


  async switchToDefaultContent(): Promise<void> {
    try {
      logger.info('Switching to default content (main frame).');
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.FRAME_ERROR);
      throw error;
    }
  }

  async getCurrentPage(): Promise<Page> {
    return this.page;
  }

  async switchToPage(pageIndexOrPredicate: number | ((p: Page) => boolean | Promise<boolean>)): Promise<Page | null> {
    try {
      logger.info(`Attempting to switch page. Index/Predicate: ${pageIndexOrPredicate.toString()}`);
      const context = this.page.context();
      const pages = context.pages();

      let targetPage: Page | undefined;

      if (typeof pageIndexOrPredicate === 'number') {
        if (pageIndexOrPredicate >= 0 && pageIndexOrPredicate < pages.length) {
          targetPage = pages[pageIndexOrPredicate];
        } else {
          logger.error(`Page index ${pageIndexOrPredicate} is out of bounds. Available pages: ${pages.length}`);
          return null;
        }
      } else {
        for (const p of pages) {
          if (await pageIndexOrPredicate(p)) {
            targetPage = p;
            break;
          }
        }
      }

      if (targetPage) {
        logger.info(`Switching to page with URL: ${targetPage.url()}`);
        this.page = targetPage; // Update current page reference
        await this.page.bringToFront();
        return this.page;
      } else {
        logger.warn('Could not find a page matching the criteria.');
        return null;
      }
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.PAGE_ERROR);
      throw error;
    }
  }

  async closeCurrentPage(): Promise<void> {
    try {
      logger.info(`Closing current page: ${this.page.url()}`);
      await this.page.close();
      const context = this.page.context();
      if (context.pages().length > 0) {
         this.page = context.pages()[context.pages().length -1];
         logger.info(`Switched to new current page: ${this.page.url()}`);
      } else {
         logger.warn('No other pages open after closing. The browser context might be empty.');
      }
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.PAGE_ERROR);
      throw error;
    }
  }

  async scrollPage(deltaX: number, deltaY: number): Promise<void> {
    try {
      logger.info(`Scrolling page by X: ${deltaX}, Y: ${deltaY}`);
      await this.page.mouse.wheel(deltaX, deltaY);
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.UI_ACTION_ERROR);
      throw error;
    }
  }

  async takeScreenshotOfElement(
    pageName: string,
    elementKey: string,
    path: string,
    options?: { timeout?: number; nth?: number }
  ): Promise<Buffer> {
    const timeout = options?.timeout || 10000;
    try {
      logger.info(`Taking screenshot of element: ${pageName}.${elementKey}, saving to: ${path}`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await element.waitFor({ state: 'visible', timeout });
      return await element.screenshot({ path, timeout });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.IO_ERROR);
      throw error;
    }
  }

  async waitForElementToBeClickable(
    pageName: string,
    elementKey: string,
    timeout: number = 10000,
    nth?: number
  ): Promise<Locator> {
    try {
      logger.debug(`Waiting for element to be clickable: ${pageName}.${elementKey}`, { timeout, nth });
      const element = this.getElement(pageName, elementKey, { nth });
      await element.waitFor({ state: 'visible', timeout }); 
      return element;
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.WAIT_ERROR);
      throw error;
    }
  }

  async selectOptionByValue(
    pageName: string,
    elementKey: string,
    value: string | string[] | { value: string } | { value: string }[],
    options?: { timeout?: number; nth?: number }
  ): Promise<void> {
    const timeout = options?.timeout || 10000;
    try {
      logger.info(`Selecting option by value: "${JSON.stringify(value)}" for element: ${pageName}.${elementKey}`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await element.waitFor({ state: 'visible', timeout });
      await element.selectOption(value as any, { timeout });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.UI_ACTION_ERROR);
      throw error;
    }
  }

  async selectOptionByIndex(
    pageName: string,
    elementKey: string,
    index: number | number[] | { index: number } | { index: number }[],
    options?: { timeout?: number; nth?: number }
  ): Promise<void> {
    const timeout = options?.timeout || 10000;
    try {
      logger.info(`Selecting option by index: "${JSON.stringify(index)}" for element: ${pageName}.${elementKey}`, { options });
      const element = this.getElement(pageName, elementKey, { nth: options?.nth });
      await element.waitFor({ state: 'visible', timeout });
      await element.selectOption(index as any, { timeout });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.UI_ACTION_ERROR);
      throw error;
    }
  }

  async getElementSelectOptions(
    pageName: string,
    elementKey: string,
    options?: { timeout?: number; nth?: number }
  ): Promise<{ label: string; value: string; selected: boolean }[]> {
    const timeout = options?.timeout || 10000;
    try {
      logger.debug(`Getting select options for element: ${pageName}.${elementKey}`, { options });
      const selectElement = this.getElement(pageName, elementKey, { nth: options?.nth });
      await selectElement.waitFor({ state: 'visible', timeout });

      return await selectElement.evaluate((select: HTMLSelectElement) => {
        return Array.from(select.options).map(option => ({
          label: option.label,
          value: option.value,
          selected: option.selected,
        }));
      });
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.UI_QUERY_ERROR);
      throw error;
    }
  }

  async acceptDialog(options?: { timeout?: number }): Promise<void> {
    const timeout = options?.timeout || 5000; // Dialogs usually appear quickly
    try {
      logger.info('Attempting to accept dialog.');
      const dialog = await this.page.waitForEvent('dialog', { timeout }).catch(() => null);
      if (dialog) {
        logger.info(`Dialog found with message: "${dialog.message()}". Accepting.`);
        await dialog.accept();
      } else {
        logger.warn('No dialog appeared to accept within timeout.');
      }
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.DIALOG_ERROR);
      throw error;
    }
  }

  async dismissDialog(options?: { timeout?: number }): Promise<void> {
    const timeout = options?.timeout || 5000;
    try {
      logger.info('Attempting to dismiss dialog.');
      const dialog = await this.page.waitForEvent('dialog', { timeout }).catch(() => null);
      if (dialog) {
        logger.info(`Dialog found with message: "${dialog.message()}". Dismissing.`);
        await dialog.dismiss();
      } else {
        logger.warn('No dialog appeared to dismiss within timeout.');
      }
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.DIALOG_ERROR);
      throw error;
    }
  }

  async getDialogMessage(options?: { timeout?: number }): Promise<string | null> {
    const timeout = options?.timeout || 2000;
    try {
      logger.info('Attempting to get dialog message.');
      let message: string | null = null;
      const dialogPromise = new Promise<string | null>((resolve) => {
        const handler = (dialog: any) => {
          this.page.off('dialog', handler); // Remove listener after first catch
          resolve(dialog.message());
        };
        this.page.on('dialog', handler);
      });

      const result = await Promise.race([
        dialogPromise,
        this.page.waitForTimeout(timeout).then(() => 'timeout'),
      ]);

      if (result === 'timeout') {
        logger.warn('No dialog message captured within timeout.');
        this.page.removeAllListeners('dialog'); // Clean up if timeout
        return null;
      }
      message = result;
      logger.info(`Dialog message captured: "${message}"`);
      return message;

    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.DIALOG_ERROR);
      return null;
    }
  }

  async fillInDialog(promptText: string, options?: { timeout?: number }): Promise<void> {
    const timeout = options?.timeout || 5000;
    try {
      logger.info(`Attempting to fill dialog with text: "${promptText}"`);
      const dialog = await this.page.waitForEvent('dialog', { timeout }).catch(() => null);
      if (dialog) {
        if (dialog.type() === 'prompt') {
          logger.info(`Prompt dialog found with message: "${dialog.message()}". Accepting with text: "${promptText}".`);
          await dialog.accept(promptText);
        } else {
          logger.warn(`Dialog found, but it is not a prompt. Type: ${dialog.type()}. Cannot fill text. Dismissing.`);
          await dialog.dismiss();
          throw new Error(`Dialog was of type ${dialog.type()}, not 'prompt'.`);
        }
      } else {
        logger.warn('No dialog appeared to fill within timeout.');
        throw new Error('Dialog not found to fill.');
      }
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.DIALOG_ERROR);
      throw error;
    }
  }

  async executeJavaScript(script: string | ((arg?: any) => any), arg?: any): Promise<void> {
    try {
      logger.info('Executing JavaScript.', { script: script.toString(), arg });
      await this.page.evaluate(script as any, arg);
    } catch (error: any) {
      ErrorHandler.handle(error, ErrorType.JAVASCRIPT_ERROR);
      throw error;
    }
  }
}
