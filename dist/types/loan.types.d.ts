/**
 * Type definitions for loan data structures
 */
/**
 * Options for xml2js parser configuration
 */
export interface XmlParseOptions {
    explicitArray: boolean;
    mergeAttrs: boolean;
    trim: boolean;
}
/**
 * Borrower name components extracted from XML
 */
export interface BorrowerData {
    firstName: string;
    middleName?: string;
    lastName: string;
    fullName: string;
}
/**
 * Parsed loan data structure from MISMO XML
 */
export interface ParsedLoanData {
    loanAmount: number;
    borrower: BorrowerData;
    loanStatus: string;
    loanIdentifier?: string;
}
/**
 * UI-displayed loan data format for assertions
 */
export interface UILoanData {
    loanAmount: string;
    borrowerName: string;
    loanStatus: string;
}
//# sourceMappingURL=loan.types.d.ts.map