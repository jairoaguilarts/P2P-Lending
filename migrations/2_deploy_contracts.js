const LoanContract = artifacts.require("LoanContract");
const UserManagement = artifacts.require("UserManagement");
const CreditScoring = artifacts.require("CreditScoring");
const FundManagement = artifacts.require("FundManagement");

module.exports = async function(deployer) {
  // Deploy UserManagement contract
  await deployer.deploy(UserManagement);
  const userManagementInstance = await UserManagement.deployed();

  // Deploy CreditScoring contract
  await deployer.deploy(CreditScoring);
  const creditScoringInstance = await CreditScoring.deployed();

  // Deploy FundManagement contract
  await deployer.deploy(FundManagement);
  const fundManagementInstance = await FundManagement.deployed();

  // Deploy LoanContract with the addresses of the deployed contracts
  await deployer.deploy(
    LoanContract,
    userManagementInstance.address,
    creditScoringInstance.address,
    fundManagementInstance.address
  );
};
