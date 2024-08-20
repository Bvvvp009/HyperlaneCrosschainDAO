// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMailbox {
    function dispatch(
        uint32 _destinationDomain,
        bytes32 _recipientAddress,
        bytes calldata _messageBody
    ) external returns (bytes32);
}

interface IGovernanceToken {
    function balanceOf(address account) external view returns (uint256);
}

contract GovernanceProxy {
    address public owner;
    IMailbox public mailbox;
    IGovernanceToken public governanceToken;
    uint32 public homeDomain;
    bytes32 public homeCoreAddress;

    struct Proposal {
        uint256 id;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        uint32 executionChain;
        address target;
        bytes callData;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    mapping(uint256 => Proposal) public proposals;
    uint256[] private activeProposalIds;

    event ProposalReceived(uint256 proposalId, string description, uint32 executionChain);
    event Voted(uint256 proposalId, address voter, bool support, uint256 weight);
    event VotesCollected(uint256 proposalId, uint256 forVotes, uint256 againstVotes);
    event ProposalExecuted(uint256 proposalId);

    constructor(address _mailbox, address _governanceToken, uint32 _homeDomain, bytes32 _homeCoreAddress) {
        owner = msg.sender;
        mailbox = IMailbox(_mailbox);
        governanceToken = IGovernanceToken(_governanceToken);
        homeDomain = _homeDomain;
        homeCoreAddress = _homeCoreAddress;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyMailbox() {
        require(msg.sender == address(mailbox), "Only Mailbox can call this function");
        _;
    }

    function setHomeCoreAddress(bytes32 _homeCoreAddress) external onlyOwner {
        homeCoreAddress = _homeCoreAddress;
    }

    function handle(uint32 _origin, bytes32 _sender, bytes calldata _body) external onlyMailbox {
        require(_sender == homeCoreAddress, "Invalid sender");

        (uint256 actionType, ) = abi.decode(_body, (uint256, bytes));

        if (actionType == 0) {
            _handleProposalCreation(_body);
        } else if (actionType == 1) {
            _handleVoteCollection(_body);
        } else if (actionType == 2) {
            _handleProposalExecution(_body);
        } else {
            revert("Invalid action type");
        }
    }

    function _handleProposalCreation(bytes calldata _body) internal {
        (,uint256 proposalId, string memory description, uint32 executionChain, address target, bytes memory callData) = abi.decode(_body, (uint256, uint256, string, uint32, address, bytes));
        require(proposals[proposalId].id == 0, "Proposal already exists");

        Proposal storage newProposal = proposals[proposalId];
        newProposal.id = proposalId;
        newProposal.description = description;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + 7 days;
        newProposal.executionChain = executionChain;
        newProposal.target = target;
        newProposal.callData = callData;
        
        activeProposalIds.push(proposalId);
        
        emit ProposalReceived(proposalId, description, executionChain);
    }

    function _handleVoteCollection(bytes calldata _body) internal {
        (,uint256 proposalId) = abi.decode(_body, (uint256, uint256));
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp > proposal.endTime, "Voting period not ended");

        // Remove the proposal from active proposals
        for (uint i = 0; i < activeProposalIds.length; i++) {
            if (activeProposalIds[i] == proposalId) {
                activeProposalIds[i] = activeProposalIds[activeProposalIds.length - 1];
                activeProposalIds.pop();
                break;
            }
        }

        bytes memory message = abi.encode(1, proposalId, proposal.forVotes, proposal.againstVotes);
        mailbox.dispatch(homeDomain, homeCoreAddress, message);
        emit VotesCollected(proposalId, proposal.forVotes, proposal.againstVotes);
    }

    function _handleProposalExecution(bytes calldata _body) internal {
        (,uint256 proposalId, address target, bytes memory callData) = abi.decode(_body, (uint256, uint256, address, bytes));
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(!proposal.executed, "Proposal already executed");

        proposal.executed = true;
        (bool success, ) = target.call(callData);
        require(success, "Proposal execution failed");
        emit ProposalExecuted(proposalId);
    }

    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(block.timestamp <= proposal.endTime, "Voting period ended");
        
        uint256 weight = governanceToken.balanceOf(msg.sender);
        require(weight > 0, "No voting power");

        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }
        proposal.hasVoted[msg.sender] = true;

        emit Voted(proposalId, msg.sender, support, weight);
    }

    function getActiveProposals() external view returns (uint256[] memory) {
        return activeProposalIds;
    }
}