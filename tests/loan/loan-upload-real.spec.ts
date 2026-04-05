import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/loginPage';
import { LoanUploadPage } from '../../pages/loanUploadPage';
import { parseMismoXml, formatCurrency } from '../../utils/xmlValidator';
import path from 'path';

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
    const xmlFile = 'TEST-TPO-TI-010 Pricing.xml';
    const xmlPath = getFixturePath(xmlFile);

    // Login
    await loginPage.login('demo@titanbanking.ai', 'Summer2025!');

    // Upload loan
    await loanUploadPage.fullLoanUploadFlow(xmlFile);

    // Navigate tabs and verify
    await loanUploadPage.navigateTabs('Loan Details', 'Borrower', 'Pricing');

    const expectedData = await parseMismoXml(xmlPath);

    const displayedAmount = await loanUploadPage.getLoanAmount();
    expect(displayedAmount).toBe(formatCurrency(expectedData.loanAmount));

    const displayedBorrower = await loanUploadPage.getBorrowerName();
    expect(displayedBorrower).toBe(expectedData.borrower.fullName);

    const displayedStatus = await loanUploadPage.getLoanStatus();
    expect(displayedStatus).toBe(expectedData.loanStatus);
  });
});