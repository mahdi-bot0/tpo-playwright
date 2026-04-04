import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { LoginPage } from '../pages/loginPage.js';
import { LoanUploadPage } from '../pages/loanUploadPage.js';
import { parseMismoXml, formatCurrency } from '../utils/xmlValidator.js';

// Get current directory for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base URL from environment or default
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Helper function to get fixture file path
 */
function getFixturePath(filename: string): string {
  return join(__dirname, '..', 'data', 'xml', filename);
}

test.describe('TPO MISMO XML Loan Upload', () => {

// This test requires a real TPO application with login functionality
// The application is not available in this test environment
test.fixme('Upload valid MISMO XML and verify UI mapping', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const loanUploadPage = new LoanUploadPage(page);

  const xmlPath = getFixturePath('valid-loan.xml');
  const expectedData = await parseMismoXml(xmlPath);

  // ✅ 1. Login
  await loginPage.login('demo@titanbanking.ai', 'Summer2025!', BASE_URL);

  // ✅ 2. Click Add New Loan
  await page.getByRole('button', { name: /add new loan/i }).click();

  // ✅ 3. Continue
  await page.getByRole('button', { name: /continue/i }).click();

  // ✅ 4. Ensure Loan Officer / Processor selected
  const officerText = await page.locator('[data-testid="loan-officer"]').textContent();

  if (!officerText || officerText.includes('Select')) {
    await page.getByLabel(/loan officer/i).click();
    await page.getByRole('option').first().click();

    await page.getByLabel(/loan processor/i).click();
    await page.getByRole('option').first().click();
  }

  await page.getByRole('button', { name: /continue/i }).click();

  // ✅ 5. Upload MISMO
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: /upload/i }).click();
  const chooser = await fileChooserPromise;
  await chooser.setFiles(xmlPath);

  // ✅ 6. Verify upload popup
  await expect(page.getByText(/file uploaded/i)).toBeVisible();

  await page.getByRole('button', { name: /continue/i }).click();

  // ✅ 7. Create Loan
  await page.getByRole('button', { name: /create loan/i }).click();

  // ✅ 8. Verify success
  await expect(page.getByText(/loan .* created/i)).toBeVisible();
  await expect(page.getByText(/synced to encompass/i)).toBeVisible();

  // ✅ 9. NOW reuse your OLD validations (this is key)
  await page.getByRole('tab', { name: /loan details/i }).click();

  const displayedAmount = await loanUploadPage.getLoanAmount();
  const expectedAmount = formatCurrency(expectedData.loanAmount);
  expect(displayedAmount).toBe(expectedAmount);

  const displayedBorrowerName = await loanUploadPage.getBorrowerName();
  expect(displayedBorrowerName).toBe(expectedData.borrower.fullName);

  const displayedStatus = await loanUploadPage.getLoanStatus();
  expect(displayedStatus).toBe(expectedData.loanStatus);
});

});