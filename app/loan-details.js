// Loan details page logic
const loanAmountElement = document.getElementById('loanAmount');
const borrowerNameElement = document.getElementById('borrowerName');
const loanStatusElement = document.getElementById('loanStatus');

// Get loan ID from URL
const pathParts = window.location.pathname.split('/');
const loanId = pathParts[pathParts.length - 1];

// Load loan data from localStorage
const loans = JSON.parse(localStorage.getItem('loans') || '[]');
const loan = loans.find(l => l.id.toString() === loanId);

if (loan) {
  // Format currency
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  loanAmountElement.textContent = formatter.format(loan.loanAmount);
  borrowerNameElement.textContent = loan.borrowerName;
  loanStatusElement.textContent = loan.loanStatus;
} else {
  loanAmountElement.textContent = 'Loan not found';
  borrowerNameElement.textContent = '-';
  loanStatusElement.textContent = '-';
}
