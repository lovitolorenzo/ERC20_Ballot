// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

interface ITokenizedVotes {
    function getPastVotes(address, uint256) external view returns (uint256);
}

contract TokenizedBallot {
    uint256 public referenceBlock;
    ITokenizedVotes public tokenContract;

    struct Proposal {
         bytes32 name;
         uint256 voteCount;   
    }

    Proposal[] public proposals;
    mapping (address => uint256) public votePowerSpent;

    constructor(bytes32[] memory proposalNames, address _tokenContract, uint256 _referenceBlock){
        for (uint256 i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
        tokenContract = ITokenizedVotes(_tokenContract);
        referenceBlock = _referenceBlock;
    }

    function vote(uint256 proposal, uint256 amount) public {
        uint256 votePower_ = votePower(msg.sender);
        require(votePower_ <= amount, "TokenizedBallot: trying to vote with more than the vote power available for this account");
        votePowerSpent[msg.sender] += amount;
        proposals[proposal].voteCount += amount;
    }

    function votePower(address account) public view returns(uint256 votePower_){
        votePower_ = tokenContract.getPastVotes(account, referenceBlock) - votePowerSpent[msg.sender];
    }

    function winningProposal() public view returns (Proposal memory winningProposal_) {
        uint256 winningVoteCount = 0;
        for (uint256 p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = proposals[p];
            }
        }
    }

}