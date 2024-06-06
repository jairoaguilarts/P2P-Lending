import React, { useState } from 'react';
import { loanContract, web3 } from '../../services/blockchain';

const LoanOffer = () => {
  const [loanId, setLoanId] = useState('');
  const [amount, setAmount] = useState('');

  const offerLoan = async () => {
    const accounts = await web3.eth.getAccounts();
    await loanContract.methods.fundLoan(loanId).send({ from: accounts[0], value: web3.utils.toWei(amount, 'ether') });
  };

  return (
    <div>
      <h2>Offer a Loan</h2>
      <input
        type="text"
        placeholder="Loan ID"
        value={loanId}
        onChange={(e) => setLoanId(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={offerLoan}>Offer Loan</button>
    </div>
  );
};

export default LoanOffer;
