// File upload application logic
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const submitButton = document.getElementById('submitButton');
const clearButton = document.getElementById('clearButton');
const selectedFileName = document.getElementById('selectedFileName');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');

let currentFile = null;
let uploadedLoans = JSON.parse(localStorage.getItem('loans') || '[]');

// Drop zone click handler
dropZone.addEventListener('click', () => {
  fileInput.click();
});

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Highlight drop zone when dragging over it
['dragenter', 'dragover'].forEach(eventName => {
  dropZone.addEventListener(eventName, () => {
    dropZone.style.background = '#e9ecef';
  }, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, () => {
    dropZone.style.background = '#f8f9fa';
  }, false);
});

// Handle dropped files
dropZone.addEventListener('drop', (e) => {
  const files = e.dataTransfer.files;
  handleFile(files[0]);
}, false);

// Handle selected files
fileInput.addEventListener('change', (e) => {
  handleFile(e.target.files[0]);
});

// Clear button handler
clearButton.addEventListener('click', () => {
  currentFile = null;
  fileInput.value = '';
  selectedFileName.textContent = '';
  selectedFileName.style.display = 'none';
  clearButton.style.display = 'none';
  submitButton.disabled = true;
  hideMessages();
});

// Submit button handler
submitButton.addEventListener('click', async () => {
  if (!currentFile) return;

  hideMessages();
  loadingSpinner.style.display = 'block';
  submitButton.disabled = true;

  try {
    const fileContent = await readFileContent(currentFile);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(fileContent, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Invalid XML structure');
    }

    // Extract loan data from MISMO XML
    const loanData = extractLoanData(xmlDoc);

    // Validate required fields
    if (!loanData.loanAmount) {
      throw new Error('Missing required field: LoanAmount');
    }
    if (!loanData.borrowerName) {
      throw new Error('Missing required field: Borrower Name');
    }

    // Check file size (5MB limit)
    if (currentFile.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit');
    }

    // Check if empty file
    if (currentFile.size === 0) {
      throw new Error('Cannot upload empty file');
    }

    // Check file extension
    if (!currentFile.name.toLowerCase().endsWith('.xml')) {
      throw new Error('Only XML files are allowed');
    }

    // Generate a loan ID
    const loanId = Date.now();

    // Save to localStorage
    uploadedLoans.push({
      id: loanId,
      ...loanData,
      uploadedAt: new Date().toISOString()
    });
    localStorage.setItem('loans', JSON.stringify(uploadedLoans));

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    loadingSpinner.style.display = 'none';
    successMessage.style.display = 'block';

    // Redirect to loan details page after 1 second
    setTimeout(() => {
      window.location.href = `/loans/${loanId}`;
    }, 1000);

  } catch (error) {
    loadingSpinner.style.display = 'none';
    errorMessage.textContent = error.message || 'Error uploading file. Please try again.';
    errorMessage.style.display = 'block';
    submitButton.disabled = false;
  }
});

function handleFile(file) {
  if (!file) return;

  currentFile = file;
  selectedFileName.textContent = `Selected: ${file.name}`;
  selectedFileName.style.display = 'block';
  clearButton.style.display = 'inline-block';
  submitButton.disabled = false;
  hideMessages();
}

function readFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

function extractLoanData(xmlDoc) {
  // Extract data from MISMO XML format
  const loanAmountNode = xmlDoc.querySelector('LoanAmount, LOAN_AMOUNT');
  const firstNameNode = xmlDoc.querySelector('FirstName, FIRST_NAME');
  const middleNameNode = xmlDoc.querySelector('MiddleName, MIDDLE_NAME');
  const lastNameNode = xmlDoc.querySelector('LastName, LAST_NAME');
  const statusNode = xmlDoc.querySelector('LoanStatus, LOAN_STATUS, MilestoneStatus');

  const firstName = firstNameNode?.textContent?.trim() || '';
  const middleName = middleNameNode?.textContent?.trim() || '';
  const lastName = lastNameNode?.textContent?.trim() || '';

  let borrowerName = firstName;
  if (middleName) {
    borrowerName += ' ' + middleName;
  }
  if (lastName) {
    borrowerName += ' ' + lastName;
  }

  const loanAmount = loanAmountNode ? parseFloat(loanAmountNode.textContent) : null;
  const status = statusNode?.textContent?.trim() || 'Draft';

  return {
    loanAmount,
    borrowerName: borrowerName.trim(),
    loanStatus: status,
    middleName
  };
}

function hideMessages() {
  successMessage.style.display = 'none';
  errorMessage.style.display = 'none';
  loadingSpinner.style.display = 'none';
}
