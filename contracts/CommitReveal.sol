// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Commit-Reveal
/// @author cd33
contract CommitReveal is Ownable {
    enum Step {
        Commit,
        Reveal,
        Results
    }

    Step public step;
    mapping(address => bytes32) public voteByUser;
    mapping(string => uint256) private voteCounts;

    uint256 public revealDeadline = block.timestamp + 86400;

    constructor() {}

    function setStep() external onlyOwner {
        if (step == Step.Commit) {
            revealDeadline = block.timestamp + 86400;
            step = Step.Reveal;
        } else if (step == Step.Reveal) {
            revealDeadline = block.timestamp + 86400;
            step = Step.Results;
        } else {
            revert("Vote done");
        }
    }

    function commitVote(bytes32 _secretVote) external {
        require(step == Step.Commit, "Commit period done");
        voteByUser[msg.sender] = _secretVote;
    }

    function revealVote(string memory _vote, string memory _salt) external {
        require(
            step == Step.Reveal ||
                (step == Step.Commit && revealDeadline <= block.timestamp),
            "Reveal period done"
        );
        require(
            keccak256(abi.encodePacked(msg.sender, _vote, _salt)) ==
                voteByUser[msg.sender],
            "Wrong Vote & Salt"
        );
        delete voteByUser[msg.sender];
        voteCounts[_vote] += 1;
    }

    function getVotes(string memory candidate) external view returns (uint256) {
        require(
            step == Step.Results ||
                (step == Step.Reveal && revealDeadline <= block.timestamp),
            "Wait results period");
        return voteCounts[candidate];
    }

    function getHash(
        string memory vote,
        string memory salt
    ) external view returns (bytes32) {
        return keccak256(abi.encodePacked(msg.sender, vote, salt));
    }
}
