/**
 * Base Page Object
 * Provides shared utilities for all page objects
 */
export class BasePage {
    page;
    constructor(page) {
        this.page = page;
    }
    /**
     * Get element by data-testid attribute
     * @param testId - data-testid value
     * @returns Locator for the element
     */
    getByTestId(testId) {
        return this.page.getByTestId(testId);
    }
    /**
     * Wait for element to be visible
     * @param locator - Element locator
     * @param timeout - Optional timeout in milliseconds
     */
    async waitForVisible(locator, timeout) {
        const options = { state: 'visible' };
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
    async isVisible(locator, timeout = 2000) {
        try {
            await locator.waitFor({ state: 'visible', timeout });
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Get trimmed text content from element
     * @param locator - Element locator
     * @returns Trimmed text content or empty string if not found
     */
    async getTextContent(locator) {
        try {
            const text = await locator.textContent();
            return text?.trim() || '';
        }
        catch {
            return '';
        }
    }
    /**
     * Navigate to URL
     * @param url - URL to navigate to
     */
    async goto(url) {
        await this.page.goto(url);
    }
    /**
     * Wait for page to be fully loaded
     */
    async waitForPageLoad() {
        await this.page.waitForLoadState('domcontentloaded');
    }
}
//# sourceMappingURL=basePage.js.map