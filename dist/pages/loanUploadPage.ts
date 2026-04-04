// pages/loanUploadPage.ts
import { Page, expect } from '@playwright/test';
import path from 'path';
import { parseMismoXml, formatCurrency } from '../utils/xmlValidator.js';

export class LoanUploadPage {
  constructor(private page: Page) {}

  async navigateToUploadPage() {
    await this.page.goto('/loans/upload');
  }

  async clickAddNewLoan() {
    await this.page.getByRole('button', { name: /add new loan/i }).click();
    await this.page.getByRole('button', { name: /continue/i }).click();
  }

  async selectLoanOfficerIfMissing() {
    const officerVisible = await this.page.locator('[data-testid="loan-officer"]').isVisible();
    if (!officerVisible) {
      await this.page.getByLabel(/loan officer/i).click();
      await this.page.getByText(/first/i).click();

      await this.page.getByLabel(/loan processor/i).click();
      await this.page.getByText(/first/i).click();
    }
    await this.page.getByRole('button', { name: /continue/i }).click();
  }

  async uploadMismo(fileName: string) {
    const filePath = path.join(process.cwd(), 'data', 'xml', fileName);
    await this.page.setInputFiles('input[type="file"]', filePath);
    await expect(this.page.getByText(/file uploaded/i)).toBeVisible();
    await this.page.getByRole('button', { name: /continue/i }).click();
  }

  async submitLoan() {
    await this.page.getByRole('button', { name: /create loan/i }).click();
    await expect(this.page.getByText(/loan .* created/i)).toBeVisible();
    await expect(this.page.getByText(/synced to encompass/i)).toBeVisible();
  }

  async navigateToTab(tabName: string) {
    await this.page.getByRole('tab', { name: new RegExp(tabName, 'i') }).click();
  }

  async verifyLoanDetails(fileName: string) {
    const xmlPath = path.join(process.cwd(), 'data', 'xml', fileName);
    const expectedData = await parseMismoXml(xmlPath);

    const displayedAmount = await this.getLoanAmount();
    expect(displayedAmount).toBe(formatCurrency(expectedData.loanAmount));

    const displayedBorrower = await this.getBorrowerName();
    expect(displayedBorrower).toBe(expectedData.borrower.fullName);

    const displayedStatus = await this.getLoanStatus();
    expect(displayedStatus).toBe(expectedData.loanStatus);
  }

  async getLoanAmount() {
    return this.page.locator('[data-testid="loan-amount"]').textContent();
  }

  async getBorrowerName() {
    return this.page.locator('[data-testid="borrower-name"]').textContent();
  }

  async getLoanStatus() {
    return this.page.locator('[data-testid="loan-status"]').textContent();
  }
}