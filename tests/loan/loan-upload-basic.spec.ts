/**
 * Basic Loan Upload Test
 * Tests for uploading valid MISMO XML and verifying UI mapping
 * 
 * spec: Upload valid MISMO XML and verify UI mapping
 * seed: tests/seed.spec.ts
 */

import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { LoanUploadPage } from '../../pages/loanUploadPage.js';
import { parseMismoXml, formatCurrency } from '../../utils/xmlValidator.js';

// Get current directory for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base URL from environment or default
const BASE_URL = process.env.BASE_URL || 'https://button-los-dev.titanbanking.ai/';

/**
 * Helper function to get fixture file path
 * @param filename - Name of the XML fixture file
 * @returns Absolute path to the fixture
 */
function getFixturePath(filename: string): string {
  return join(__dirname, '..', 'data', 'xml', filename);
}

test.describe('TPO MISMO XML Loan Upload', () => {
  let loanUploadPage: LoanUploadPage;

  test.beforeEach(async ({ page }) => {
    loanUploadPage = new LoanUploadPage(page);
  });

  test('Upload valid MISMO XML and verify UI mapping', async () => {
    // Parse XML to get expected values
    const xmlPath = getFixturePath('valid-loan.xml');
    const expectedData = await parseMismoXml(xmlPath);

    // 1. Navigate to loan upload page
    const loginPage = new LoginPage(page);

    // ✅ Login
    await loginPage.login('demo@titanbanking.ai', 'Summer2025!', BASE_URL);

    // ✅ Start loan flow
    await page.getByRole('button', { name: /add new loan/i }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // ✅ Handle loan officer
    const officerText = await page.locator('[data-testid="loan-officer"]').textContent();

    if (!officerText || officerText.includes('Select')) {
      await page.getByLabel(/loan officer/i).click();
      await page.getByRole('option').first().click();

      await page.getByLabel(/loan processor/i).click();
      await page.getByRole('option').first().click();
    }

    await page.getByRole('button', { name: /continue/i }).click();

    // 2. Upload valid MISMO XML file (valid-loan.xml)
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /upload/i }).click();
    const chooser = await fileChooserPromise;
    await chooser.setFiles(xmlPath);

    await expect(page.getByText(/file uploaded/i)).toBeVisible();
    // Verify file is selected
    const selectedFileName = await loanUploadPage.getSelectedFileName();
    expect(selectedFileName).toContain('valid-loan.xml');

    // 3. Click submit button
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByRole('button', { name: /create loan/i }).click();

    await expect(page.getByText(/loan .* created/i)).toBeVisible();
    await expect(page.getByText(/synced to encompass/i)).toBeVisible();

    // 4. Wait for processing to complete
    await loanUploadPage.waitForNavigationToLoanDetails();

    // 5. Verify loan amount is displayed correctly
    const displayedAmount = await loanUploadPage.getLoanAmount();
    const expectedAmount = formatCurrency(expectedData.loanAmount);
    expect(displayedAmount).toBe(expectedAmount);

    // 6. Verify borrower full name is displayed correctly
    const displayedBorrowerName = await loanUploadPage.getBorrowerName();
    expect(displayedBorrowerName).toBe(expectedData.borrower.fullName);

    // 7. Verify loan status is displayed correctly
    const displayedStatus = await loanUploadPage.getLoanStatus();
    expect(displayedStatus).toBe(expectedData.loanStatus);
  });
});
