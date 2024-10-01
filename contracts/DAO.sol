pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract DAO {
    address owner;
    Token public token;
    uint256 public quorum;

    struct Proposal {
        uint256 id;
        string name;
        string description;
        uint256 amount;
        address payable recipient;
        uint256 votesFor;    
        uint256 votesAgainst;
        bool finalized;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;

    mapping(address => mapping(uint256 => bool)) votes;

    event Propose(
        uint id,
        uint256 amount,
        address recipient,
        address creator
    );
    event Vote(uint256 id, address investor);
    event Finalize(uint256 id);

    constructor(Token _token, uint256 _quorum) {
        owner = msg.sender;
        token = _token;
        quorum = _quorum;
    }

    receive() external payable {}

    modifier onlyInvestor() {
        uint256 tokenBalance = token.balanceOf(msg.sender);
        console.log("User:", msg.sender);
        console.log("Token balance:", tokenBalance);
        
        require(
            token.balanceOf(msg.sender) > 0,
            "must be token holder"
        );
        _;
    }

    function createProposal(
        string memory _name,
        string memory _description,
        uint256 _amount,
        address payable _recipient
    ) external onlyInvestor {
        require(address(this).balance >= _amount);
        require(bytes(_description).length > 0, "Proposal must have a description");
        proposalCount++;

        proposals[proposalCount] = Proposal(
            proposalCount,
            _name,
            _description,
            _amount,
            _recipient,
            0,
            0,
            false
        );

        emit Propose(
            proposalCount,
            _amount,
            _recipient,
            msg.sender
        );
    }

function vote(uint256 _id, bool _isFor) external onlyInvestor {
    Proposal storage proposal = proposals[_id];

    console.log('Is voted =', votes[msg.sender][_id]);
    require(!votes[msg.sender][_id], "already voted");

    uint256 votingWeight = token.balanceOf(msg.sender);

     if (_isFor) {
        proposal.votesFor += votingWeight;
        console.log("Added votesFor:", votingWeight); 
    } else {
        proposal.votesAgainst += votingWeight;
        console.log("Added votesAgainst:", votingWeight); 
    }

    votes[msg.sender][_id] = true;

    emit Vote(_id, msg.sender);
}

function hasVoted(uint256 _id, address _voter) external view returns (bool) {
        return votes[_voter][_id];
    }

    function finalizeProposal(uint256 _id) external onlyInvestor {
        Proposal storage proposal = proposals[_id];

        require(proposal.finalized == false, "proposal already finalized");

        proposal.finalized = true;

        require(proposal.votesFor + proposal.votesAgainst >= quorum, "must reach quorum to finalize proposal");

        require(proposal.votesFor > proposal.votesAgainst, "must reach votesFor more than votesAgainst to finalize proposal");

        require(address(this).balance >= proposal.amount);

        (bool sent, ) = proposal.recipient.call{value: proposal.amount}("");
        require(sent);

        emit Finalize(_id);
    }
}
