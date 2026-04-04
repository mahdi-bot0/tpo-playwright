# XML Test Fixtures

This directory contains MISMO 3.4 XML test fixtures for the loan upload flow tests.

## Fixture Files

### Valid Test Cases

| File | Purpose | Loan Amount | Borrower | Status |
|------|---------|-------------|----------|--------|
| `valid-loan.xml` | Standard valid MISMO XML with complete data | $350,000 | John Doe | Submitted |
| `minimal-loan.xml` | Only required fields, no status (should default to "Draft") | $250,000 | Jane Smith | (empty) |
| `borrower-with-middle-name.xml` | Borrower with middle name | $425,000 | Robert James Johnson | Approved |
| `loan-with-decimals.xml` | Amount with decimal cents | $250,000.50 | Emily Davis | Pending |
| `zero-amount.xml` | Zero loan amount edge case | $0.00 | Zero Amount | Submitted |
| `long-names.xml` | Extremely long borrower names (>50 chars) | $300,000 | Bartholomew-Alexander-Christopher Montgomery-Wellington-Fitzpatrick Pemberton-Smythe-Worthington-III | Submitted |
| `special-characters.xml` | Unicode/accents in borrower name | $275,000 | José María García-O'Brien | Approved |

### Error Test Cases

| File | Purpose | Expected Error |
|------|---------|---------------|
| `invalid-structure.xml` | Malformed XML with unclosed tags | Invalid XML structure |
| `missing-fields.xml` | Valid XML but missing required LoanAmount | Missing required fields |
| `empty-file.xml` | 0 byte file | Empty file error |
| `non-xml-file.txt` | Plain text file (not XML) | Invalid format |

### Large File Test Case

**Note**: `large-file.xml` (>10MB) is not included in version control due to size. To test file size validation:

1. Generate a large XML file:
   ```bash
   # Create a 15MB XML file
   cat valid-loan.xml > large-file.xml
   yes "<!-- Padding comment to increase file size -->" | head -n 500000 >> large-file.xml
   echo "</MESSAGE>" >> large-file.xml
   ```

2. Run the TC-LOAN-009 test

## MISMO 3.4 Structure

All valid XML files follow this structure:

```xml
MESSAGE
└── DEAL_SETS
    └── DEAL_SET
        └── DEALS
            └── DEAL
                ├── LOANS
                │   └── LOAN (attributes: LoanAmount, LoanStatus)
                │       └── LOAN_IDENTIFIERS
                │           └── LOAN_IDENTIFIER
                │               └── LoanIdentifier
                └── PARTIES
                    └── PARTY
                        ├── INDIVIDUAL
                        │   └── NAME
                        │       ├── FirstName
                        │       ├── MiddleName (optional)
                        │       └── LastName
                        └── ROLES
                            └── ROLE
                                └── RoleType (value: "Borrower")
```

## Usage in Tests

Import the XML validator utility to parse fixtures:

```typescript
import { parseMismoXml, formatCurrency } from '../utils/xmlValidator.js';

const xmlPath = getFixturePath('valid-loan.xml');
const expectedData = await parseMismoXml(xmlPath);

console.log(expectedData.loanAmount); // 350000
console.log(expectedData.borrower.fullName); // "John Doe"
console.log(expectedData.loanStatus); // "Submitted"
console.log(formatCurrency(expectedData.loanAmount)); // "$350,000.00"
```

## Test Coverage

These fixtures support the following test scenarios:

- **Critical Path (P0)**: TC-LOAN-001 to TC-LOAN-005
- **Error Handling (P1)**: TC-LOAN-006 to TC-LOAN-010
- **Data Validation (P1)**: TC-LOAN-011, TC-LOAN-012, TC-LOAN-014, TC-LOAN-015
- **Edge Cases (P2)**: TC-LOAN-017, TC-LOAN-019, TC-LOAN-020

## Maintaining Fixtures

When adding new fixtures:

1. Follow the MISMO 3.4 structure shown above
2. Use descriptive file names matching the test scenario
3. Include XML declaration: `<?xml version="1.0" encoding="UTF-8"?>`
4. Document the fixture in this README
5. Ensure proper XML formatting and closing tags (except for invalid-structure.xml)
