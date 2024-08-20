// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IInterchainGasPaymaster {
    function payForGas(
        bytes32 _messageId,
        uint32 _destinationDomain,
        uint256 _gasAmount,
        address _refundAddress
    ) external payable;

      function quoteGasPayment(uint32 _destinationDomain, uint256 _gasAmount) external view returns (uint256);
}

interface IMailbox {
    function dispatch(
        uint32 destinationDomain,
        bytes32 recipientAddress,
        bytes calldata messageBody
    ) external payable returns (bytes32 messageId);

    function process(bytes calldata _metadata, bytes calldata _message) external;

    function handle(
        uint32 _origin,
        bytes32 _sender,
        bytes calldata _message
    ) external payable;

    function quoteDispatch(
        uint32 destinationDomain,
        bytes32 recipientAddress,
        bytes calldata messageBody
    ) external view returns (uint256 fee);
}

contract GovernanceCore is Ownable {
    using EnumerableSet for EnumerableSet.UintSet;

    IERC20 public governanceToken;
    IMailbox public mailbox;
    IInterchainGasPaymaster public igp;
    uint256 public proposalCount;
    uint256 public votingPeriod = 7 days;
    uint256 public quorumPercentage = 10;
    uint32 public  currentChainID;


  struct Proposal {
    uint256 id;
    address proposer;
    string description;
    uint256 forVotes;
    uint256 againstVotes;
    uint256 startTime;
    bool executed;
    uint32 executionChain;
    address target;
    bytes callData;
    mapping(uint32 => bool) chainVotesCollected;
    uint32 chainVotesCount;
    mapping(address => bool) hasVoted; // Add this line
  }
    mapping(uint256 => Proposal) public proposals;
    EnumerableSet.UintSet private activeProposals;
    mapping(uint32 => bytes32) public chainToProxyAddress;
    uint32[] public supportedChains;

    event ProposalCreated(uint256 indexed proposalId, address proposer, string description, uint32 executionChain);
    event VotesCollected(uint256 indexed proposalId, uint32 chainId, uint256 forVotes, uint256 againstVotes);
    event ProposalExecuted(uint256 indexed proposalId);
    event CrossChainProposalCreated(uint256 indexed proposalId, uint32 destinationDomain);
    event SupportedChainAdded(uint32 chainId, bytes32 proxyAddress);
    event Voted(uint256 indexed proposalId, address voter, bool support, uint256 weight);

    
    constructor(address _governanceToken, address _mailbox, address _igp,uint32 chainId) Ownable(msg.sender) {
        governanceToken = IERC20(_governanceToken);
        mailbox = IMailbox(_mailbox);
        igp = IInterchainGasPaymaster(_igp);
        currentChainID = chainId;
    }

    function addSupportedChain(uint32 chainId, bytes32 proxyAddress) external onlyOwner {
        require(chainToProxyAddress[chainId] == bytes32(0), "Chain already supported");
        chainToProxyAddress[chainId] = proxyAddress;
        supportedChains.push(chainId);
        emit SupportedChainAdded(chainId, proxyAddress);
    }
  
  
  function createProposal(string memory description, uint32 executionChain, address target, bytes memory callData) external payable {
    require(governanceToken.balanceOf(msg.sender) > 0, "Must hold governance tokens to propose");
    require(executionChain == currentChainID || chainToProxyAddress[executionChain] != bytes32(0), "Invalid execution chain");

    proposalCount++;
    Proposal storage newProposal = proposals[proposalCount];
    newProposal.id = proposalCount;
    newProposal.proposer = msg.sender;
    newProposal.description = description;
    newProposal.startTime = block.timestamp;
    newProposal.executionChain = executionChain;
    newProposal.target = target;
    newProposal.callData = callData;
    newProposal.chainVotesCount = 0;
    activeProposals.add(proposalCount);
    
    emit ProposalCreated(proposalCount, msg.sender, description, executionChain);

    uint256 totalFee = 0;
    uint256 dispatchedCount = 0;
    
    for (uint i = 0; i < supportedChains.length; i++) {
        uint32 chainId = supportedChains[i];
        if (chainId != currentChainID) {
            try this._dispatchProposal{value: msg.value - totalFee}(chainId, proposalCount, description, executionChain, target, callData) returns (uint256 fee) {
                totalFee += fee;
                dispatchedCount++;
            } catch Error(string memory reason) {
                emit DispatchFailed(chainId, proposalCount, reason);
            } catch (bytes memory) {
                emit DispatchFailed(chainId, proposalCount, "Unknown error");
            }
        }
    }

    require(dispatchedCount > 0, "Failed to dispatch to any chain");
    require(msg.value >= totalFee, "Insufficient fee provided");
    
    // Refund excess payment
    if (msg.value > totalFee) {
        payable(msg.sender).transfer(msg.value - totalFee);
    }
  }

function _dispatchProposal(uint32 destinationDomain, uint256 proposalId, string memory description, uint32 executionChain, address target, bytes memory callData) external payable returns (uint256) {
    require(msg.sender == address(this), "Only the contract can call this function");

    bytes memory message = abi.encode(0, proposalId, description, executionChain, target, callData);
    uint256 mailboxFee = mailbox.quoteDispatch(destinationDomain, chainToProxyAddress[destinationDomain], message);
    
    require(msg.value >= mailboxFee, "Insufficient fee for dispatch");

    bytes32 messageId = mailbox.dispatch{value: mailboxFee}(destinationDomain, chainToProxyAddress[destinationDomain], message);

    // Estimate gas needed for the destination chain
    uint256 gasAmount = 300000; // Adjust this value based on the gas needed on the destination chain
    uint256 igpFee = igp.quoteGasPayment(destinationDomain, gasAmount);

    require(msg.value >= mailboxFee + igpFee, "Insufficient fee for IGP");

    igp.payForGas{value: igpFee}(messageId, destinationDomain, gasAmount, msg.sender);

    emit CrossChainProposalCreated(proposalId, destinationDomain);

    return mailboxFee + igpFee;
}

event DispatchFailed(uint32 chainId, uint256 proposalId, string reason);

function vote(uint256 proposalId, bool support) external {
    require(governanceToken.balanceOf(msg.sender) > 0, "Must hold governance tokens to vote");
    Proposal storage proposal = proposals[proposalId];
    require(block.timestamp <= proposal.startTime + votingPeriod, "Voting period has ended");
    require(!proposal.executed, "Proposal already executed");
    require(!proposal.hasVoted[msg.sender], "Already voted"); // Add this line

    uint256 voteWeight = governanceToken.balanceOf(msg.sender);

    if (support) {
        proposal.forVotes += voteWeight;
    } else {
        proposal.againstVotes += voteWeight;
    }

    proposal.hasVoted[msg.sender] = true; // Add this line

    emit Voted(proposalId, msg.sender, support, voteWeight);
    }
    
    function collectVotes(uint256 proposalId) external payable {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.startTime + votingPeriod, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");

        uint256 totalFee = 0;
        for (uint i = 0; i < supportedChains.length; i++) {
            uint32 chainId = supportedChains[i];
            if (!proposal.chainVotesCollected[chainId]) {
                totalFee += _requestVotes(chainId, proposalId);
            }
        }
        require(msg.value >= totalFee, "Insufficient fee provided");
    }

    function _requestVotes(uint32 destinationDomain, uint256 proposalId) internal returns (uint256) {
        bytes memory message = abi.encode(1, proposalId);
        uint256 fee = mailbox.quoteDispatch(destinationDomain, chainToProxyAddress[destinationDomain], message);
        mailbox.dispatch{value: fee}(destinationDomain, chainToProxyAddress[destinationDomain], message);
        return fee;
    }

    function handle(uint32 _origin, bytes32 _sender, bytes calldata _body) external {
        require(msg.sender == address(mailbox), "Only Mailbox can call this function");
        require(_sender == chainToProxyAddress[_origin], "Invalid sender");

        (uint256 actionType, ) = abi.decode(_body, (uint256, bytes));

        if (actionType == 1) {
            _handleVoteCollection(_origin, _body);
        }
    }

    function _handleVoteCollection(uint32 _origin, bytes calldata _body) internal {
        (,uint256 proposalId, uint256 forVotes, uint256 againstVotes) = abi.decode(_body, (uint256, uint256, uint256, uint256));
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.chainVotesCollected[_origin], "Votes already collected for this chain");

        proposal.forVotes += forVotes;
        proposal.againstVotes += againstVotes;
        proposal.chainVotesCollected[_origin] = true;
        proposal.chainVotesCount++;

        emit VotesCollected(proposalId, _origin, forVotes, againstVotes);

        if (proposal.chainVotesCount == supportedChains.length) {
            _finalizeProposal(proposalId);
        }
    }

    function _finalizeProposal(uint256 proposalId) internal {
        Proposal storage proposal = proposals[proposalId];
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        uint256 quorumVotes = (governanceToken.totalSupply() * quorumPercentage) / 100;
        
        if (totalVotes >= quorumVotes && proposal.forVotes > proposal.againstVotes) {
            proposal.executed = true;
            activeProposals.remove(proposalId);
            emit ProposalExecuted(proposalId);
            
            if (proposal.executionChain == 0) {  // Assuming 0 is the home chain
                (bool success, ) = proposal.target.call(proposal.callData);
                require(success, "Proposal execution failed");
            } else {
                _dispatchExecution(proposal.executionChain, proposalId, proposal.target, proposal.callData);
            }
        }
    }

    function _dispatchExecution(uint32 destinationDomain, uint256 proposalId, address target, bytes memory callData) internal {
        bytes memory message = abi.encode(2, proposalId, target, callData);
        uint256 fee = mailbox.quoteDispatch(destinationDomain, chainToProxyAddress[destinationDomain], message);
        mailbox.dispatch{value: fee}(destinationDomain, chainToProxyAddress[destinationDomain], message);
    }

    function getActiveProposals() external view returns (uint256[] memory) {
        return activeProposals.values();
    }

    // Function to withdraw any excess ETH
    function withdrawExcessEth() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}