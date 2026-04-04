/**
 * Loan Upload Page Object
 * Handles all interactions with the loan upload page
 */
import { BasePage } from './basePage.js';
export class LoanUploadPage extends BasePage {
    // Selectors
    uploadPageContainer;
    fileInput;
    dropZone;
    selectedFileName;
    clearFileButton;
    submitButton;
    loadingSpinner;
    successMessage;
    errorMessage;
    loanAmountField;
    borrowerNameField;
    loanStatusField;
    constructor(page) {
        super(page);
        // Initialize locators in constructor for performance
        this.uploadPageContainer = this.getByTestId('upload-page-container');
        this.fileInput = this.getByTestId('file-input');
        this.dropZone = this.getByTestId('drop-zone');
        this.selectedFileName = this.getByTestId('selected-file-name');
        this.clearFileButton = this.getByTestId('clear-file-button');
        this.submitButton = this.getByTestId('submit-button');
        this.loadingSpinner = this.getByTestId('loading-spinner');
        this.successMessage = this.getByTestId('success-message');
        this.errorMessage = this.getByTestId('error-message');
        this.loanAmountField = this.getByTestId('loan-amount');
        this.borrowerNameField = this.getByTestId('borrower-name');
        this.loanStatusField = this.getByTestId('loan-status');
    }
    /**
     * Navigate to the loan upload page
     * @param baseUrl - Base URL of the application
     */
    async navigateToUploadPage(baseUrl) {
        await this.goto(`${baseUrl}/loans/upload`);
        await this.waitForPageLoad();
        await this.waitForVisible(this.uploadPageContainer);
    }
    /**
     * Upload a file using the file input
     * @param filePath - Absolute path to the file
     */
    async uploadFile(filePath) {
        await this.fileInput.setInputFiles(filePath);
        // Wait for file name to appear
        await this.waitForVisible(this.selectedFileName);
    }
    /**
     * Upload a file using drag and drop
     * @param filePath - Absolute path to the file
     */
    async uploadFileByDragDrop(filePath) {
        // Create a DataTransfer object with the file
        const buffer = await this.page.evaluate(async (path) => {
            const response = await fetch(path);
            const arrayBuffer = await response.arrayBuffer();
            return Array.from(new Uint8Array(arrayBuffer));
        }, filePath);
        await this.dropZone.dispatchEvent('drop', {
            dataTransfer: {
                files: [
                    {
                        name: filePath.split('/').pop(),
                        type: 'text/xml',
                    },
                ],
            },
        });
        await this.waitForVisible(this.selectedFileName);
    }
    /**
     * Get the selected file name
     * @returns Selected file name or empty string
     */
    async getSelectedFileName() {
        return await this.getTextContent(this.selectedFileName);
    }
    /**
     * Clear the selected file
     */
    async clearFile() {
        await this.clearFileButton.click();
    }
    /**
     * Check if submit button is enabled
     * @returns true if enabled, false if disabled
     */
    async isSubmitButtonEnabled() {
        return await this.submitButton.isEnabled();
    }
    /**
     * Submit the loan form
     * Waits for loading spinner to appear and then disappear
     */
    async submitLoan() {
        await this.submitButton.click();
        // Wait for loading spinner to appear
        await this.waitForVisible(this.loadingSpinner, 5000);
        // Wait for loading spinner to disappear (30s timeout for upload processing)
        await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 30000 });
    }
    /**
     * Wait for navigation to loan details page
     * @param timeout - Optional timeout in milliseconds
     */
    async waitForNavigationToLoanDetails(timeout = 10000) {
        await this.page.waitForURL(/\/loans\/\d+/, { timeout });
    }
    /**
     * Get success message text
     * @returns Success message or empty string
     */
    async getSuccessMessage() {
        return await this.getTextContent(this.successMessage);
    }
    /**
     * Get error message text
     * @returns Error message or empty string
     */
    async getErrorMessage() {
        return await this.getTextContent(this.errorMessage);
    }
    /**
     * Check if success message is visible
     * @returns true if visible, false otherwise
     */
    async isSuccessMessageVisible() {
        return await this.isVisible(this.successMessage);
    }
    /**
     * Check if error message is visible
     * @returns true if visible, false otherwise
     */
    async isErrorMessageVisible() {
        return await this.isVisible(this.errorMessage);
    }
    /**
     * Get displayed loan amount
     * @returns Loan amount text or empty string
     */
    async getLoanAmount() {
        return await this.getTextContent(this.loanAmountField);
    }
    /**
     * Get displayed borrower name
     * @returns Borrower name text or empty string
     */
    async getBorrowerName() {
        return await this.getTextContent(this.borrowerNameField);
    }
    /**
     * Get displayed loan status
     * @returns Loan status text or empty string
     */
    async getLoanStatus() {
        return await this.getTextContent(this.loanStatusField);
    }
    /**
     * Convenience method: Upload file and submit in one action
     * @param filePath - Absolute path to the file
     */
    async uploadAndSubmit(filePath) {
        await this.uploadFile(filePath);
        await this.submitLoan();
    }
}
//# sourceMappingURL=loanUploadPage.js.map