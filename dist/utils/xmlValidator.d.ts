/**
 * XML Validator Utility for MISMO 3.4 Loan Files
 * Parses and extracts loan data from MISMO XML structure
 */
import type { ParsedLoanData, BorrowerData } from '../types/loan.types.js';
/**
 * Parse MISMO XML file and extract loan data
 * @param filePath - Absolute path to XML file
 * @returns Structured loan data
 * @throws Error if file cannot be read or parsed
 */
export declare function parseMismoXml(filePath: string): Promise<ParsedLoanData>;
/**
 * Extract loan data from parsed MISMO structure
 * Navigates: MESSAGE → DEAL_SETS → DEAL_SET → DEALS → DEAL → LOANS → LOAN
 * @param parsed - Parsed XML object from xml2js
 * @returns Extracted loan data
 * @throws Error if required fields are missing
 */
export declare function extractLoanData(parsed: any): ParsedLoanData;
/**
 * Extract borrower data from PARTIES element
 * @param parties - PARTIES element from DEAL
 * @returns Borrower data with full name
 * @throws Error if borrower not found or missing required name fields
 */
export declare function extractBorrowerData(parties: any): BorrowerData;
/**
 * Build full name from components
 * @param firstName - First name
 * @param middleName - Middle name (optional)
 * @param lastName - Last name
 * @returns Full name with proper formatting
 */
export declare function buildFullName(firstName: string, middleName: string | undefined, lastName: string): string;
/**
 * Format number as currency string
 * @param amount - Numeric amount
 * @returns Formatted currency: "$350,000.00"
 */
export declare function formatCurrency(amount: number): string;
/**
 * Map MISMO loan status to UI display value
 * @param xmlStatus - Status value from XML
 * @returns UI status display value
 */
export declare function mapLoanStatus(xmlStatus: string): string;
//# sourceMappingURL=xmlValidator.d.ts.map