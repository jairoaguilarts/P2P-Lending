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

    uint public loanCount = 0;
    mapping(uint => Loan) public loans;

    event LoanOfferCreated(uint indexed loanId, address indexed lender, uint amount, uint interest, uint duration);
    event LoanRequested(uint indexed loanId, address indexed borrower, uint amount, uint interest, uint duration);
    event LoanDeleted(uint indexed loanId);
    event LoanFunded(address indexed lender, address indexed borrower, uint amount);
    event FundsTransferred(address indexed from, address indexed to, uint amount);

    UserManagement userManagement;
    CreditScoring creditScoring;
    FundManagement fundManagement;

    constructor(address _userManagement, address _creditScoring, address _fundManagement) {
        userManagement = UserManagement(_userManagement);
        creditScoring = CreditScoring(_creditScoring);
        fundManagement = FundManagement(_fundManagement);
    }

    function createLoanOffer(uint _amount, uint _interest, uint _duration) public {
        require(userManagement.getUser(msg.sender).isVerified, "User not verified");

        loans[loanCount] = Loan(loanCount, address(0), msg.sender, _amount, _interest, _duration, false, false);
        emit LoanOfferCreated(loanCount, msg.sender, _amount, _interest, _duration);
        loanCount++;
    }

    function requestLoan(uint _amount, uint _interest, uint _duration) public {
        require(userManagement.getUser(msg.sender).isVerified, "User not verified");

        loans[loanCount] = Loan(loanCount, msg.sender, address(0), _amount, _interest, _duration, false, false);
        emit LoanRequested(loanCount, msg.sender, _amount, _interest, _duration);
        loanCount++;
    }

    function fundLoan(uint _loanId, address _borrower) public payable {
        Loan storage loan = loans[_loanId];
        require(loan.id == _loanId, "Loan does not exist");
        require(!loan.isFunded, "Loan already funded");
        require(msg.value == loan.amount, "Incorrect amount sent");
        require(loan.borrower == address(0) || loan.borrower == _borrower, "Borrower address mismatch");

        loan.lender = msg.sender;
        loan.borrower = _borrower;
        loan.isFunded = true;

        // Emit event before transfer
        emit LoanFunded(loan.lender, loan.borrower, loan.amount);

        // Check contract balance before transfer
        uint contractBalanceBefore = address(this).balance;

        // Transfer funds to the borrower directly
        (bool success, ) = payable(loan.borrower).call{value: loan.amount}("");
        require(success, "Transfer failed");

        // Check contract balance after transfer
        uint contractBalanceAfter = address(this).balance;
        require(contractBalanceAfter == contractBalanceBefore - loan.amount, "Transfer amount mismatch");

        // Emit event after transfer
        emit FundsTransferred(msg.sender, loan.borrower, loan.amount);
    }

    function acceptLoanOffer(uint _loanId) public payable {
        Loan storage loan = loans[_loanId];
        require(loan.id == _loanId, "Loan does not exist");
        require(!loan.isFunded, "Loan already funded");
        require(loan.lender != address(0), "Invalid loan offer");

        loan.borrower = msg.sender;
        loan.isFunded = true;

        // Transfer funds to the borrower directly
        (bool success, ) = payable(loan.borrower).call{value: loan.amount}("");
        require(success, "Transfer failed");
    }

    function repayLoan(uint _loanId) public payable {
        Loan storage loan = loans[_loanId];
        require(loan.id == _loanId, "Loan does not exist");
        require(loan.isFunded, "Loan not funded");
        require(!loan.isRepaid, "Loan already repaid");
        require(msg.sender == loan.borrower, "Only borrower can repay the loan");
        uint repaymentAmount = loan.amount + (loan.amount * loan.interest / 100);
        require(msg.value == repaymentAmount, "Incorrect repayment amount");

        loan.isRepaid = true;

        // Transfer repayment to the lender
        (bool success, ) = payable(loan.lender).call{value: msg.value}("");
        require(success, "Repayment transfer failed");

        // Update credit score
        creditScoring.updateCreditScore(loan.borrower, creditScoring.getCreditScore(loan.borrower) + 1);
    }

    function deleteLoan(uint _loanId) public {
        Loan storage loan = loans[_loanId];
        require(loan.id == _loanId, "Loan does not exist");
        require(msg.sender == loan.borrower || msg.sender == loan.lender, "Only borrower or lender can delete the loan");
        require(!loan.isFunded, "Cannot delete a funded loan");

        delete loans[_loanId];
        emit LoanDeleted(_loanId);
    }

    function getLoan(uint _loanId) public view returns (Loan memory) {
        require(loans[_loanId].id == _loanId, "Loan does not exist");
        return loans[_loanId];
    }

    function getAllLoans() public view returns (Loan[] memory) {
        Loan[] memory allLoans = new Loan[](loanCount);
        for (uint i = 0; i < loanCount; i++) {
            allLoans[i] = loans[i];
        }
        return allLoans;
    }
}
