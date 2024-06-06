import Web3 from 'web3';
import LoanContract from '../contracts/LoanContract.json';
import UserManagement from '../contracts/UserManagement.json';
import CreditScoring from '../contracts/CreditScoring.json';
import FundManagement from '../contracts/FundManagement.json';

let web3;
let loanContract;
let userManagement;
let creditScoring;
let fundManagement;

const initWeb3 = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.enable();
    } catch (e) {
      console.error("User denied account access");
    }
  } else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
  } else {
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  }

  const loanContractAddress = "0x1c991B45eC10F309e0772F50de0864D1ABAb8B06";
  loanContract = new web3.eth.Contract(LoanContract.abi, loanContractAddress);

  const userManagementAddress = "0x54637F9bA904168243A7B8D6C962D1ECD294a6A3";
  userManagement = new web3.eth.Contract(UserManagement.abi, userManagementAddress);

  const creditScoringAddress = "0xa8C41b6aB2d8095B569cf690846Bf1713c631330";
  creditScoring = new web3.eth.Contract(CreditScoring.abi, creditScoringAddress);

  const fundManagementAddress = "0x823566d8C316D6f1F830EC7E46F12A3A509dD60c";
  fundManagement = new web3.eth.Contract(FundManagement.abi, fundManagementAddress);

  return { web3, loanContract, userManagement, creditScoring, fundManagement };
};

export { web3, loanContract, userManagement, creditScoring, fundManagement, initWeb3 };
