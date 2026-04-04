/**
 * Loan Upload Page Object
 * Handles all interactions with the loan upload page and real TPO flow
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage.js';

export class LoanUploadPage extends BasePage {
  // Selectors
  private readonly uploadPageContainer: Locator;
  private readonly fileInput: Locator;
  private readonly dropZone: Locator;
  private readonly selectedFileName: Locator;
  private readonly clearFileButton: Locator;
  private readonly submitButton: Locator;
  private readonly loadingSpinner: Locator;
  private readonly successMessage: Locator;
  private readonly errorMessage: Locator;
  private readonly loanAmountField: Locator;
  private readonly borrowerNameField: Locator;
  private readonly loanStatusField: Locator;

  constructor(page: Page) {
    super(page);

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

  /** Navigate to the loan upload page */
  async navigateToUploadPage(baseUrl: string): Promise<void> {
    await this.goto(`${baseUrl}/loans/upload`);
    await this.waitForPageLoad();
    await this.waitForVisible(this.uploadPageContainer);
  }

  /** Upload a file using the file input */
  async uploadFile(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
    await this.waitForVisible(this.selectedFileName);
  }

  /** Get the selected file name */
  async getSelectedFileName(): Promise<string> {
    return await this.getTextContent(this.selectedFileName);
  }

  /** Clear the selected file */
  async clearFile(): Promise<void> {
    await this.clearFileButton.click();
  }

  /** Check if submit button is enabled */
  async isSubmitButtonEnabled(): Promise<boolean> {
    return await this.submitButton.isEnabled();
  }

  /** Submit the loan form */
  async submitLoan(): Promise<void> {
    await this.submitButton.click();
    await this.waitForVisible(this.loadingSpinner, 5000);
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 30000 });
  }

  /** Wait for navigation to loan details page */
  async waitForNavigationToLoanDetails(timeout: number = 10000): Promise<void> {
    await this.page.waitForURL(/\/loans\/\d+/, { timeout });
  }

  /** Get success message text */
  async getSuccessMessage(): Promise<string> {
    return await this.getTextContent(this.successMessage);
  }

  /** Get error message text */
  async getErrorMessage(): Promise<string> {
    return await this.getTextContent(this.errorMessage);
  }

  /** Check if success message is visible */
  async isSuccessMessageVisible(): Promise<boolean> {
    return await this.isVisible(this.successMessage);
  }

  /** Check if error message is visible */
  async isErrorMessageVisible(): Promise<boolean> {
    return await this.isVisible(this.errorMessage);
  }

  /** Get displayed loan amount */
  async getLoanAmount(): Promise<string> {
    return await this.getTextContent(this.loanAmountField);
  }

  /** Get displayed borrower name */
  async getBorrowerName(): Promise<string> {
    return await this.getTextContent(this.borrowerNameField);
  }

  /** Get displayed loan status */
  async getLoanStatus(): Promise<string> {
    return await this.getTextContent(this.loanStatusField);
  }

  /** Select Loan Officer & Processor if missing */
  async selectLoanOfficerIfMissing(): Promise<void> {
    const officerVisible = await this.page.locator('[data-testid="loan-officer"]').isVisible();
    if (!officerVisible) {
      await this.page.getByLabel(/loan officer/i).click();
      await this.page.getByText(/first/i).click();
      await this.page.getByLabel(/loan processor/i).click();
      await this.page.getByText(/first/i).click();
    }
  }

  /** Click "Create Loan" and wait for success messages */
  async createLoan(): Promise<void> {
    await this.page.getByRole('button', { name: /create loan/i }).click();
    await this.page.waitForSelector('text=Loan .* created', { timeout: 15000 });
    await this.page.waitForSelector('text=synced to encompass', { timeout: 15000 });
  }

  /** Navigate through multiple tabs by name */
  async navigateTabs(...tabs: string[]): Promise<void> {
    for (const tab of tabs) {
      await this.page.getByRole('tab', { name: new RegExp(tab, 'i') }).click();
    }
  }

  /** Full loan upload workflow: upload, officer selection, submit, create loan */
  async fullLoanUploadFlow(filePath: string): Promise<void> {
    await this.uploadFile(filePath);
    await this.selectLoanOfficerIfMissing();
    await this.submitLoan();
    await this.createLoan();
  }
}