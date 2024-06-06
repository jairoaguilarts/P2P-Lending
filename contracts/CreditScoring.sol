// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CreditScoring {
    mapping(address => uint) public creditScores;

    function updateCreditScore(address _user, uint _newScore) public {
        creditScores[_user] = _newScore;
    }

    function getCreditScore(address _user) public view returns (uint) {
        return creditScores[_user];
    }
}
