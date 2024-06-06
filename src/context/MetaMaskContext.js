import React, { createContext, useState, useEffect } from 'react';
import { initWeb3 } from '../services/blockchain';

export const MetaMaskContext = createContext();

export const MetaMaskProvider = ({ children }) => {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const connectedAccount = localStorage.getItem('connectedAccount');
    if (connectedAccount) {
      setAccount(connectedAccount);
    }
  }, []);

  const connectToMetaMask = async () => {
    try {
      const { web3 } = await initWeb3();
      const accounts = await web3.eth.getAccounts();
      const userAccount = accounts[0];
      setAccount(userAccount);
      localStorage.setItem('connectedAccount', userAccount);
    } catch (error) {
      console.error("MetaMask connection error:", error);
      throw new Error('Could not connect to MetaMask');
    }
  };

  return (
    <MetaMaskContext.Provider value={{ account, connectToMetaMask }}>
      {children}
    </MetaMaskContext.Provider>
  );
};
