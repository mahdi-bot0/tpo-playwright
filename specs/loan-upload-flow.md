# TPO MISMO XML Loan Upload Flow - Test Plan

## Overview
This test plan covers the validation of MISMO XML loan data upload and mapping to the TPO application UI. The primary goal is to ensure accurate data transformation from MISMO XML format to the application's user interface.

---

## 1. Test Scope

### In Scope
- MISMO XML file upload functionality
- XML to UI data mapping validation
- Form submission workflow
- UI field population accuracy
- Error handling for invalid inputs
- File validation mechanisms

### Out of Scope
- Backend API validation (covered by integration tests)
- Database persistence verification
- Performance benchmarking
- Cross-browser compatibility (handled separately)

---

## 2. Test Environment

### Prerequisites
- TPO application accessible at defined base URL
- Valid MISMO XML sample files
- Test data fixtures for edge cases
- Authentication credentials (if required)

### Test Data Requirements
- `valid-loan.xml` - Standard MISMO 3.4 XML with complete loan data
- `minimal-loan.xml` - MISMO XML with only required fields
- `invalid-structure.xml` - Malformed XML
- `missing-fields.xml` - Valid XML with missing required fields
- `empty-file.xml` - 0 byte file
- `large-file.xml` - File exceeding size limits (10MB+)
- `special-characters.xml` - Data with special characters and Unicode

---

## 3. Navigation Flow

### Step-by-Step Navigation
1. **Landing Page**
   - Navigate to application base URL
   - Verify authentication (if applicable)
   - Selector: `[data-testid="login-form"]` or `[data-testid="main-navigation"]`

2. **Loan Upload Page**
   - Navigate to loan upload section
   - Expected route: `/loans/upload` or `/upload`
   - Selector: `[data-testid="loan-upload-page"]`

3. **Page Load Verification**
   - Verify page title contains "Upload" or "New Loan"
   - Check for presence of upload area
   - Selector: `[data-testid="upload-area"]` or `[data-testid="file-input"]`

---

## 4. File Upload Interaction

### Upload Mechanisms to Test

#### Method 1: File Input Click
```
1. Locate file input element: [data-testid="file-input"]
2. Use setInputFiles() with XML file path
3. Verify file name appears in UI: [data-testid="selected-file-name"]
```

#### Method 2: Drag and Drop
```
1. Locate drop zone: [data-testid="drop-zone"]
2. Simulate drag and drop event
3. Verify file acceptance indicator
```

### Expected Behaviors
- File input should accept `.xml` files only
- Selected file name should display immediately
- File size should be validated (< 10MB recommended)
- Visual feedback for successful file selection
- "Remove" or "Clear" option should appear: `[data-testid="clear-file-btn"]`

---

## 5. Submission Behavior

### Submit Action Flow
1. **Before Submission**
   - Locate submit button: `[data-testid="submit-loan-btn"]`
   - Button should be disabled if no file selected
   - Button text: "Upload Loan" or "Submit"

2. **During Submission**
   - Loading indicator should appear: `[data-testid="loading-spinner"]`
   - Button should be disabled during processing
   - Button text may change to "Processing..."

3. **After Submission**
   - Success state: Navigate to loan details page or show success message
   - Success message: `[data-testid="success-message"]`
   - Error state: Display error message without navigation
   - Error message: `[data-testid="error-message"]`

### Response Time Expectations
- Standard file (< 1MB): 2-5 seconds
- Large file (5-10MB): 5-15 seconds
- Timeout threshold: 30 seconds

---

## 6. UI Validations - Data Mapping

### 6.1 Loan Amount Validation

**XML Path:**
```xml
<LOAN LoanAmount="350000">
  <!-- or -->
  <LoanAmount>350000</LoanAmount>
</LOAN>
```

**UI Validation:**
- Selector: `[data-testid="loan-amount"]`
- Expected format: `$350,000.00` or `350000`
- Validation rules:
  - Must be numeric
  - Must match XML value exactly
  - Should handle decimal places correctly
  - Should format with currency symbol (if applicable)

**Test Cases:**
```
TC-1: Standard amount (350000) → Verify displays as "$350,000.00"
TC-2: Amount with decimals (250000.50) → Verify displays as "$250,000.50"
TC-3: Zero amount (0) → Verify displays as "$0.00"
TC-4: Large amount (9999999.99) → Verify displays correctly
```

---

### 6.2 Borrower Full Name Validation

**XML Path:**
```xml
<PARTY>
  <INDIVIDUAL>
    <NAME>
      <FirstName>John</FirstName>
      <MiddleName>Michael</MiddleName>
      <LastName>Doe</LastName>
    </NAME>
  </INDIVIDUAL>
</PARTY>
```

**UI Validation:**
- Selector: `[data-testid="borrower-name"]` or `[data-testid="borrower-full-name"]`
- Expected format: "John Michael Doe" or "Doe, John Michael"
- Validation rules:
  - First name is required
  - Last name is required
  - Middle name is optional
  - Handle multiple borrowers (co-borrowers)

**Test Cases:**
```
TC-5: First + Last only → "John Doe"
TC-6: First + Middle + Last → "John Michael Doe"
TC-7: Special characters in name → "O'Brien" or "José García"
TC-8: Long names (> 50 characters) → Verify truncation or full display
TC-9: Multiple borrowers → Verify all borrowers display correctly
```

---

### 6.3 Loan Status Validation

**XML Path:**
```xml
<LOAN LoanStatus="Submitted">
  <!-- or -->
  <LoanStatusType>Application</LoanStatusType>
</LOAN>
```

**UI Validation:**
- Selector: `[data-testid="loan-status"]`
- Expected values: "Draft", "Submitted", "In Review", "Approved", "Denied"
- Validation rules:
  - Status must be one of predefined values
  - Status badge/indicator should display correct color
  - If XML has no status, default to "Draft"

**Test Cases:**
```
TC-10: Status = "Submitted" → Display "Submitted" with appropriate styling
TC-11: Status = "Application" → Map to "Draft" or equivalent
TC-12: Missing status → Default to "Draft"
TC-13: Invalid status → Handle gracefully with error or default
```

---

## 7. Validation Strategy

### Approach: XML Parsing → UI Comparison

**Implementation Steps:**

1. **Parse XML Test Data**
   ```typescript
   import { parseStringPromise } from 'xml2js';

   const xmlContent = await fs.readFile('path/to/loan.xml', 'utf-8');
   const parsedData = await parseStringPromise(xmlContent);
   ```

2. **Extract Expected Values**
   ```typescript
   const expectedLoanAmount = parsedData.LOAN.$.LoanAmount;
   const expectedFirstName = parsedData.PARTY.INDIVIDUAL.NAME.FirstName[0];
   const expectedLastName = parsedData.PARTY.INDIVIDUAL.NAME.LastName[0];
   ```

3. **Compare with UI Values**
   ```typescript
   const uiLoanAmount = await page.locator('[data-testid="loan-amount"]').textContent();
   expect(uiLoanAmount).toBe(formatCurrency(expectedLoanAmount));

   const uiBorrowerName = await page.locator('[data-testid="borrower-name"]').textContent();
   expect(uiBorrowerName).toBe(`${expectedFirstName} ${expectedLastName}`);
   ```

4. **Handle Data Transformations**
   - Currency formatting: `350000` → `$350,000.00`
   - Name concatenation: `FirstName + " " + LastName`
   - Date formatting: ISO 8601 → `MM/DD/YYYY`
   - Status mapping: XML values → UI display values

---

## 8. Edge Cases and Error Scenarios

### 8.1 Invalid XML Structure

**Scenario:** Malformed XML (unclosed tags, invalid syntax)

**Test Steps:**
```
1. Upload `invalid-structure.xml`
2. Click submit button
3. Verify error message appears: [data-testid="error-message"]
4. Expected message: "Invalid XML format" or "Unable to parse file"
5. Verify form remains in editable state
6. Verify file can be replaced
```

**Assertions:**
- Error message is clear and actionable
- No partial data is displayed
- Form does not navigate away
- User can retry with different file

---

### 8.2 Missing Required Fields

**Scenario:** Valid XML structure but missing mandatory MISMO fields

**Required Fields (typical):**
- Loan Amount
- Borrower First Name
- Borrower Last Name
- Property Address
- Loan Purpose

**Test Steps:**
```
1. Upload `missing-fields.xml` (e.g., missing LoanAmount)
2. Click submit button
3. Verify validation error appears
4. Expected message: "Missing required field: Loan Amount"
5. Verify which fields are missing
```

**Assertions:**
- Specific field names are mentioned in error
- Multiple missing fields are listed
- No navigation occurs
- Form highlights missing fields (if applicable)

---

### 8.3 Empty File Upload

**Scenario:** File with 0 bytes or blank content

**Test Steps:**
```
1. Upload `empty-file.xml` (0 KB)
2. Click submit button
3. Verify error message: "File is empty" or "Invalid file content"
4. Verify file upload can be retried
```

**Assertions:**
- Empty file is detected before server submission
- Clear error messaging
- No server errors or crashes

---

### 8.4 Large File Handling

**Scenario:** File exceeding size limits (e.g., 10MB+)

**Test Steps:**
```
1. Attempt to upload `large-file.xml` (15MB)
2. Verify immediate rejection or size warning
3. Expected message: "File size exceeds 10MB limit"
4. Verify upload is prevented or cancelled
```

**Assertions:**
- Size validation occurs client-side (before upload)
- Clear size limit communicated to user
- No memory issues or browser hangs

**Alternative Scenario:** File within size limit but with excessive data
```
1. Upload XML with 1000+ loan entries
2. Verify system handles gracefully
3. Check for timeout or performance degradation
4. Verify appropriate loading indicators
```

---

### 8.5 Special Characters and Encoding

**Scenario:** XML with special characters, Unicode, or unusual encoding

**Test Data Examples:**
- Borrower name: "José María García-O'Brien"
- Address: "123 Rue de l'Église, Montréal"
- Notes: "Property has 20% equity"

**Test Steps:**
```
1. Upload `special-characters.xml`
2. Submit and navigate to loan details
3. Verify all special characters render correctly
4. Check for encoding issues (�, ???, etc.)
```

**Assertions:**
- UTF-8 encoding preserved
- Accented characters display correctly
- Special symbols (', -, %, etc.) are not escaped incorrectly

---

### 8.6 Duplicate File Upload

**Scenario:** Uploading the same loan XML twice

**Test Steps:**
```
1. Upload and submit `valid-loan.xml` (Loan ID: 12345)
2. Navigate back to upload page
3. Upload same file again
4. Verify system detects duplicate
5. Expected: Warning message or duplicate prevention
```

**Assertions:**
- Duplicate detection mechanism exists
- User is warned before creating duplicate
- Option to view existing loan or proceed anyway

---

### 8.7 Unsupported File Format

**Scenario:** Attempting to upload non-XML files

**Test Steps:**
```
1. Attempt to select `document.pdf`
2. Verify file type validation
3. Attempt to select `data.json`
4. Expected: File picker filters to .xml only OR error message
```

**Assertions:**
- File input accepts only `.xml` MIME type
- Clear error if wrong format is uploaded
- Message: "Only XML files are supported"

---

## 9. Selector Strategy

### Preferred: Data-TestId Attributes

**Benefits:**
- Decoupled from styling/implementation
- Stable across refactors
- Self-documenting test intent

**Naming Convention:**
```
[data-testid="component-element-action"]

Examples:
- [data-testid="loan-upload-page"]
- [data-testid="file-input"]
- [data-testid="submit-loan-btn"]
- [data-testid="borrower-name"]
- [data-testid="loan-amount"]
- [data-testid="loan-status"]
- [data-testid="error-message"]
- [data-testid="success-message"]
```

### Fallback Strategy (if data-testid unavailable)

**Priority Order:**
1. **Role-based selectors:** `page.getByRole('button', { name: 'Submit' })`
2. **Label text:** `page.getByLabel('Upload File')`
3. **Placeholder:** `page.getByPlaceholder('Select XML file')`
4. **Semantic elements:** `button[type="submit"]`
5. **Class selectors (last resort):** `.upload-button`

### Avoid:
- XPath (brittle and hard to maintain)
- Index-based selectors (`.loan-card:nth-child(3)`)
- Generic tags without attributes (`button`, `div`)

---

## 10. Test Case Summary

### Critical Path Tests (P0)
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| TC-LOAN-001 | Upload valid MISMO XML | Success message, data displayed correctly |
| TC-LOAN-002 | Verify loan amount mapping | Amount matches XML, formatted correctly |
| TC-LOAN-003 | Verify borrower name mapping | Full name matches XML (First + Last) |
| TC-LOAN-004 | Verify loan status mapping | Status matches XML or defaults correctly |
| TC-LOAN-005 | Submit without file selection | Submit button disabled or error shown |

### Error Handling Tests (P1)
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| TC-LOAN-006 | Upload invalid XML structure | Clear error message, no navigation |
| TC-LOAN-007 | Upload XML with missing required fields | Validation errors listing missing fields |
| TC-LOAN-008 | Upload empty file | Error message, upload prevented |
| TC-LOAN-009 | Upload oversized file | Size limit error, upload prevented |
| TC-LOAN-010 | Upload non-XML file | File type error or format filtering |

### Data Validation Tests (P1)
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| TC-LOAN-011 | Loan amount with decimals | Displays correctly with cents |
| TC-LOAN-012 | Borrower with middle name | Full name includes middle name |
| TC-LOAN-013 | Multiple borrowers | All borrower names displayed |
| TC-LOAN-014 | Special characters in names | Characters preserved and rendered |
| TC-LOAN-015 | Missing optional fields | Graceful handling, defaults or empty |

### Edge Case Tests (P2)
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| TC-LOAN-016 | Duplicate loan upload | Warning or duplicate detection |
| TC-LOAN-017 | Very long borrower names | Truncation or full display handled |
| TC-LOAN-018 | Maximum loan amount | Large numbers handled correctly |
| TC-LOAN-019 | Zero loan amount | Displays as $0.00 without error |
| TC-LOAN-020 | File upload cancellation | Can clear and reselect file |

---

## 11. Test Execution Guidelines

### Pre-Test Setup
1. Ensure test data files exist in `fixtures/xml/` directory
2. Verify application is running and accessible
3. Clear any cached data or previous test artifacts
4. Authenticate test user (if required)

### Test Execution Order
1. Run critical path tests first (TC-LOAN-001 to TC-LOAN-005)
2. Run error handling tests (TC-LOAN-006 to TC-LOAN-010)
3. Run data validation tests (TC-LOAN-011 to TC-LOAN-015)
4. Run edge case tests (TC-LOAN-016 to TC-LOAN-020)

### Test Data Cleanup
- Clear uploaded loans after each test (if applicable)
- Reset application state between test runs
- Use test-specific loan identifiers to avoid conflicts

---

## 12. Success Criteria

### Test Pass Conditions
- All P0 tests pass (100%)
- At least 90% of P1 tests pass
- No critical bugs or data corruption issues
- Error messages are clear and actionable
- No console errors during happy path scenarios

### Definition of Done
- [ ] All test cases documented in this plan are implemented
- [ ] Test fixtures created for all scenarios
- [ ] XML parsing utilities implemented
- [ ] Data comparison assertions validated
- [ ] Edge cases handled gracefully
- [ ] Test results reviewed with team
- [ ] Known issues documented

---

## 13. Risk Assessment

### High Risk Areas
1. **XML Parsing Complexity**
   - MISMO 3.4 schema variations
   - Nested data structures
   - Namespace handling

2. **Data Transformation**
   - Currency formatting inconsistencies
   - Date format variations
   - Name concatenation logic

3. **File Upload Limitations**
   - Browser file size restrictions
   - Network timeout issues
   - Server processing delays

### Mitigation Strategies
- Use well-tested XML parsing libraries
- Document all transformation rules clearly
- Implement comprehensive error handling
- Set appropriate timeout values
- Monitor test execution performance

---

## 14. Maintenance and Updates

### When to Update This Plan
- New MISMO XML versions released
- UI fields added or modified
- Business rules change
- New edge cases discovered
- Selector patterns change

### Version Control
- Document version: 1.0
- Last updated: [Current Date]
- Owner: QA Team
- Review frequency: Quarterly or per major release

---

## 15. Appendix

### A. Sample MISMO XML Structure
```xml
<?xml version="1.0" encoding="UTF-8"?>
<MESSAGE>
  <DEAL_SETS>
    <DEAL_SET>
      <DEALS>
        <DEAL>
          <LOANS>
            <LOAN LoanAmount="350000" LoanStatus="Submitted">
              <LOAN_IDENTIFIERS>
                <LOAN_IDENTIFIER>
                  <LoanIdentifier>LOAN-12345</LoanIdentifier>
                </LOAN_IDENTIFIER>
              </LOAN_IDENTIFIERS>
            </LOAN>
          </LOANS>
          <PARTIES>
            <PARTY>
              <INDIVIDUAL>
                <NAME>
                  <FirstName>John</FirstName>
                  <MiddleName>Michael</MiddleName>
                  <LastName>Doe</LastName>
                </NAME>
              </INDIVIDUAL>
              <ROLES>
                <ROLE>
                  <RoleType>Borrower</RoleType>
                </ROLE>
              </ROLES>
            </PARTY>
          </PARTIES>
        </DEAL>
      </DEALS>
    </DEAL_SET>
  </DEAL_SETS>
</MESSAGE>
```

### B. Useful Resources
- MISMO Standards: https://www.mismo.org/
- Playwright Documentation: https://playwright.dev/
- XML2JS Parser: https://www.npmjs.com/package/xml2js

### C. Contact Information
- QA Lead: [Name]
- Development Team: [Contact]
- Product Owner: [Contact]

---

**Document End**