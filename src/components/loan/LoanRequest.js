import React, { useState, useContext } from 'react';
import { loanContract, web3 } from '../../services/blockchain';
import { MetaMaskContext } from '../../context/MetaMaskContext';

const LoanRequest = () => {
  const { account, connectToMetaMask } = useContext(MetaMaskContext);
  const [amount, setAmount] = useState('');
  const [interest, setInterest] = useState('');
  const [duration, setDuration] = useState('');
  const [error, setError] = useState('');

  const requestLoan = async () => {
    if (!account) {
      try {
        await connectToMetaMask();
      } catch (e) {
        setError(`MetaMask connection error: ${e.message}`);
        return;
      }
    }

    try {
      const weiAmount = web3.utils.toWei(amount, 'ether');
      const txData = loanContract.methods.requestLoan(weiAmount, interest, duration).encodeABI();
      const gasEstimate = await loanContract.methods.requestLoan(weiAmount, interest, duration).estimateGas({ from: account });

      const tx = {
        from: account,
        to: loanContract.options.address,
        data: txData,
        gas: gasEstimate,
      };

      await web3.eth.sendTransaction(tx);
      alert('Loan requested successfully!');
    } catch (e) {
      console.error("Loan request error:", e);
      setError(`Loan request failed: ${e.message}`);
    }
  };

  return (
    <div>
      <h2>Request a Loan</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="number"
        placeholder="Interest"
        value={interest}
        onChange={(e) => setInterest(e.target.value)}
      />
      <input
        type="number"
        placeholder="Duration"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />
      <button onClick={requestLoan}>Request Loan</button>
    </div>
  );
};

export default LoanRequest;
