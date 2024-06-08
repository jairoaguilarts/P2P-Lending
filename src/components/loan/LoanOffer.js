import React, { useState } from 'react';
import { ethers } from 'ethers';
import LoanContract from '../../contracts/LoanContract.json';

const LoanOffer = ({ contractAddress }) => {
  const [loanId, setLoanId] = useState('');
  const [amount, setAmount] = useState('');

  const handleOfferLoan = async (event) => {
    event.preventDefault();

    try {
      if (!window.ethereum) {
        alert('Metamask not detected');
        return;
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const loanContract = new ethers.Contract(contractAddress, LoanContract.abi, signer);

      const tx = await loanContract.fundLoan(loanId, { value: ethers.utils.parseEther(amount) });
      await tx.wait();

      alert('Loan funded successfully');
    } catch (error) {
      console.error('Error offering loan:', error);
      alert('Error offering loan');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Offer Loan</h1>
      <form onSubmit={handleOfferLoan}>
        <div className="mb-4">
          <label className="block text-gray-700">Loan ID</label>
          <input
            type="text"
            value={loanId}
            onChange={(e) => setLoanId(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Amount (ETH)</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Offer Loan</button>
      </form>
    </div>
  );
};

export default LoanOffer;
