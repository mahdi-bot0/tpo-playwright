import { Page } from '@playwright/test';
import path from 'path';

export class LoanUploadPage {
  constructor(private page: Page) {}

  async fullLoanUploadFlow(xmlFilename: string) {
    // Click Add New Loan
    await this.page.getByRole('button', { name: 'Add New Loan' }).click();

    // Click Continue (first screens)
    await this.page.getByRole('button', { name: 'Continue' }).click();
    await this.page.getByRole('button', { name: 'Continue' }).click();

    // Upload file
    const xmlPath = path.join(process.cwd(), 'data', 'xml', xmlFilename);
    await this.page.getByRole('button', { name: 'Choose File' }).setInputFiles(xmlPath);

    // Continue
    await this.page.getByRole('button', { name: 'Continue' }).click();

    // Wait for borrower/selection screen
    const borrowerName = this.page.locator('text=Taz Roundten');

    // ✅ wait until visible (critical)
    await borrowerName.waitFor({ state: 'visible', timeout: 15000 });

    // Click borrower
    await borrowerName.click();


    // ✅ NOW click Create Loan
    const createLoanBtn = this.page.locator('button:has-text("Create Loan")');

    await createLoanBtn.waitFor({ state: 'visible', timeout: 10000 });
    await expect(createLoanBtn).toBeEnabled();

    await createLoanBtn.click();  }

  async navigateTabs(...tabs: string[]) {
    for (const tab of tabs) {
      await this.page.getByRole('button', { name: tab }).click();
    }
  }

  async getLoanAmount(): Promise<string> {
    return await this.page.locator('selector-for-loan-amount').innerText();
  }

  async getBorrowerName(): Promise<string> {
    return await this.page.locator('selector-for-borrower-name').innerText();
  }

  async getLoanStatus(): Promise<string> {
    return await this.page.locator('selector-for-loan-status').innerText();
  }
}