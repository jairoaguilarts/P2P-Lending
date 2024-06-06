import React, { useState, useEffect } from 'react';
import { loanContract } from '../../services/blockchain';

const LoanDetail = ({ loanId }) => {
  const [loan, setLoan] = useState(null);

  useEffect(() => {
    const fetchLoan = async () => {
      const loanData = await loanContract.methods.getLoan(loanId).call();
      setLoan(loanData);
    };
    fetchLoan();
  }, [loanId]);

  if (!loan) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Loan Details</h2>
      <p>Borrower: {loan.borrower}</p>
      <p>Amount: {loan.amount}</p>
      <p>Interest: {loan.interest}</p>
      <p>Duration: {loan.duration}</p>
      <p>Funded: {loan.isFunded ? 'Yes' : 'No'}</p>
      <p>Repaid: {loan.isRepaid ? 'Yes' : 'No'}</p>
    </div>
  );
};

export default LoanDetail;
