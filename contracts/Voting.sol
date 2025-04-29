// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

contract Voting {
    address public admin;
    uint public votingDeadline;

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    mapping(address => bool) public registeredVoters;
    mapping(address => bool) public hasVoted;
    mapping(uint => Candidate) public candidates;
    uint public candidatesCount;

    event Voted(address indexed voter, uint candidateId);

    constructor(uint _durationInMinutes) {
        admin = msg.sender;
        votingDeadline = block.timestamp + (_durationInMinutes * 1 minutes);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyBeforeDeadline() {
        require(block.timestamp <= votingDeadline, "Voting period has ended");
        _;
    }

    function addCandidate(string memory _name) public onlyAdmin {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function registerVoter(address _voter) public onlyAdmin {
        registeredVoters[_voter] = true;
    }

    function vote(uint _candidateId) public onlyBeforeDeadline {
        require(registeredVoters[msg.sender], "You are not registered to vote");
        require(!hasVoted[msg.sender], "You have already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate");

        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;

        emit Voted(msg.sender, _candidateId);
    }

    function getRemainingTime() public view returns (uint) {
        if (block.timestamp >= votingDeadline) return 0;
        return votingDeadline - block.timestamp;
    }
}
