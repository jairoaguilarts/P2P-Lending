import React, { createContext, useState, useEffect } from 'react';
import Web3 from 'web3';

export const MetaMaskContext = createContext();

export const MetaMaskProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);

  const connectToMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
      } catch (error) {
        console.error('MetaMask connection error', error);
      }
    } else {
      console.error('MetaMask is not installed');
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || null);
      });
    }
  }, []);

  return (
    <MetaMaskContext.Provider value={{ account, connectToMetaMask, web3 }}>
      {children}
    </MetaMaskContext.Provider>
  );
};
