//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


// |============================================================================================|
// |    ______      _____    __      _____    __   __       _____     _____   __  __   ______   |
// |   /_/\___\    ) ___ (  /\_\    /\ __/\  /\_\ /\_\     ) ___ (   /\ __/\ /\_\\  /\/ ____/\  |
// |   ) ) ___/   / /\_/\ \( ( (    ) )  \ \ \/_/( ( (    / /\_/\ \  ) )__\/( ( (/ / /) ) __\/  |
// |  /_/ /  ___ / /_/ (_\ \\ \_\  / / /\ \ \ /\_\\ \_\  / /_/ (_\ \/ / /    \ \_ / /  \ \ \    |
// |  \ \ \_/\__\\ \ )_/ / // / /__\ \ \/ / // / // / /__\ \ )_/ / /\ \ \_   / /  \ \  _\ \ \   |
// |   )_)  \/ _/ \ \/_\/ /( (_____() )__/ /( (_(( (_____(\ \/_\/ /  ) )__/\( (_(\ \ \)____) )  |
// |   \_\____/    )_____(  \/_____/\/___\/  \/_/ \/_____/ )_____(   \/___\/ \/_//__\/\____\/   |
// |                                                                                            |
// |============================================================================================|
// ==============================================================================================
// ===================================== GoldiGovernor ==========================================
// ==============================================================================================


import { Timelock } from "./Timelock.sol";
import { govLOCKS } from "./govLOCKS.sol";


/// @title GoldiGovernor
/// @notice Governance contract for Goldilocks Protocol & Goldilocks DAO
/// @dev Forked from Uniswap governance contracts, https://etherscan.io/address/0x408ed6354d4973f66138c91495f2f2fcbd8724c3
/// @author geeb
contract GoldiGovernor {


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                       STRUCTS & ENUMS                      */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  struct Proposal {
    address[] targets;    
    string[] signatures;    
    bytes[] calldatas;    
    uint256[] values;    
    address proposer;
    uint256 id;   
    uint256 eta;
    uint256 startBlock;    
    uint256 endBlock;    
    uint256 forVotes;    
    uint256 againstVotes;    
    uint256 abstainVotes;
    bool cancelled;    
    bool executed;
    mapping (address => Receipt) receipts;
  }

  struct Receipt {
    uint256 support;
    uint256 votes;
    bool hasVoted;
  }

  enum ProposalState {
    Pending,
    Active,
    Canceled,
    Defeated,
    Succeeded,
    Queued,
    Expired,
    Executed
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      STATE VARIABLES                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  string public constant name = "GoldiGovernor";
  uint256 public constant MIN_PROPOSAL_THRESHOLD = 1000000e18;
  uint256 public constant MAX_PROPOSAL_THRESHOLD = 10000000e18;
  uint32 public constant MIN_VOTING_PERIOD = 5760; // About 24 hours
  uint32 public constant MAX_VOTING_PERIOD = 80640; // About 2 weeks
  uint32 public constant MIN_VOTING_DELAY = 1;
  uint32 public constant MAX_VOTING_DELAY = 40320; // About 1 week
  uint32 public constant proposalMaxOperations = 10;
  uint256 public constant quorumVotes = 400e18; // 4% of $LOCKS

  bytes32 public constant DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)");
  bytes32 public constant BALLOT_TYPEHASH = keccak256("Ballot(uint256 proposalId,uint8 support)");

  address public timelock;
  address public govlocks;
  address public multisig;

  mapping(uint256 => Proposal) public proposals;
  mapping(address => uint256) public latestProposalIds;

  uint256 public votingDelay;
  uint256 public votingPeriod;
  uint256 public proposalThreshold;
  uint256 public proposalCount;


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                         CONSTRUCTOR                        */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Constructor of this contract
  /// @param _timelock Address of the Timelock
  /// @param _govlocks Address of $LOCKS
  /// @param _multisig Address of the GoldilocksDAO multisig
  /// @param _votingPeriod Duration of voting on a proposal, in blocks
  /// @param _votingDelay Delay before voting on a proposal may take place, once proposed, in blocks
  /// @param _proposalThreshold Number of votes required in order for a voter to become a proposer
  constructor(
    address _timelock,
    address _govlocks,
    address _multisig,
    uint256 _votingPeriod,
    uint256 _votingDelay,
    uint256 _proposalThreshold
  ) {
    if(_votingPeriod < MIN_VOTING_PERIOD || _votingPeriod > MAX_VOTING_PERIOD) revert InvalidVotingParameter();
    if(_votingDelay < MIN_VOTING_DELAY || _votingDelay > MAX_VOTING_DELAY) revert InvalidVotingParameter();
    if(_proposalThreshold < MIN_PROPOSAL_THRESHOLD || _proposalThreshold > MAX_PROPOSAL_THRESHOLD) revert InvalidVotingParameter();
    timelock = _timelock;
    govlocks = _govlocks;
    multisig = _multisig;
    votingPeriod = _votingPeriod;
    votingDelay = _votingDelay;
    proposalThreshold = _proposalThreshold;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           ERRORS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  error ArrayMismatch();
  error AlreadyProposing();
  error AlreadyQueued();
  error AlreadyVoted();
  error InvalidVotingParameter();
  error InvalidProposalAction();
  error InvalidProposalState();
  error InvalidVoteType();
  error InvalidSignature();
  error NotMultisig();


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           EVENTS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

  
  event VoteCast(address indexed voter, uint256 proposalId, uint8 support, uint256 votes, string reason);
  event ProposalCreated(uint256 id, address proposer, address[] targets, uint[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description);
  event ProposalQueued(uint256 id, uint256 eta);
  event ProposalExecuted(uint256 id);
  event ProposalCanceled(uint256 id);
  event VotingDelaySet(uint256 oldVotingDelay, uint256 newVotingDelay);
  event VotingPeriodSet(uint256 oldVotingPeriod, uint256 newVotingPeriod);
  event ProposalThresholdSet(uint256 oldProposalThreshold, uint256 newProposalThreshold);
  event NewAdmin(address oldAdmin, address newAdmin);


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                       VIEW FUNCTIONS                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Return the state of a proposal
  /// @param proposalId Id of the proposal
  function getProposalState(uint256 proposalId) public view returns (ProposalState) {
    return _getProposalState(proposalId);
  }

  /// @notice Returns the receipt for a voter on a given proposal
  /// @param voter Address of voter
  /// @param proposalId Id of proposal
  function getReceipt(uint256 proposalId, address voter) external view returns (Receipt memory) {
    return proposals[proposalId].receipts[voter];
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      EXTERNAL FUNCTIONS                    */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Proposes a new proposal, proposer must have delegates above the proposal threshold
  /// @param targets Target addresses for proposal calls
  /// @param signatures Function signatures for proposal calls
  /// @param calldatas Calldatas for proposal calls
  /// @param values Eth values for proposal calls
  /// @param description String description of the proposal
  function propose(
    address[] memory targets,
    string[] memory signatures, 
    bytes[] memory calldatas,
    uint256[] memory values,
    string memory description
  ) external {
    require(govLOCKS(govlocks).getPriorVotes(msg.sender, block.number - 1) > proposalThreshold, "GovernorBravo::propose: proposer votes below proposal threshold");
    if(targets.length != values.length || targets.length != signatures.length || targets.length != calldatas.length) revert ArrayMismatch();
    if(targets.length == 0) revert InvalidProposalAction();
    if(targets.length > proposalMaxOperations) revert InvalidProposalAction();
    uint256 latestProposalId = latestProposalIds[msg.sender];
    if (latestProposalId != 0) {
      ProposalState proposersLatestProposalState = _getProposalState(latestProposalId);
      if(proposersLatestProposalState == ProposalState.Active) revert AlreadyProposing();
      if(proposersLatestProposalState == ProposalState.Pending) revert AlreadyProposing();
    }
    uint256 startBlock = block.number + votingDelay;
    uint256 endBlock = startBlock + votingPeriod;
    proposalCount++;
    Proposal storage newProposal = proposals[proposalCount];
    newProposal.id = proposalCount;
    newProposal.proposer = msg.sender;
    newProposal.eta = 0;
    newProposal.targets = targets;
    newProposal.values = values;
    newProposal.signatures = signatures;
    newProposal.calldatas = calldatas;
    newProposal.startBlock = startBlock;
    newProposal.endBlock = endBlock;
    newProposal.forVotes = 0;
    newProposal.againstVotes = 0;
    newProposal.abstainVotes = 0;
    newProposal.cancelled = false;
    newProposal.executed = false;
    latestProposalIds[msg.sender] = proposalCount;
    emit ProposalCreated(proposalCount, msg.sender, targets, values, signatures, calldatas, startBlock, endBlock, description);    
  }
  
  /// @notice Queues a proposal if successful
  /// @param proposalId Id of the proposal to queue
  function queue(uint256 proposalId) external {
    if(_getProposalState(proposalId) != ProposalState.Succeeded) revert InvalidProposalState();
    Proposal storage proposal = proposals[proposalId];
    uint256 eta = block.timestamp + Timelock(timelock).delay();
    uint256 targetsLength = proposal.targets.length;
    for (uint256 i = 0; i < targetsLength; i++) {
      _queueOrRevertInternal(proposal.targets[i], proposal.values[i], proposal.signatures[i], proposal.calldatas[i], eta);
    }
    proposal.eta = eta;
    emit ProposalQueued(proposalId, eta);
  }

  /// @notice Executes a queued proposal if eta has passed
  /// @param proposalId Id of the proposal to execute
  function execute(uint256 proposalId) external payable {
    if(_getProposalState(proposalId) != ProposalState.Queued) revert InvalidProposalState();
    Proposal storage proposal = proposals[proposalId];
    proposal.executed = true;
    uint256 targetsLength = proposal.targets.length;
    for (uint256 i = 0; i < targetsLength; i++) {
      Timelock(timelock).executeTransaction{ value: proposal.values[i] }(proposal.targets[i], proposal.eta, proposal.values[i], proposal.calldatas[i], proposal.signatures[i]);
    }
    emit ProposalExecuted(proposalId);
  }

  /// @notice Cancels a proposal only if sender is the proposer, or proposer delegates dropped below proposal threshold
  /// @param proposalId Id of the proposal to cancel
  function cancel(uint256 proposalId) external {
    if(_getProposalState(proposalId) == ProposalState.Executed) revert InvalidProposalState();
    Proposal storage proposal = proposals[proposalId];
    // require(msg.sender == proposal.proposer || uni.getPriorVotes(proposal.proposer, block.number - 1) < proposalThreshold, "GovernorBravo::cancel: proposer above threshold");
    proposal.cancelled = true;
    uint256 targetsLength = proposal.targets.length;
    for (uint256 i = 0; i < targetsLength; i++) {
      Timelock(timelock).cancelTransaction(proposal.targets[i], proposal.eta, proposal.values[i], proposal.calldatas[i], proposal.signatures[i]);
    }
    emit ProposalCanceled(proposalId);
  }

  /// @notice Cast a vote for a proposal
  /// @param proposalId Id of the proposal to vote on
  /// @param support Support value for the vote. 0=against, 1=for, 2=abstain
  function castVote(uint256 proposalId, uint8 support) external {
    emit VoteCast(msg.sender, proposalId, support, _castVoteInternal(msg.sender, proposalId, support), "");
  }

  /// @notice Cast a vote for a proposal with a reason
  /// @param proposalId Id of the proposal to vote on
  /// @param support Support value for the vote. 0=against, 1=for, 2=abstain
  /// @param reason Reason given for the vote by the voter
  function castVoteWithReason(uint256 proposalId, uint8 support, string calldata reason) external {
    emit VoteCast(msg.sender, proposalId, support, _castVoteInternal(msg.sender, proposalId, support), reason);
  }

  /// @notice Cast a vote for a proposal by signature
  /// @dev Accepts EIP-712 signatures for voting on proposals
  function castVoteBySig(uint256 proposalId, uint8 support, uint8 v, bytes32 r, bytes32 s) external {
    bytes32 domainSeparator = keccak256(abi.encode(DOMAIN_TYPEHASH, keccak256(bytes(name)), _getChainId(), address(this)));
    bytes32 structHash = keccak256(abi.encode(BALLOT_TYPEHASH, proposalId, support));
    bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
    address signatory = ecrecover(digest, v, r, s);
    if(signatory == address(0)) revert InvalidSignature();
    emit VoteCast(signatory, proposalId, support, _castVoteInternal(msg.sender, proposalId, support), "");
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      INTERNAL FUNCTIONS                    */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Returns the state of a proposal
  /// @param proposalId Id of the proposal
  function _getProposalState(uint256 proposalId) internal view returns (ProposalState) {
    Proposal storage proposal = proposals[proposalId];
    if (proposal.cancelled) return ProposalState.Canceled;
    else if (block.number <= proposal.startBlock) return ProposalState.Pending; 
    else if (block.number <= proposal.endBlock) return ProposalState.Active;
    else if (proposal.eta == 0) return ProposalState.Succeeded;
    else if (proposal.executed) return ProposalState.Executed;
    else if (proposal.forVotes <= proposal.againstVotes || proposal.forVotes < quorumVotes) {
      return ProposalState.Defeated;
    } 
    else if (block.timestamp >= proposal.eta + Timelock(timelock).GRACE_PERIOD()) {
      return ProposalState.Expired;
    } 
    else {
      return ProposalState.Queued;
    }
  }

  /// @notice Queues transaction if not already queued
  function _queueOrRevertInternal(address target, uint256 value, string memory signature, bytes memory data, uint256 eta) internal {
    if(Timelock(timelock).queuedTransactions(keccak256(abi.encode(target, value, signature, data, eta)))) revert AlreadyQueued();
    Timelock(timelock).queueTransaction(target, eta, value, data, signature);
  }

  /// @notice Casts a vote
  /// @param voter Address that is casting the vote
  /// @param proposalId Id of the proposal to vote on
  /// @param support Support value for the vote. 0=against, 1=for, 2=abstain
  function _castVoteInternal(address voter, uint256 proposalId, uint8 support) internal returns (uint256) {
    if(_getProposalState(proposalId) != ProposalState.Active) revert InvalidProposalState();
    if(support > 2) revert InvalidVoteType();
    Proposal storage proposal = proposals[proposalId];
    Receipt storage receipt = proposal.receipts[voter];
    if(receipt.hasVoted != false) revert AlreadyVoted();
    // uint96 votes = uni.getPriorVotes(voter, proposal.startBlock);
    uint256 votes = 0;
    if (support == 0) {
      proposal.againstVotes = proposal.againstVotes + votes;
    } else if (support == 1) {
      proposal.forVotes = proposal.forVotes + votes;
    } else if (support == 2) {
      proposal.abstainVotes = proposal.abstainVotes + votes;
    }
    receipt.hasVoted = true;
    receipt.support = support;
    receipt.votes = votes;
    return votes;
  }

  /// @notice Returns the chain Id
  function _getChainId() internal view returns (uint256) {
    uint256 chainId;
    assembly { chainId := chainid() }
    return chainId;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                    PERMISSIONED FUNCTIONS                  */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Changes the address of the multisig address
  /// @dev Used after deployment by deployment address
  /// @param _multisig Address of the multisig
  function setMultisig(address _multisig) external {
    if(msg.sender != multisig) revert NotMultisig();
    address oldMultisig = multisig;
    multisig = _multisig;
    emit NewAdmin(oldMultisig, multisig);
  }

  /// @notice Sets the voting delay
  /// @param newVotingDelay New voting delay, in blocks
  function setVotingDelay(uint256 newVotingDelay) external {
    if(msg.sender != multisig) revert NotMultisig();
    if(newVotingDelay < MIN_VOTING_DELAY || newVotingDelay > MAX_VOTING_DELAY) revert InvalidVotingParameter();
    uint256 oldVotingDelay = votingDelay;
    votingDelay = newVotingDelay;
    emit VotingDelaySet(oldVotingDelay, votingDelay);
  }

  /// @notice Sets the voting period
  /// @param newVotingPeriod New voting period, in blocks
  function setVotingPeriod(uint256 newVotingPeriod) external {
    if(msg.sender != multisig) revert NotMultisig();
    if(newVotingPeriod < MIN_VOTING_PERIOD || newVotingPeriod > MAX_VOTING_PERIOD) revert InvalidVotingParameter();
    uint256 oldVotingPeriod = votingPeriod;
    votingPeriod = newVotingPeriod;
    emit VotingPeriodSet(oldVotingPeriod, votingPeriod);
  }

  /// @notice Sets the proposal threshold
  /// @param newProposalThreshold New proposal threshold
  function setProposalThreshold(uint256 newProposalThreshold) external {
    if(msg.sender != multisig) revert NotMultisig();
    if(newProposalThreshold < MIN_PROPOSAL_THRESHOLD || newProposalThreshold > MAX_PROPOSAL_THRESHOLD) revert InvalidVotingParameter();
    uint256 oldProposalThreshold = proposalThreshold;
    proposalThreshold = newProposalThreshold;
    emit ProposalThresholdSet(oldProposalThreshold, proposalThreshold);
  }

}