// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./UserManagement.sol";
import "./CreditScoring.sol";
import "./FundManagement.sol";

contract LoanContract {
    struct Loan {
        uint id;
        address borrower;
        address lender;
        uint amount;
        uint interest;
        uint duration;
        bool isFunded;
        bool isRepaid;
    }

    uint public loanCount;
    mapping(uint => Loan) public loans;

    UserManagement userManagement;
    CreditScoring creditScoring;
    FundManagement fundManagement;

    constructor(address _userManagement, address _creditScoring, address _fundManagement) {
        userManagement = UserManagement(_userManagement);
        creditScoring = CreditScoring(_creditScoring);
        fundManagement = FundManagement(_fundManagement);
    }

    function requestLoan(uint _amount, uint _interest, uint _duration) public {
        require(userManagement.getUser(msg.sender).isVerified, "User not verified");
        loanCount++;
        loans[loanCount] = Loan(loanCount, msg.sender, address(0), _amount, _interest, _duration, false, false);
    }

    function fundLoan(uint _loanId) public payable {
        Loan storage loan = loans[_loanId];
        require(!loan.isFunded, "Loan already funded");
        require(msg.value == loan.amount, "Incorrect amount sent");

        loan.lender = msg.sender;
        loan.isFunded = true;

        // Transfer funds to the borrower
        fundManagement.depositFunds{value: msg.value}();
        fundManagement.withdrawFunds(loan.amount);
        payable(loan.borrower).transfer(loan.amount);
    }

    function repayLoan(uint _loanId) public payable {
        Loan storage loan = loans[_loanId];
        require(loan.isFunded, "Loan not funded");
        require(!loan.isRepaid, "Loan already repaid");
        require(msg.sender == loan.borrower, "Only borrower can repay the loan");
        require(msg.value == loan.amount + (loan.amount * loan.interest / 100), "Incorrect repayment amount");

        loan.isRepaid = true;

        // Transfer repayment to the lender
        fundManagement.depositFunds{value: msg.value}();
        fundManagement.withdrawFunds(msg.value);
        payable(loan.lender).transfer(msg.value);

        // Update credit score
        creditScoring.updateCreditScore(loan.borrower, creditScoring.getCreditScore(loan.borrower) + 1);
    }

    function createLoanOffer(uint _amount, uint _interest, uint _duration) public {
        require(userManagement.getUser(msg.sender).isVerified, "User not verified");

        loanCount++;
        loans[loanCount] = Loan(loanCount, address(0), msg.sender, _amount, _interest, _duration, false, false);
    }

    function acceptLoanOffer(uint _loanId) public {
        Loan storage loan = loans[_loanId];
        require(!loan.isFunded, "Loan already funded");
        require(loan.lender != address(0), "Invalid loan offer");

        loan.borrower = msg.sender;
        loan.isFunded = true;

        // Transfer funds to the borrower
        fundManagement.depositFunds{value: loan.amount}();
        fundManagement.withdrawFunds(loan.amount);
        payable(loan.borrower).transfer(loan.amount);
    }

    function getLoan(uint _loanId) public view returns (Loan memory) {
        return loans[_loanId];
    }
}
