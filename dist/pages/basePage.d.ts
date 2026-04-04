/**
 * Base Page Object
 * Provides shared utilities for all page objects
 */
import { Page, Locator } from '@playwright/test';
export declare abstract class BasePage {
    protected page: Page;
    constructor(page: Page);
    /**
     * Get element by data-testid attribute
     * @param testId - data-testid value
     * @returns Locator for the element
     */
    protected getByTestId(testId: string): Locator;
    /**
     * Wait for element to be visible
     * @param locator - Element locator
     * @param timeout - Optional timeout in milliseconds
     */
    protected waitForVisible(locator: Locator, timeout?: number): Promise<void>;
    /**
     * Check if element is visible (non-throwing)
     * @param locator - Element locator
     * @param timeout - Optional timeout in milliseconds (default: 2000ms)
     * @returns true if visible, false otherwise
     */
    protected isVisible(locator: Locator, timeout?: number): Promise<boolean>;
    /**
     * Get trimmed text content from element
     * @param locator - Element locator
     * @returns Trimmed text content or empty string if not found
     */
    protected getTextContent(locator: Locator): Promise<string>;
    /**
     * Navigate to URL
     * @param url - URL to navigate to
     */
    goto(url: string): Promise<void>;
    /**
     * Wait for page to be fully loaded
     */
    waitForPageLoad(): Promise<void>;
}
//# sourceMappingURL=basePage.d.ts.map