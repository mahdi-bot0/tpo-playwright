// tests/loan/loan-upload-real.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/loginPage.js';
import { LoanUploadPage } from '../../pages/loanUploadPage.js';
import { parseMismoXml, formatCurrency } from '../../utils/xmlValidator.js';
import path from 'path';

// Helper to get fixture path
function getFixturePath(filename: string) {
  return path.join(process.cwd(), 'data', 'xml', filename);
}

test.describe('TPO MISMO Loan Upload - Real Flow', () => {
  let loginPage: LoginPage;
  let loanUploadPage: LoanUploadPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    loanUploadPage = new LoanUploadPage(page);
  });

  test('Full loan upload and verification', async ({ page }) => {
    const xmlPath = getFixturePath('valid-loan.xml');

    // 1️⃣ Login
    await loginPage.login('demo@titanbanking.ai', 'Summer2025!');

    // 2️⃣ Perform full loan upload flow
    await loanUploadPage.fullLoanUploadFlow(xmlPath);

    // 3️⃣ Navigate through important tabs
    await loanUploadPage.navigateTabs('Loan Details', 'Borrower', 'Pricing');

    // 4️⃣ Validate loan data matches XML
    const expectedData = await parseMismoXml(xmlPath);

    const displayedAmount = await loanUploadPage.getLoanAmount();
    const expectedAmount = formatCurrency(expectedData.loanAmount);
    expect(displayedAmount).toBe(expectedAmount);

    const displayedBorrower = await loanUploadPage.getBorrowerName();
    expect(displayedBorrower).toBe(expectedData.borrower.fullName);

    const displayedStatus = await loanUploadPage.getLoanStatus();
    expect(displayedStatus).toBe(expectedData.loanStatus);
  });
});