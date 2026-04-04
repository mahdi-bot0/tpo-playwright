/**
 * XML Validator Utility for MISMO 3.4 Loan Files
 * Parses and extracts loan data from MISMO XML structure
 */

import { readFile } from 'fs/promises';
import { parseStringPromise } from 'xml2js';
import type { ParsedLoanData, BorrowerData, XmlParseOptions } from '../types/loan.types.js';

/**
 * Default xml2js parsing options
 */
const XML_PARSE_OPTIONS: XmlParseOptions = {
  explicitArray: true,
  mergeAttrs: true,
  trim: true,
};

/**
 * Parse MISMO XML file and extract loan data
 * @param filePath - Absolute path to XML file
 * @returns Structured loan data
 * @throws Error if file cannot be read or parsed
 */
export async function parseMismoXml(filePath: string): Promise<ParsedLoanData> {
  try {
    const xmlContent = await readFile(filePath, 'utf-8');
    const parsed = await parseStringPromise(xmlContent, XML_PARSE_OPTIONS);
    return extractLoanData(parsed);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse MISMO XML: ${error.message}`);
    }
    throw new Error('Failed to parse MISMO XML: Unknown error');
  }
}

/**
 * Extract loan data from parsed MISMO structure
 * Navigates: MESSAGE → DEAL_SETS → DEAL_SET → DEALS → DEAL → LOANS → LOAN
 * @param parsed - Parsed XML object from xml2js
 * @returns Extracted loan data
 * @throws Error if required fields are missing
 */
export function extractLoanData(parsed: any): ParsedLoanData {
  try {
    // Navigate MISMO structure
    const message = parsed.MESSAGE;
    if (!message) throw new Error('Missing MESSAGE element');

    const dealSets = message.DEAL_SETS?.[0];
    if (!dealSets) throw new Error('Missing DEAL_SETS element');

    const dealSet = dealSets.DEAL_SET?.[0];
    if (!dealSet) throw new Error('Missing DEAL_SET element');

    const deals = dealSet.DEALS?.[0];
    if (!deals) throw new Error('Missing DEALS element');

    const deal = deals.DEAL?.[0];
    if (!deal) throw new Error('Missing DEAL element');

    // Extract LOAN data
    const loans = deal.LOANS?.[0];
    if (!loans) throw new Error('Missing LOANS element');

    const loan = loans.LOAN?.[0];
    if (!loan) throw new Error('Missing LOAN element');

    // Extract loan amount (can be attribute or element)
    const loanAmount = loan.LoanAmount?.[0] || loan.LoanAmount;
    if (loanAmount === undefined || loanAmount === null) {
      throw new Error('Missing required field: LoanAmount');
    }

    // Extract loan status (optional, defaults to empty string)
    const loanStatus = loan.LoanStatus?.[0] || loan.LoanStatus || '';

    // Extract loan identifier (optional)
    const loanIdentifier = loan.LOAN_IDENTIFIERS?.[0]?.LOAN_IDENTIFIER?.[0]?.LoanIdentifier?.[0] || undefined;

    // Extract borrower data from PARTIES
    const parties = deal.PARTIES?.[0];
    if (!parties) throw new Error('Missing PARTIES element');

    const borrower = extractBorrowerData(parties);

    return {
      loanAmount: parseFloat(loanAmount),
      borrower,
      loanStatus: mapLoanStatus(loanStatus),
      loanIdentifier,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to extract loan data: ${error.message}`);
    }
    throw new Error('Failed to extract loan data: Unknown error');
  }
}

/**
 * Extract borrower data from PARTIES element
 * @param parties - PARTIES element from DEAL
 * @returns Borrower data with full name
 * @throws Error if borrower not found or missing required name fields
 */
export function extractBorrowerData(parties: any): BorrowerData {
  const partyList = parties.PARTY;
  if (!partyList || !Array.isArray(partyList)) {
    throw new Error('No PARTY elements found');
  }

  // Find the borrower party
  for (const party of partyList) {
    const roles = party.ROLES?.[0]?.ROLE;
    if (!roles) continue;

    const isBorrower = roles.some((role: any) => {
      const roleType = role.RoleType?.[0] || role.RoleType;
      return roleType === 'Borrower';
    });

    if (isBorrower) {
      const individual = party.INDIVIDUAL?.[0];
      if (!individual) throw new Error('Borrower INDIVIDUAL element not found');

      const name = individual.NAME?.[0];
      if (!name) throw new Error('Borrower NAME element not found');

      const firstName = name.FirstName?.[0] || name.FirstName;
      const middleName = name.MiddleName?.[0] || name.MiddleName || undefined;
      const lastName = name.LastName?.[0] || name.LastName;

      if (!firstName) throw new Error('Missing required field: FirstName');
      if (!lastName) throw new Error('Missing required field: LastName');

      const fullName = buildFullName(firstName, middleName, lastName);

      return {
        firstName,
        middleName,
        lastName,
        fullName,
      };
    }
  }

  throw new Error('No borrower found in PARTIES');
}

/**
 * Build full name from components
 * @param firstName - First name
 * @param middleName - Middle name (optional)
 * @param lastName - Last name
 * @returns Full name with proper formatting
 */
export function buildFullName(firstName: string, middleName: string | undefined, lastName: string): string {
  if (middleName) {
    return `${firstName} ${middleName} ${lastName}`;
  }
  return `${firstName} ${lastName}`;
}

/**
 * Format number as currency string
 * @param amount - Numeric amount
 * @returns Formatted currency: "$350,000.00"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Map MISMO loan status to UI display value
 * @param xmlStatus - Status value from XML
 * @returns UI status display value
 */
export function mapLoanStatus(xmlStatus: string): string {
  // Map common MISMO status values to UI values
  const statusMap: Record<string, string> = {
    'Submitted': 'Submitted',
    'Approved': 'Approved',
    'Denied': 'Denied',
    'Pending': 'Pending',
    'InProgress': 'In Progress',
    'Closed': 'Closed',
  };

  // Return mapped value or default to "Draft" if empty
  if (!xmlStatus || xmlStatus.trim() === '') {
    return 'Draft';
  }

  return statusMap[xmlStatus] || xmlStatus;
}
