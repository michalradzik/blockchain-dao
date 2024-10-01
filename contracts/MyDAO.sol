pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MyDAO {
    IERC20 public token;
    address public owner;
    uint256 public quorum;

    struct Proposal {
        uint256 id;
        string name;
        string description;
        uint256 amount;
        address recipient;
        uint256 votesFor;
        uint256 votesAgainst;
        bool finalized;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(uint256 => bool)) public votes;

    event Propose(uint256 id, uint256 amount, address recipient, address creator);
    event Vote(uint256 id, address voter);
    event Finalize(uint256 id);

    constructor(IERC20 _token, uint256 _quorum) {
        token = _token;
        owner = msg.sender;
        quorum = _quorum;
    }

    modifier onlyInvestor() {
        require(token.balanceOf(msg.sender) > 0, "Must be token holder");
        _;
    }

    function createProposal(
        string calldata _name,
        string calldata _description,
        uint256 _amount,
        address _recipient
    ) external onlyInvestor {
        proposalCount++;
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            name: _name,
            description: _description,
            amount: _amount,
            recipient: _recipient,
            votesFor: 0,
            votesAgainst: 0,
            finalized: false
        });
        
        emit Propose(proposalCount, _amount, _recipient, msg.sender);
    }

    function voteOnProposal(uint256 _id, bool _voteFor) external onlyInvestor {
        Proposal storage proposal = proposals[_id];
        require(!votes[msg.sender][_id], "Already voted");

        if (_voteFor) {
            proposal.votesFor += token.balanceOf(msg.sender);
        } else {
            proposal.votesAgainst += token.balanceOf(msg.sender);
        }

        votes[msg.sender][_id] = true;
        emit Vote(_id, msg.sender);
    }

    function finalizeProposal(uint256 _id) external onlyInvestor {
        Proposal storage proposal = proposals[_id];
        require(proposal.votesFor + proposal.votesAgainst >= quorum, "Must reach quorum");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal rejected");
        require(!proposal.finalized, "Proposal already finalized");

        proposal.finalized = true;
        require(token.balanceOf(address(this)) >= proposal.amount, "Not enough tokens in DAO");

        token.transfer(proposal.recipient, proposal.amount);
        emit Finalize(_id);
    }
}
