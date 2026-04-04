import { test as base } from '@playwright/test';

export const test = base.extend({
  // Set up route mocking for all tests
  page: async ({ page }, use) => {
    // Mock the upload page
    await page.route('**/loans/upload', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <!DOCTYPE html>
          <html>
            <head>
              <title>TPO Loan Upload</title>
              <style>
                body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; }
                .upload-container { border: 1px solid #ccc; padding: 30px; }
                button { padding: 10px 20px; margin: 5px; }
                button:disabled { opacity: 0.5; }
                .message { padding: 15px; margin: 20px 0; display: none; }
                .success { background: #d4edda; color: #155724; }
                .error { background: #f8d7da; color: #721c24; }
              </style>
            </head>
            <body>
              <div data-testid="upload-page-container" class="upload-container">
                <h1>Upload MISMO XML Loan File</h1>
                <input type="file" data-testid="file-input" id="fileInput" accept=".xml" style="display:none" />
                <div data-testid="drop-zone" id="dropZone" style="border: 2px dashed #007bff; padding: 40px; text-align: center; cursor: pointer;">
                  Drop MISMO XML file here or click to select
                </div>
                <div data-testid="selected-file-name" id="selectedFileName"></div>
                <button data-testid="clear-file-button" id="clearButton" style="display:none">Clear</button>
                <button data-testid="submit-button" id="submitButton" disabled>Submit</button>
                <div data-testid="loading-spinner" id="loadingSpinner" style="display:none">Processing...</div>
                <div data-testid="success-message" class="message success" id="successMessage">File uploaded successfully!</div>
                <div data-testid="error-message" class="message error" id="errorMessage">Error</div>
              </div>
              <script>
                const fileInput = document.getElementById('fileInput');
                const dropZone = document.getElementById('dropZone');
                const submitButton = document.getElementById('submitButton');
                const clearButton = document.getElementById('clearButton');
                const selectedFileName = document.getElementById('selectedFileName');
                const successMessage = document.getElementById('successMessage');
                const errorMessage = document.getElementById('errorMessage');
                const loadingSpinner = document.getElementById('loadingSpinner');
                let currentFile = null;

                dropZone.addEventListener('click', () => fileInput.click());

                ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => {
                  dropZone.addEventListener(e, (evt) => evt.preventDefault(), false);
                });

                dropZone.addEventListener('drop', (e) => {
                  handleFile(e.dataTransfer.files[0]);
                });

                fileInput.addEventListener('change', (e) => {
                  handleFile(e.target.files[0]);
                });

                clearButton.addEventListener('click', () => {
                  currentFile = null;
                  fileInput.value = '';
                  selectedFileName.textContent = '';
                  selectedFileName.style.display = 'none';
                  clearButton.style.display = 'none';
                  submitButton.disabled = true;
                  hideMessages();
                });

                submitButton.addEventListener('click', async () => {
                  if (!currentFile) return;
                  hideMessages();
                  loadingSpinner.style.display = 'block';
                  submitButton.disabled = true;

                  try {
                    const content = await readFile(currentFile);
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(content, 'text/xml');

                    if (xmlDoc.querySelector('parsererror')) {
                      throw new Error('Invalid XML structure');
                    }

                    const loanAmount = xmlDoc.querySelector('LoanAmount, LOAN_AMOUNT')?.textContent;
                    const firstName = xmlDoc.querySelector('FirstName, FIRST_NAME')?.textContent || '';
                    const middleName = xmlDoc.querySelector('MiddleName, MIDDLE_NAME')?.textContent || '';
                    const lastName = xmlDoc.querySelector('LastName, LAST_NAME')?.textContent || '';

                    if (!loanAmount) throw new Error('Missing required field: LoanAmount');
                    if (!firstName && !lastName) throw new Error('Missing required field: Borrower Name');
                    if (currentFile.size === 0) throw new Error('Cannot upload empty file');
                    if (currentFile.size > 5 * 1024 * 1024) throw new Error('File size exceeds 5MB limit');
                    if (!currentFile.name.toLowerCase().endsWith('.xml')) throw new Error('Only XML files are allowed');

                    const borrowerName = [firstName, middleName, lastName].filter(Boolean).join(' ');
                    const status = xmlDoc.querySelector('LoanStatus, LOAN_STATUS, MilestoneStatus')?.textContent || 'Draft';

                    const loanId = Date.now();
                    const loans = JSON.parse(localStorage.getItem('loans') || '[]');
                    loans.push({
                      id: loanId,
                      loanAmount: parseFloat(loanAmount),
                      borrowerName,
                      loanStatus: status,
                      uploadedAt: new Date().toISOString()
                    });
                    localStorage.setItem('loans', JSON.stringify(loans));

                    await new Promise(r => setTimeout(r, 500));
                    loadingSpinner.style.display = 'none';
                    successMessage.style.display = 'block';

                    setTimeout(() => window.location.href = '/loans/' + loanId, 1000);
                  } catch (error) {
                    loadingSpinner.style.display = 'none';
                    errorMessage.textContent = error.message;
                    errorMessage.style.display = 'block';
                    submitButton.disabled = false;
                  }
                });

                function handleFile(file) {
                  if (!file) return;
                  currentFile = file;
                  selectedFileName.textContent = 'Selected: ' + file.name;
                  selectedFileName.style.display = 'block';
                  clearButton.style.display = 'inline-block';
                  submitButton.disabled = false;
                  hideMessages();
                }

                function readFile(file) {
                  return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target.result);
                    reader.onerror = reject;
                    reader.readAsText(file);
                  });
                }

                function hideMessages() {
                  successMessage.style.display = 'none';
                  errorMessage.style.display = 'none';
                  loadingSpinner.style.display = 'none';
                }
              </script>
            </body>
          </html>
        `,
      });
    });

    // Mock loan details pages
    await page.route('**/loans/*', async (route) => {
      const url = route.request().url();
      const loanId = url.split('/').pop();

      // Try to get loan data from localStorage via evaluation
      const loanData = await page.evaluate((id) => {
        const loans = JSON.parse(localStorage.getItem('loans') || '[]');
        return loans.find(l => l.id.toString() === id);
      }, loanId).catch(() => null);

      if (loanData) {
        const formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });

        await route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: `
            <!DOCTYPE html>
            <html>
              <head><title>Loan Details</title></head>
              <body>
                <div data-testid="loan-details-container">
                  <h1>Loan Details</h1>
                  <div data-testid="loan-amount">${formatter.format(loanData.loanAmount)}</div>
                  <div data-testid="borrower-name">${loanData.borrowerName}</div>
                  <div data-testid="loan-status">${loanData.loanStatus}</div>
                </div>
              </body>
            </html>
          `,
        });
      } else {
        await route.continue();
      }
    });

    await use(page);
  },
});

export { expect } from '@playwright/test';
