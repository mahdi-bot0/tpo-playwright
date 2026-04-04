/**
 * Loan Upload Page Object
 * Handles all interactions with the loan upload page
 */
import { Page } from '@playwright/test';
import { BasePage } from './basePage.js';
export declare class LoanUploadPage extends BasePage {
    private readonly uploadPageContainer;
    private readonly fileInput;
    private readonly dropZone;
    private readonly selectedFileName;
    private readonly clearFileButton;
    private readonly submitButton;
    private readonly loadingSpinner;
    private readonly successMessage;
    private readonly errorMessage;
    private readonly loanAmountField;
    private readonly borrowerNameField;
    private readonly loanStatusField;
    constructor(page: Page);
    /**
     * Navigate to the loan upload page
     * @param baseUrl - Base URL of the application
     */
    navigateToUploadPage(baseUrl: string): Promise<void>;
    /**
     * Upload a file using the file input
     * @param filePath - Absolute path to the file
     */
    uploadFile(filePath: string): Promise<void>;
    /**
     * Upload a file using drag and drop
     * @param filePath - Absolute path to the file
     */
    uploadFileByDragDrop(filePath: string): Promise<void>;
    /**
     * Get the selected file name
     * @returns Selected file name or empty string
     */
    getSelectedFileName(): Promise<string>;
    /**
     * Clear the selected file
     */
    clearFile(): Promise<void>;
    /**
     * Check if submit button is enabled
     * @returns true if enabled, false if disabled
     */
    isSubmitButtonEnabled(): Promise<boolean>;
    /**
     * Submit the loan form
     * Waits for loading spinner to appear and then disappear
     */
    submitLoan(): Promise<void>;
    /**
     * Wait for navigation to loan details page
     * @param timeout - Optional timeout in milliseconds
     */
    waitForNavigationToLoanDetails(timeout?: number): Promise<void>;
    /**
     * Get success message text
     * @returns Success message or empty string
     */
    getSuccessMessage(): Promise<string>;
    /**
     * Get error message text
     * @returns Error message or empty string
     */
    getErrorMessage(): Promise<string>;
    /**
     * Check if success message is visible
     * @returns true if visible, false otherwise
     */
    isSuccessMessageVisible(): Promise<boolean>;
    /**
     * Check if error message is visible
     * @returns true if visible, false otherwise
     */
    isErrorMessageVisible(): Promise<boolean>;
    /**
     * Get displayed loan amount
     * @returns Loan amount text or empty string
     */
    getLoanAmount(): Promise<string>;
    /**
     * Get displayed borrower name
     * @returns Borrower name text or empty string
     */
    getBorrowerName(): Promise<string>;
    /**
     * Get displayed loan status
     * @returns Loan status text or empty string
     */
    getLoanStatus(): Promise<string>;
    /**
     * Convenience method: Upload file and submit in one action
     * @param filePath - Absolute path to the file
     */
    uploadAndSubmit(filePath: string): Promise<void>;
}
//# sourceMappingURL=loanUploadPage.d.ts.map