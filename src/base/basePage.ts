import { Page, Locator, expect } from '@playwright/test';
import { ICustomWorld } from '@steps/customWorld'; // Ensure your world is correctly imported
// import { getLocator } from './locatorManager'; // We will create this later

export class BasePage {
  protected page: Page;
  // protected world: ICustomWorld; // Optional: if you need access to world context

  constructor(world: ICustomWorld) {
    if (!world.page) {
      throw new Error("Page object is not initialized in the current world context. Ensure hooks are set up correctly.");
    }
    this.page = world.page;
    // this.world = world;
  }

  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url);
  }

  // Locator can be a string selector or a Locator object
  async clickElement(locator: string | Locator, timeout: number = 10000): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'visible', timeout });
    await element.click();
  }

  async fillText(locator: string | Locator, text: string, timeout: number = 10000): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'visible', timeout });
    await element.fill(text);
  }

  async typeText(locator: string | Locator, text: string, options?: { delay?: number, noWaitAfter?: boolean, timeout?: number }): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'visible', timeout: options?.timeout || 10000 });
    await element.type(text, options);
  }

  async getText(locator: string | Locator, timeout: number = 10000): Promise<string | null> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'visible', timeout });
    return element.textContent();
  }

  async getAttribute(locator: string | Locator, attributeName: string, timeout: number = 10000): Promise<string | null> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'visible', timeout });
    return element.getAttribute(attributeName);
  }

  async isVisible(locator: string | Locator, timeout: number = 5000): Promise<boolean> {
    try {
      const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
      await element.waitFor({ state: 'visible', timeout });
      return true;
    } catch (error) {
      return false;
    }
  }

  async isHidden(locator: string | Locator, timeout: number = 5000): Promise<boolean> {
     try {
      const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
      await element.waitFor({ state: 'hidden', timeout });
      return true;
    } catch (error) {
      return false;
    }
  }

  async isEnabled(locator: string | Locator, timeout: number = 5000): Promise<boolean> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'visible', timeout }).catch(() => {}); // wait for visible first
    return element.isEnabled({ timeout });
  }

  async selectOption(locator: string | Locator, value: string | { value?: string, label?: string, index?: number }, timeout: number = 10000): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'visible', timeout });
    await element.selectOption(value);
  }

  async waitForElementVisible(locator: string | Locator, timeout: number = 10000): Promise<Locator> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'visible', timeout });
    return element;
  }

  async waitForElementHidden(locator: string | Locator, timeout: number = 10000): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'hidden', timeout });
  }

  async scrollIntoView(locator: string | Locator, timeout: number = 10000): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'attached', timeout }); // Element should be in DOM first
    await element.scrollIntoViewIfNeeded();
  }

  async hoverElement(locator: string | Locator, timeout: number = 10000): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'visible', timeout });
    await element.hover();
  }

  async takeScreenshot(path?: string, options?: { fullPage?: boolean, timeout?: number }): Promise<Buffer> {
    if (path) {
      return this.page.screenshot({ path, ...options });
    }
    return this.page.screenshot(options);
  }

  async expectElementToHaveText(locator: string | Locator, expectedText: string | RegExp, timeout: number = 10000): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await expect(element).toHaveText(expectedText, { timeout });
  }

  async expectElementToBeVisible(locator: string | Locator, timeout: number = 10000): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await expect(element).toBeVisible({ timeout });
  }

  async expectElementToBeHidden(locator: string | Locator, timeout: number = 10000): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await expect(element).toBeHidden({ timeout });
  }

  async expectElementToBeEnabled(locator: string | Locator, timeout: number = 10000): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await expect(element).toBeEnabled({ timeout });
  }

  async expectElementToBeDisabled(locator: string | Locator, timeout: number = 10000): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await expect(element).toBeDisabled({ timeout });
  }

  // Add more common Playwright actions as needed

  /**
   * Attempts to solve a CAPTCHA using the LLMClient and fill the solution into an input field.
   * @param captchaImageLocator Locator for the CAPTCHA image element.
   * @param captchaInputLocator Locator for the input field where the solution should be entered.
   * @param llmClientInstance An instance of LLMClient.
   * @param maxRetries Maximum number of retries if solving fails.
   * @param instructions Optional instructions for the LLM.
   * @returns Promise<boolean> True if CAPTCHA was solved and filled successfully, false otherwise.
   */
  async solveAndFillCaptcha(
    captchaImageLocator: string | Locator,
    captchaInputLocator: string | Locator,
    llmClientInstance: any, // Should be LLMClient, using 'any' for now to avoid circular deps if LLMClient imports BasePage stuff
    maxRetries: number = 3,
    instructions?: string
  ): Promise<boolean> {
    const imageElement = typeof captchaImageLocator === 'string' ? this.page.locator(captchaImageLocator) : captchaImageLocator;
    const inputElement = typeof captchaInputLocator === 'string' ? this.page.locator(captchaInputLocator) : captchaInputLocator;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      logger.info(`Attempting to solve CAPTCHA, attempt ${attempt}/${maxRetries}`, {
        imageLocator: captchaImageLocator.toString(), // Convert locator to string for logging
        inputLocator: captchaInputLocator.toString(),
      });
      try {
        await imageElement.waitFor({ state: 'visible', timeout: 10000 });
        const imageBuffer = await imageElement.screenshot();
        if (!imageBuffer) {
          logger.error('Failed to capture CAPTCHA image buffer.', { attempt });
          continue;
        }
        const imageBase64 = imageBuffer.toString('base64');

        const response = await llmClientInstance.solveCaptcha(imageBase64, instructions);

        if (response.success && response.data) {
          const captchaSolution = response.data.replace(/[^a-zA-Z0-9]/g, '');
          if (captchaSolution) {
            await this.fillText(inputElement, captchaSolution);
            logger.info(`CAPTCHA solution "${captchaSolution}" filled successfully.`, { attempt });
            return true;
          } else {
            logger.warn(`LLM provided an empty or invalid solution for CAPTCHA.`, { attempt, solution: response.data });
          }
        } else {
          logger.warn(`Failed to solve CAPTCHA with LLM. Error: ${response.error}`, { attempt, llmError: response.error });
        }
      } catch (error: any) {
        ErrorHandler.handle(error, ErrorType.UI_ERROR); // Or potentially LLM_ERROR if the error is from llmClientInstance
        logger.error(`Error during CAPTCHA solving attempt ${attempt}.`, {
          message: error.message,
          stack: error.stack,
          attempt,
        });
      }

      if (attempt < maxRetries) {
        logger.info(`Retrying CAPTCHA after a short delay (2s)...`, { attempt });
        await this.page.waitForTimeout(2000);
        // Optional: Add logic to refresh the CAPTCHA image if possible/needed
      }
    }
    logger.error('Failed to solve CAPTCHA after all retries.', {
        imageLocator: captchaImageLocator.toString(),
        inputLocator: captchaInputLocator.toString(),
        maxRetries
    });
    return false;
  }
}
