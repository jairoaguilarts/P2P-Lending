// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FundManagement {
    mapping(address => uint) public balances;

    function depositFunds() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdrawFunds(uint _amount) public {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        balances[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
    }

    function getBalance(address _user) public view returns (uint) {
        return balances[_user];
    }
}
