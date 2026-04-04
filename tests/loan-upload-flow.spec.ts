/**
 * Loan Upload Flow Test Suite
 * Tests for MISMO XML loan file upload and data mapping
 */

import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { LoanUploadPage } from '../pages/loanUploadPage.js';
import { parseMismoXml, formatCurrency } from '../utils/xmlValidator.js';
import { setupMockServer } from './test-helpers.js';

// Get current directory for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base URL from environment or default
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Helper function to get fixture file path
 * @param filename - Name of the XML fixture file
 * @returns Absolute path to the fixture
 */
function getFixturePath(filename: string): string {
  return join(__dirname, '..', 'data', 'xml', filename);
}

test.describe('Critical Path Tests (P0)', () => {
  let loanUploadPage: LoanUploadPage;

  test.beforeEach(async ({ page }) => {
    // Setup mock server routes
    await setupMockServer(page);

    loanUploadPage = new LoanUploadPage(page);
    await loanUploadPage.navigateToUploadPage(BASE_URL);
  });

  test('TC-LOAN-001: Successfully upload valid MISMO XML file', async () => {
    // Arrange
    const xmlPath = getFixturePath('valid-loan.xml');

    // Act
    await loanUploadPage.uploadAndSubmit(xmlPath);

    // Assert
    const isSuccess = await loanUploadPage.isSuccessMessageVisible();
    expect(isSuccess).toBe(true);

    const successMessage = await loanUploadPage.getSuccessMessage();
    expect(successMessage).toContain('success');
  });

  test('TC-LOAN-002: Verify loan amount is correctly mapped and displayed', async () => {
    // Arrange
    const xmlPath = getFixturePath('valid-loan.xml');
    const expectedData = await parseMismoXml(xmlPath);

    // Act
    await loanUploadPage.uploadAndSubmit(xmlPath);
    await loanUploadPage.waitForNavigationToLoanDetails();

    // Assert
    const displayedAmount = await loanUploadPage.getLoanAmount();
    const expectedAmount = formatCurrency(expectedData.loanAmount);
    expect(displayedAmount).toBe(expectedAmount);
  });

  test('TC-LOAN-003: Verify borrower name is correctly mapped and displayed', async () => {
    // Arrange
    const xmlPath = getFixturePath('valid-loan.xml');
    const expectedData = await parseMismoXml(xmlPath);

    // Act
    await loanUploadPage.uploadAndSubmit(xmlPath);
    await loanUploadPage.waitForNavigationToLoanDetails();

    // Assert
    const displayedName = await loanUploadPage.getBorrowerName();
    expect(displayedName).toBe(expectedData.borrower.fullName);
  });

  test('TC-LOAN-004: Verify loan status is correctly mapped and displayed', async () => {
    // Arrange
    const xmlPath = getFixturePath('valid-loan.xml');
    const expectedData = await parseMismoXml(xmlPath);

    // Act
    await loanUploadPage.uploadAndSubmit(xmlPath);
    await loanUploadPage.waitForNavigationToLoanDetails();

    // Assert
    const displayedStatus = await loanUploadPage.getLoanStatus();
    expect(displayedStatus).toBe(expectedData.loanStatus);
  });

  test('TC-LOAN-005: Submit button is disabled when no file is selected', async () => {
    // Assert - no file selected initially
    const isEnabled = await loanUploadPage.isSubmitButtonEnabled();
    expect(isEnabled).toBe(false);
  });
});

test.describe('Error Handling Tests (P1)', () => {
  let loanUploadPage: LoanUploadPage;

  test.beforeEach(async ({ page }) => {
    // Setup mock server routes
    await setupMockServer(page);

    loanUploadPage = new LoanUploadPage(page);
    await loanUploadPage.navigateToUploadPage(BASE_URL);
  });

  test('TC-LOAN-006: Display error for invalid XML structure', async () => {
    // Arrange
    const xmlPath = getFixturePath('invalid-structure.xml');

    // Act
    await loanUploadPage.uploadAndSubmit(xmlPath);

    // Assert
    const isError = await loanUploadPage.isErrorMessageVisible();
    expect(isError).toBe(true);

    const errorMessage = await loanUploadPage.getErrorMessage();
    expect(errorMessage.toLowerCase()).toContain('invalid');
  });

  test('TC-LOAN-007: Display error for missing required fields', async () => {
    // Arrange
    const xmlPath = getFixturePath('missing-fields.xml');

    // Act
    await loanUploadPage.uploadAndSubmit(xmlPath);

    // Assert
    const isError = await loanUploadPage.isErrorMessageVisible();
    expect(isError).toBe(true);

    const errorMessage = await loanUploadPage.getErrorMessage();
    expect(errorMessage.toLowerCase()).toMatch(/required|missing/);
  });

  test('TC-LOAN-008: Display error for empty file', async () => {
    // Arrange
    const xmlPath = getFixturePath('empty-file.xml');

    // Act
    await loanUploadPage.uploadAndSubmit(xmlPath);

    // Assert
    const isError = await loanUploadPage.isErrorMessageVisible();
    expect(isError).toBe(true);

    const errorMessage = await loanUploadPage.getErrorMessage();
    expect(errorMessage.toLowerCase()).toMatch(/empty|invalid/);
  });

  test('TC-LOAN-009: Display error for oversized file', async () => {
    // Note: This test requires a large-file.xml fixture > 10MB
    // Skipped if fixture doesn't exist
    test.skip(!test.info().project.name.includes('large-file'), 'Large file fixture not available');

    // Arrange
    const xmlPath = getFixturePath('large-file.xml');

    // Act
    await loanUploadPage.uploadAndSubmit(xmlPath);

    // Assert
    const isError = await loanUploadPage.isErrorMessageVisible();
    expect(isError).toBe(true);

    const errorMessage = await loanUploadPage.getErrorMessage();
    expect(errorMessage.toLowerCase()).toMatch(/size|large|limit/);
  });

  test('TC-LOAN-010: Display error for non-XML file format', async () => {
    // Arrange
    const xmlPath = getFixturePath('non-xml-file.txt');

    // Act
    await loanUploadPage.uploadAndSubmit(xmlPath);

    // Assert
    const isError = await loanUploadPage.isErrorMessageVisible();
    expect(isError).toBe(true);

    const errorMessage = await loanUploadPage.getErrorMessage();
    expect(errorMessage.toLowerCase()).toMatch(/format|xml|invalid/);
  });
});

test.describe('Data Validation Tests (P1)', () => {
  let loanUploadPage: LoanUploadPage;

  test.beforeEach(async ({ page }) => {
    // Setup mock server routes
    await setupMockServer(page);

    loanUploadPage = new LoanUploadPage(page);
    await loanUploadPage.navigateToUploadPage(BASE_URL);
  });

  test('TC-LOAN-011: Correctly format loan amount with decimals', async () => {
    // Arrange
    const xmlPath = getFixturePath('loan-with-decimals.xml');
    const expectedData = await parseMismoXml(xmlPath);

    // Act
    await loanUploadPage.uploadAndSubmit(xmlPath);
    await loanUploadPage.waitForNavigationToLoanDetails();

    // Assert
    const displayedAmount = await loanUploadPage.getLoanAmount();
    const expectedAmount = formatCurrency(expectedData.loanAmount);
    expect(displayedAmount).toBe(expectedAmount);
    expect(displayedAmount).toMatch(/\.\d{2}$/); // Verify 2 decimal places
  });

  test('TC-LOAN-012: Display full name with middle name', async () => {
    // Arrange
    const xmlPath = getFixturePath('borrower-with-middle-name.xml');
    const expectedData = await parseMismoXml(xmlPath);

    // Act
    await loanUploadPage.uploadAndSubmit(xmlPath);
    await loanUploadPage.waitForNavigationToLoanDetails();

    // Assert
    const displayedName = await loanUploadPage.getBorrowerName();
    expect(displayedName).toBe(expectedData.borrower.fullName);
    expect(displayedName).toContain(expectedData.borrower.middleName || '');
  });

  test('TC-LOAN-014: Handle special characters in borrower name', async () => {
    // Arrange
    const xmlPath = getFixturePath('special-characters.xml');
    const expectedData = await parseMismoXml(xmlPath);

    // Act
    await loanUploadPage.uploadAndSubmit(xmlPath);
    await loanUploadPage.waitForNavigationToLoanDetails();

    // Assert
    const displayedName = await loanUploadPage.getBorrowerName();
    expect(displayedName).toBe(expectedData.borrower.fullName);
    // Verify special characters are preserved
    expect(displayedName).toMatch(/[áéíóúñÁÉÍÓÚÑ\-']/);
  });

  test('TC-LOAN-015: Default to "Draft" status when status field is missing', async () => {
    // Arrange
    const xmlPath = getFixturePath('minimal-loan.xml');
    const expectedData = await parseMismoXml(xmlPath);

    // Act
    await loanUploadPage.uploadAndSubmit(xmlPath);
    await loanUploadPage.waitForNavigationToLoanDetails();

    // Assert
    const displayedStatus = await loanUploadPage.getLoanStatus();
    expect(displayedStatus).toBe('Draft');
    expect(expectedData.loanStatus).toBe('Draft');
  });
});

test.describe('Edge Cases Tests (P2)', () => {
  let loanUploadPage: LoanUploadPage;

  test.beforeEach(async ({ page }) => {
    // Setup mock server routes
    await setupMockServer(page);

    loanUploadPage = new LoanUploadPage(page);
    await loanUploadPage.navigateToUploadPage(BASE_URL);
  });

  test('TC-LOAN-017: Handle extremely long borrower names', async () => {
    // Arrange
    const xmlPath = getFixturePath('long-names.xml');
    const expectedData = await parseMismoXml(xmlPath);

    // Act
    await loanUploadPage.uploadAndSubmit(xmlPath);
    await loanUploadPage.waitForNavigationToLoanDetails();

    // Assert
    const displayedName = await loanUploadPage.getBorrowerName();
    expect(displayedName).toBe(expectedData.borrower.fullName);
    expect(displayedName.length).toBeGreaterThan(50);
  });

  test('TC-LOAN-019: Handle zero loan amount', async () => {
    // Arrange
    const xmlPath = getFixturePath('zero-amount.xml');
    const expectedData = await parseMismoXml(xmlPath);

    // Act
    await loanUploadPage.uploadAndSubmit(xmlPath);
    await loanUploadPage.waitForNavigationToLoanDetails();

    // Assert
    const displayedAmount = await loanUploadPage.getLoanAmount();
    expect(displayedAmount).toBe('$0.00');
    expect(expectedData.loanAmount).toBe(0);
  });

  test('TC-LOAN-020: Clear and reselect file', async () => {
    // Arrange
    const xmlPath = getFixturePath('valid-loan.xml');

    // Act - Upload file
    await loanUploadPage.uploadFile(xmlPath);
    let fileName = await loanUploadPage.getSelectedFileName();
    expect(fileName).toContain('valid-loan.xml');

    // Act - Clear file
    await loanUploadPage.clearFile();
    const isSubmitEnabled = await loanUploadPage.isSubmitButtonEnabled();
    expect(isSubmitEnabled).toBe(false);

    // Act - Reselect file
    await loanUploadPage.uploadFile(xmlPath);
    fileName = await loanUploadPage.getSelectedFileName();
    expect(fileName).toContain('valid-loan.xml');

    // Assert - Can submit after reselection
    await loanUploadPage.submitLoan();
    const isSuccess = await loanUploadPage.isSuccessMessageVisible();
    expect(isSuccess).toBe(true);
  });
});
