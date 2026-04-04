# Quick Start Guide - Loan Upload Flow Tests

## Prerequisites

1. **Install Dependencies** (if not already done)
   ```bash
   npm install
   ```

2. **Start the Application**
   ```bash
   # Make sure the TPO application is running on http://localhost:3000
   # Or configure BASE_URL environment variable for different host
   ```

3. **Verify Application Has Test IDs**

   The application must have these `data-testid` attributes:

   **Upload Page (`/loans/upload`):**
   - `upload-page-container`
   - `file-input`
   - `drop-zone`
   - `selected-file-name`
   - `clear-file-button`
   - `submit-button`
   - `loading-spinner`
   - `success-message`
   - `error-message`

   **Loan Details Page (`/loans/:id`):**
   - `loan-amount`
   - `borrower-name`
   - `loan-status`

---

## Running Tests

### Quick Test Run (Critical Path Only)
```bash
npx playwright test tests/loan-upload-flow.spec.ts --grep "Critical Path"
```

### Run All Tests
```bash
npx playwright test tests/loan-upload-flow.spec.ts
```

### Run Single Test
```bash
npx playwright test -g "TC-LOAN-001"
```

### Debug Mode (Step Through)
```bash
npx playwright test tests/loan-upload-flow.spec.ts --debug
```

### Headed Mode (See Browser)
```bash
npx playwright test tests/loan-upload-flow.spec.ts --headed
```

### Interactive UI Mode
```bash
npx playwright test --ui
```

---

## Test Organization

### Critical Path Tests (P0) - Must Pass
- ✅ TC-LOAN-001: Upload valid XML file
- ✅ TC-LOAN-002: Verify loan amount mapping
- ✅ TC-LOAN-003: Verify borrower name mapping
- ✅ TC-LOAN-004: Verify loan status mapping
- ✅ TC-LOAN-005: Submit button disabled when no file selected

### Error Handling Tests (P1)
- ✅ TC-LOAN-006: Invalid XML structure
- ✅ TC-LOAN-007: Missing required fields
- ✅ TC-LOAN-008: Empty file
- ⏭️ TC-LOAN-009: Oversized file (skipped - needs large-file.xml)
- ✅ TC-LOAN-010: Non-XML file format

### Data Validation Tests (P1)
- ✅ TC-LOAN-011: Loan amount with decimals
- ✅ TC-LOAN-012: Borrower with middle name
- ✅ TC-LOAN-014: Special characters in name
- ✅ TC-LOAN-015: Default "Draft" status

### Edge Cases Tests (P2)
- ✅ TC-LOAN-017: Extremely long names
- ✅ TC-LOAN-019: Zero loan amount
- ✅ TC-LOAN-020: Clear and reselect file

**Total: 17 tests (16 active, 1 skipped)**

---

## Common Commands

### List All Tests
```bash
npx playwright test --list
```

### Run by Priority
```bash
# Critical path only
npx playwright test --grep "Critical Path"

# Error handling
npx playwright test --grep "Error Handling"

# Data validation
npx playwright test --grep "Data Validation"

# Edge cases
npx playwright test --grep "Edge Cases"
```

### Run Specific Browser
```bash
# Chromium only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# Webkit only
npx playwright test --project=webkit
```

### Generate HTML Report
```bash
npx playwright test tests/loan-upload-flow.spec.ts --reporter=html
npx playwright show-report
```

---

## Environment Configuration

### Custom Base URL
```bash
BASE_URL=http://staging.example.com npx playwright test tests/loan-upload-flow.spec.ts
```

### Using .env File
Create `.env` file:
```
BASE_URL=http://localhost:3000
```

Then run:
```bash
npx playwright test tests/loan-upload-flow.spec.ts
```

---

## Troubleshooting

### Tests Fail with "Selector not found"
**Issue**: Application missing `data-testid` attributes

**Solution**:
1. Inspect the application HTML
2. Add missing `data-testid` attributes
3. Or update selectors in `pages/loanUploadPage.ts` to use alternative selectors

### Tests Timeout
**Issue**: Application slow to respond or not running

**Solution**:
1. Verify application is running: `curl http://localhost:3000`
2. Check network tab in browser for delays
3. Increase timeout in test if needed

### File Upload Fails
**Issue**: File path incorrect or permissions issue

**Solution**:
1. Verify fixture files exist: `ls data/xml/`
2. Check file permissions: `chmod 644 data/xml/*.xml`
3. Use absolute paths in tests

### XML Parsing Errors
**Issue**: Unexpected XML structure

**Solution**:
1. Verify XML matches MISMO 3.4 structure
2. Test parsing manually:
   ```bash
   node -e "
   import('./dist/utils/xmlValidator.js').then(async (m) => {
     const data = await m.parseMismoXml('data/xml/valid-loan.xml');
     console.log(data);
   });
   "
   ```

---

## Test Fixtures

All XML test files are in `data/xml/`:

**Valid Scenarios:**
- `valid-loan.xml` - Standard complete loan
- `minimal-loan.xml` - Required fields only
- `borrower-with-middle-name.xml` - Three-part name
- `loan-with-decimals.xml` - Amount with cents
- `zero-amount.xml` - Zero amount
- `long-names.xml` - Very long names
- `special-characters.xml` - Unicode characters

**Error Scenarios:**
- `invalid-structure.xml` - Malformed XML
- `missing-fields.xml` - Missing LoanAmount
- `empty-file.xml` - Empty file
- `non-xml-file.txt` - Wrong format

See `data/xml/README.md` for details.

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test
        env:
          BASE_URL: http://localhost:3000
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Project Structure

```
tpo-playwright/
├── data/
│   └── xml/              # Test fixtures (11 XML files)
├── pages/
│   ├── basePage.ts       # Base page object
│   └── loanUploadPage.ts # Loan upload page object
├── tests/
│   └── loan-upload-flow.spec.ts  # Test suite (17 tests)
├── types/
│   └── loan.types.ts     # TypeScript interfaces
├── utils/
│   └── xmlValidator.ts   # XML parsing utilities
├── playwright.config.cjs # Playwright configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

---

## Next Steps

1. **Start Application**
   ```bash
   # Start your TPO application
   npm run dev
   # or
   npm start
   ```

2. **Run Critical Path Tests**
   ```bash
   npx playwright test --grep "Critical Path" --headed
   ```

3. **Review Results**
   - Check console output for pass/fail
   - View HTML report: `npx playwright show-report`
   - Debug failures with `--debug` flag

4. **Expand Coverage**
   - Add more test fixtures as needed
   - Implement additional test cases
   - Customize selectors for your application

---

## Getting Help

- **Playwright Documentation**: https://playwright.dev/docs/intro
- **Test Specification**: See `specs/loan-upload-flow.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Fixture Documentation**: See `data/xml/README.md`

---

**Ready to test!** 🚀

Start with: `npx playwright test --grep "Critical Path" --headed`
