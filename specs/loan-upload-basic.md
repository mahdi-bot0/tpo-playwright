# TPO MISMO XML Loan Upload

## Scenario: Upload valid MISMO XML and verify UI mapping

**Seed:** tests/seed.spec.ts

### Steps:

1. Navigate to loan upload page
2. Upload valid MISMO XML file (valid-loan.xml)
3. Click submit button
4. Wait for processing to complete
5. Verify loan amount is displayed correctly
6. Verify borrower full name is displayed correctly
7. Verify loan status is displayed correctly

### Expected:

- Loan amount matches XML value
- Borrower name matches XML (First + Last)
- Loan status matches XML or default value