const LoanContract = artifacts.require("LoanContract");

module.exports = async function (deployer, network, accounts) {
  const userManagementAddress = "0xdeEbE3b81872e4028Bdf35D9860C83e39D22985a";
  const creditScoringAddress = "0xa44279377bbF3BF199a33c985AA8EF9d57367222";
  const fundManagementAddress = "0xe87Ce14cBF5991C74B6fA82a1813Dd2a43335Fa2";

  await deployer.deploy(LoanContract, userManagementAddress, creditScoringAddress, fundManagementAddress);
};
