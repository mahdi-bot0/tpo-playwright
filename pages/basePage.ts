/**
 * Base Page Object
 * Provides shared utilities for all page objects
 */

import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get element by data-testid attribute
   * @param testId - data-testid value
   * @returns Locator for the element
   */
  protected getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Wait for element to be visible
   * @param locator - Element locator
   * @param timeout - Optional timeout in milliseconds
   */
  protected async waitForVisible(locator: Locator, timeout?: number): Promise<void> {
    const options: { state: 'visible'; timeout?: number } = { state: 'visible' };
    if (timeout !== undefined) {
      options.timeout = timeout;
    }
    await locator.waitFor(options);
  }

  /**
   * Check if element is visible (non-throwing)
   * @param locator - Element locator
   * @param timeout - Optional timeout in milliseconds (default: 2000ms)
   * @returns true if visible, false otherwise
   */
  protected async isVisible(locator: Locator, timeout: number = 2000): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get trimmed text content from element
   * @param locator - Element locator
   * @returns Trimmed text content or empty string if not found
   */
  protected async getTextContent(locator: Locator): Promise<string> {
    try {
      const text = await locator.textContent();
      return text?.trim() || '';
    } catch {
      return '';
    }
  }

  /**
   * Navigate to URL
   * @param url - URL to navigate to
   */
  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }
}
