// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserManagement {
    struct User {
        address userAddress;
        string firstName;
        string lastName;
        string email;
        string password;
        uint creditScore;
        bool isVerified;
    }

    mapping(address => User) public users;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function registerUser(string memory _firstName, string memory _lastName, string memory _email, string memory _password, uint _creditScore) public {
        require(bytes(users[msg.sender].email).length == 0, "User already registered");

        users[msg.sender] = User({
            userAddress: msg.sender,
            firstName: _firstName,
            lastName: _lastName,
            email: _email,
            password: _password,
            creditScore: _creditScore,
            isVerified: false  
        });
    }

    function verifyUser(address _user) public {
        require(msg.sender == owner, "Only the owner can verify users");
        users[_user].isVerified = true;
    }

    function getUser(address _user) public view returns (User memory) {
        return users[_user];
    }
}
