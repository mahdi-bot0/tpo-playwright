import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  protected getByTestId(testId: string): Locator {
    return this.page.locator(`[data-testid="${testId}"]`);
  }

  protected async getTextContent(locator: Locator): Promise<string> {
    return (await locator.textContent())?.trim() ?? '';
  }

  protected async waitForVisible(locator: Locator, timeout: number = 5000) {
    await expect(locator).toBeVisible({ timeout });
  }

  protected async goto(url: string) {
    await this.page.goto(url);
  }

  protected async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  protected async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }
}