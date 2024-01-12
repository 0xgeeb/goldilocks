//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Test.sol";
import { LibRLP } from "../../lib/solady/src/utils/LibRLP.sol";
import { Honey } from "../../src/mock/Honey.sol";
import { GAMM } from "../../src/core/GAMM.sol";
import { Borrow } from "../../src/core/Borrow.sol";
import { Porridge } from "../../src/core/Porridge.sol";
import { GoldiGovernor } from "../../src/governance/GoldiGovernor.sol";
import { Timelock } from "../../src/governance/Timelock.sol";
import { govLOCKS } from "../../src/governance/govLOCKS.sol";

contract GoldiGovernorTest is Test {

  using LibRLP for address;

  Honey honey;
  GAMM gamm;
  GoldiGovernor goldigov;
  govLOCKS govlocks;
  Timelock timelock;

  bytes4 ArrayMismatchSelector = 0xb7c1140d;
  bytes4 AlreadyProposingSelector = 0x0a709fd5;
  bytes4 AlreadyQueuedSelector = 0x5f8547c2;
  bytes4 AlreadyVotedSelector = 0x7c9a1cf9;
  bytes4 AboveThresholdSelector = 0xe40aeaf5;
  bytes4 BelowThresholdSelector = 0xae274200;
  bytes4 InvalidVotingParameterSelector = 0xe8781c67;
  bytes4 InvalidProposalActionSelector = 0xb1a713fd;
  bytes4 InvalidProposalStateSelector = 0xb4372803;
  bytes4 InvalidVoteTypeSelector = 0x8eed55d1;
  bytes4 InvalidSignatureSelector = 0x8baa579f;
  bytes4 NotMultisigSelector = 0xf05e412b;
  bytes4 NotProposerSelector = 0x7d1b73b9;

  function setUp() public {
    Porridge porridgeComputed = Porridge(address(this).computeAddress(4));
    Borrow borrowComputed = Borrow(address(this).computeAddress(3));
    GoldiGovernor goldigovComputed = GoldiGovernor(address(this).computeAddress(4));
    govLOCKS govlocksComputed = govLOCKS(address(this).computeAddress(5));
    honey = new Honey();
    gamm = new GAMM(address(this), address(porridgeComputed), address(borrowComputed), address(honey));
    timelock = new Timelock(address(goldigovComputed), 5 days);
    goldigov = new GoldiGovernor(address(timelock), address(govlocksComputed), address(this), 5761, 69, 4e18);
    govlocks = new govLOCKS(address(gamm), address(goldigov));
  }

  function proposy() public returns (address[] memory, string[] memory, bytes[] memory, uint256[] memory) {
    address[] memory targets = new address[](2);
    targets[0] = address(0x69);
    targets[1] = address(0x69);
    string[] memory signatures = new string[](2);
    signatures[0] = "hello";
    signatures[1] = "hello";
    bytes[] memory calldatas = new bytes[](2);
    calldatas[0] = hex"8eed55d1";
    calldatas[1] = hex"8eed55d1";
    uint256[] memory values = new uint256[](2);
    values[0] = 69;
    values[1] = 69;

    return (targets, signatures, calldatas, values);
  }

  function testArrayMismatch() public {
    address[] memory targets = new address[](3);
    targets[0] = address(0x69);
    targets[1] = address(0x69);
    targets[2] = address(0x69);
    string[] memory signatures = new string[](2);
    signatures[0] = "hello";
    signatures[1] = "hello";
    bytes[] memory calldatas = new bytes[](2);
    calldatas[0] = hex"8eed55d1";
    calldatas[1] = hex"8eed55d1";
    uint256[] memory values = new uint256[](2);
    values[0] = 69;
    values[1] = 69;
    deal(address(gamm), address(this), 5e18);
    gamm.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    vm.expectRevert(ArrayMismatchSelector);
    goldigov.propose(targets, signatures, calldatas, values, "");
  }

  function testAlreadyProposing() public {
    (
      address[] memory targets,
      string[] memory signatures,
      bytes[] memory calldatas,
      uint256[] memory values
    ) = proposy();
    deal(address(gamm), address(this), 5e18);
    gamm.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.expectRevert(AlreadyProposingSelector);
    goldigov.propose(targets, signatures, calldatas, values, "");
  }

  function testAlreadyQueued() public {
    (
      address[] memory targets,
      string[] memory signatures,
      bytes[] memory calldatas,
      uint256[] memory values
    ) = proposy();
    deal(address(gamm), address(this), 5e18);
    gamm.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(72);
    goldigov.castVote(1, 1);
    vm.roll(5900);
    vm.expectRevert(AlreadyQueuedSelector);
    goldigov.queue(1);
  }

  function testAlreadyVoted() public {
    (
      address[] memory targets,
      string[] memory signatures,
      bytes[] memory calldatas,
      uint256[] memory values
    ) = proposy();
    deal(address(gamm), address(this), 5e18);
    gamm.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(72);
    goldigov.castVote(1, 1);
    vm.expectRevert(AlreadyVotedSelector);
    goldigov.castVote(1, 1);
  }

  function testInvalidVotingParameter() public {
    vm.expectRevert(InvalidVotingParameterSelector);
    goldigov.setVotingDelay(0);
  }

  function testInvalidProposalAction() public {
    address[] memory targets = new address[](11);
    targets[0] = address(0x69);
    targets[1] = address(0x69);
    targets[2] = address(0x69);
    targets[3] = address(0x69);
    targets[4] = address(0x69);
    targets[5] = address(0x69);
    targets[6] = address(0x69);
    targets[7] = address(0x69);
    targets[8] = address(0x69);
    targets[9] = address(0x69);
    targets[10] = address(0x69);
    string[] memory signatures = new string[](11);
    signatures[0] = "hello";
    signatures[1] = "hello";
    signatures[2] = "hello";
    signatures[3] = "hello";
    signatures[4] = "hello";
    signatures[5] = "hello";
    signatures[6] = "hello";
    signatures[7] = "hello";
    signatures[8] = "hello";
    signatures[9] = "hello";
    signatures[10] = "hello";
    bytes[] memory calldatas = new bytes[](11);
    calldatas[0] = hex"8eed55d1";
    calldatas[1] = hex"8eed55d1";
    calldatas[2] = hex"8eed55d1";
    calldatas[3] = hex"8eed55d1";
    calldatas[4] = hex"8eed55d1";
    calldatas[5] = hex"8eed55d1";
    calldatas[6] = hex"8eed55d1";
    calldatas[7] = hex"8eed55d1";
    calldatas[8] = hex"8eed55d1";
    calldatas[9] = hex"8eed55d1";
    calldatas[10] = hex"8eed55d1";
    uint256[] memory values = new uint256[](11);
    values[0] = 69;
    values[1] = 69;
    values[2] = 69;
    values[3] = 69;
    values[4] = 69;
    values[5] = 69;
    values[6] = 69;
    values[7] = 69;
    values[8] = 69;
    values[9] = 69;
    values[10] = 69;
    deal(address(gamm), address(this), 5e18);
    gamm.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    vm.expectRevert(InvalidProposalActionSelector);
    goldigov.propose(targets, signatures, calldatas, values, ""); 
  }

  function testInvalidProposalState() public {
    (
      address[] memory targets,
      string[] memory signatures,
      bytes[] memory calldatas,
      uint256[] memory values
    ) = proposy();
    deal(address(gamm), address(this), 5e18);
    gamm.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);    
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.expectRevert(InvalidProposalStateSelector);
    goldigov.queue(1);
  }

  function testInvalidVoteType() public {
    (
      address[] memory targets,
      string[] memory signatures,
      bytes[] memory calldatas,
      uint256[] memory values
    ) = proposy();
    deal(address(gamm), address(this), 5e18);
    gamm.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(72);
    vm.expectRevert(InvalidVoteTypeSelector);
    goldigov.castVote(1, 3);
  }

  function testVoteInvalidProposalState() public {
    address[] memory targets = new address[](2);
    targets[0] = address(0x69);
    targets[1] = address(0x69);
    string[] memory signatures = new string[](2);
    signatures[0] = "hello";
    signatures[1] = "helloagain";
    bytes[] memory calldatas = new bytes[](2);
    calldatas[0] = hex"8eed55d1";
    calldatas[1] = hex"8eed55d1";
    uint256[] memory values = new uint256[](2);
    values[0] = 0;
    values[1] = 0;
    deal(address(gamm), address(this), 5e18);
    gamm.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(72);
    goldigov.castVote(1, 1);
    vm.roll(5900);
    goldigov.queue(1);
    govlocks.withdraw(2e18);
    vm.roll(5903);
    goldigov.cancel(1);
    vm.expectRevert(InvalidProposalStateSelector);
    goldigov.castVote(1, 1);
  }

  function testInvalidSignature() public {
    vm.expectRevert(InvalidSignatureSelector);
    goldigov.castVoteBySig(1, 1, 1, "", "");
  }

  function testNotMultisig() public {
    vm.prank(address(0x69));
    vm.expectRevert(NotMultisigSelector);
    goldigov.setVotingPeriod(69);
  }

  function testGetProposalState() public {
    (
      address[] memory targets,
      string[] memory signatures,
      bytes[] memory calldatas,
      uint256[] memory values
    ) = proposy();
    deal(address(gamm), address(this), 5e18);
    gamm.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);    
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(72);
    GoldiGovernor.ProposalState state = goldigov.getProposalState(1);

    assertEq(uint256(state), 1);
  }

  function testGetReceipt() public {
    (
      address[] memory targets,
      string[] memory signatures,
      bytes[] memory calldatas,
      uint256[] memory values
    ) = proposy();
    deal(address(gamm), address(this), 5e18);
    gamm.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(72);
    goldigov.castVote(1, 1);
    GoldiGovernor.Receipt memory receipt = goldigov.getReceipt(1, address(this));

    assertEq(receipt.support, 1);
    assertEq(receipt.votes, 5e18);
    assertEq(receipt.hasVoted, true);
  }

  function testProposeThresholdFail() public {
    (
      address[] memory targets,
      string[] memory signatures,
      bytes[] memory calldatas,
      uint256[] memory values
    ) = proposy();
    deal(address(gamm), address(this), 3e18);
    gamm.approve(address(govlocks), 3e18);
    govlocks.deposit(3e18);
    vm.roll(2);
    vm.expectRevert(BelowThresholdSelector);
    goldigov.propose(targets, signatures, calldatas, values, "");
  }

  function testProposeNoTargetsFail() public {
    address[] memory targets = new address[](0);
    string[] memory signatures = new string[](0);
    bytes[] memory calldatas = new bytes[](0);
    uint256[] memory values = new uint256[](0);
    deal(address(gamm), address(this), 5e18);
    gamm.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    vm.expectRevert(InvalidProposalActionSelector);
    goldigov.propose(targets, signatures, calldatas, values, "");
  }

  function testProposePropose() public {
    address[] memory targets = new address[](2);
    targets[0] = address(0x69);
    targets[1] = address(0x69);
    string[] memory signatures = new string[](2);
    signatures[0] = "hello";
    signatures[1] = "helloagain";
    bytes[] memory calldatas = new bytes[](2);
    calldatas[0] = hex"8eed55d1";
    calldatas[1] = hex"8eed55d1";
    uint256[] memory values = new uint256[](2);
    values[0] = 0;
    values[1] = 0;
    deal(address(gamm), address(this), 401e18);
    gamm.approve(address(govlocks), 401e18);
    govlocks.deposit(401e18);
    vm.roll(2);
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(72);
    goldigov.castVote(1, 1);
    vm.roll(5900);
    goldigov.queue(1);
    vm.warp(6 days);
    goldigov.execute(1);
    deal(address(gamm), address(this), 5e18);
    gamm.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(6900);
    goldigov.propose(targets, signatures, calldatas, values, "");
  }

  function testProposalStillActive() public {
    address[] memory targets = new address[](2);
    targets[0] = address(0x69);
    targets[1] = address(0x69);
    string[] memory signatures = new string[](2);
    signatures[0] = "hello";
    signatures[1] = "helloagain";
    bytes[] memory calldatas = new bytes[](2);
    calldatas[0] = hex"8eed55d1";
    calldatas[1] = hex"8eed55d1";
    uint256[] memory values = new uint256[](2);
    values[0] = 69;
    values[1] = 69;
    deal(address(gamm), address(this), 5e18);
    gamm.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(139);
    vm.expectRevert(AlreadyProposingSelector);
    goldigov.propose(targets, signatures, calldatas, values, "");
  }

  function testCastVoteWithReason() public {
    (
      address[] memory targets,
      string[] memory signatures,
      bytes[] memory calldatas,
      uint256[] memory values
    ) = proposy();
    deal(address(gamm), address(this), 5e18);
    gamm.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(72);
    goldigov.castVoteWithReason(1, 1, "reason");
  }

  function testCastVoteAgainst() public {
    (
      address[] memory targets,
      string[] memory signatures,
      bytes[] memory calldatas,
      uint256[] memory values
    ) = proposy();
    deal(address(gamm), address(this), 5e18);
    gamm.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(72);
    goldigov.castVote(1, 0);
    GoldiGovernor.Receipt memory receipt = goldigov.getReceipt(1, address(this));

    assertEq(receipt.support, 0);
    assertEq(receipt.votes, 5e18);
    assertEq(receipt.hasVoted, true);
  }

  function testCastVoteAbstain() public {
    (
      address[] memory targets,
      string[] memory signatures,
      bytes[] memory calldatas,
      uint256[] memory values
    ) = proposy();
    deal(address(gamm), address(this), 5e18);
    gamm.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(72);
    goldigov.castVote(1, 2);
    GoldiGovernor.Receipt memory receipt = goldigov.getReceipt(1, address(this));

    assertEq(receipt.support, 2);
    assertEq(receipt.votes, 5e18);
    assertEq(receipt.hasVoted, true);
  }

  function testCastVoteBySig() public {
    address[] memory targets = new address[](2);
    targets[0] = address(0x69);
    targets[1] = address(0x69);
    string[] memory signatures = new string[](2);
    signatures[0] = "hello";
    signatures[1] = "helloagain";
    bytes[] memory calldatas = new bytes[](2);
    calldatas[0] = hex"8eed55d1";
    calldatas[1] = hex"8eed55d1";
    uint256[] memory values = new uint256[](2);
    values[0] = 0;
    values[1] = 0;
    address admin = 0x50A7dd4778724FbED41aCe9B3d3056a7B36E874C;
    deal(address(gamm), address(admin), 5e18);
    vm.prank(admin);
    gamm.approve(address(govlocks), 5e18);
    vm.prank(admin);
    govlocks.deposit(5e18);
    deal(address(gamm), address(this), 401e18);
    gamm.approve(address(govlocks), 401e18);
    govlocks.deposit(401e18);
    vm.roll(2);
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(72);
    uint8 v = 28;
    bytes32 r = 0x16b88e27f61da00072600b9b04049403f9f064b451d34a5b07aacd7dc48b1f9f;
    bytes32 s = 0x6613e63d75d423834a24b707d13a34304f3b66c6f2eaacb611b327550761215d;
    vm.prank(admin);
    goldigov.castVoteBySig(1, 1, v, r, s);
    GoldiGovernor.Receipt memory receipt = goldigov.getReceipt(1, address(admin));

    assertEq(receipt.support, 1);
    assertEq(receipt.votes, 5e18);
    assertEq(receipt.hasVoted, true);
  }

  function testQueueEta() public {
    address[] memory targets = new address[](2);
    targets[0] = address(0x69);
    targets[1] = address(0x69);
    string[] memory signatures = new string[](2);
    signatures[0] = "hello";
    signatures[1] = "helloagain";
    bytes[] memory calldatas = new bytes[](2);
    calldatas[0] = hex"8eed55d1";
    calldatas[1] = hex"8eed55d1";
    uint256[] memory values = new uint256[](2);
    values[0] = 69;
    values[1] = 69;
    deal(address(gamm), address(this), 5e18);
    gamm.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(72);
    goldigov.castVote(1, 1);
    vm.roll(5900);
    goldigov.queue(1);
    (, , uint256 eta, , , , , , ,) = goldigov.proposals(1);
    
    assertEq(432001, eta);
  }

  function testExecuteFail() public {
    address[] memory targets = new address[](2);
    targets[0] = address(0x69);
    targets[1] = address(0x69);
    string[] memory signatures = new string[](2);
    signatures[0] = "hello";
    signatures[1] = "helloagain";
    bytes[] memory calldatas = new bytes[](2);
    calldatas[0] = hex"8eed55d1";
    calldatas[1] = hex"8eed55d1";
    uint256[] memory values = new uint256[](2);
    values[0] = 69;
    values[1] = 69;
    deal(address(gamm), address(this), 5e18);
    gamm.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(72);
    goldigov.castVote(1, 1);
    vm.expectRevert(InvalidProposalStateSelector);
    goldigov.execute(1);
  }

  function testExecuteSuccess() public {
    address[] memory targets = new address[](2);
    targets[0] = address(0x69);
    targets[1] = address(0x69);
    string[] memory signatures = new string[](2);
    signatures[0] = "hello";
    signatures[1] = "helloagain";
    bytes[] memory calldatas = new bytes[](2);
    calldatas[0] = hex"8eed55d1";
    calldatas[1] = hex"8eed55d1";
    uint256[] memory values = new uint256[](2);
    values[0] = 0;
    values[1] = 0;
    deal(address(gamm), address(this), 401e18);
    gamm.approve(address(govlocks), 401e18);
    govlocks.deposit(401e18);
    vm.roll(2);
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(72);
    goldigov.castVote(1, 1);
    vm.roll(5900);
    goldigov.queue(1);
    vm.warp(6 days);
    goldigov.execute(1);
    (, , uint256 eta, , , uint256 forVotes, uint256 againstVotes, , , bool executed) = goldigov.proposals(1);

    assertEq(executed, true);
  }

  function testDefeatedProposal() public {
    address[] memory targets = new address[](2);
    targets[0] = address(0x69);
    targets[1] = address(0x69);
    string[] memory signatures = new string[](2);
    signatures[0] = "hello";
    signatures[1] = "helloagain";
    bytes[] memory calldatas = new bytes[](2);
    calldatas[0] = hex"8eed55d1";
    calldatas[1] = hex"8eed55d1";
    uint256[] memory values = new uint256[](2);
    values[0] = 0;
    values[1] = 0;
    deal(address(gamm), address(this), 399e18);
    gamm.approve(address(govlocks), 399e18);
    govlocks.deposit(399e18);
    vm.roll(2);
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(72);
    goldigov.castVote(1, 1);
    vm.roll(5900);
    goldigov.queue(1);
    GoldiGovernor.ProposalState state = goldigov.getProposalState(1);

    assertEq(uint256(state), 3);
  }

  function testExpiredProposal() public {
    address[] memory targets = new address[](2);
    targets[0] = address(0x69);
    targets[1] = address(0x69);
    string[] memory signatures = new string[](2);
    signatures[0] = "hello";
    signatures[1] = "helloagain";
    bytes[] memory calldatas = new bytes[](2);
    calldatas[0] = hex"8eed55d1";
    calldatas[1] = hex"8eed55d1";
    uint256[] memory values = new uint256[](2);
    values[0] = 0;
    values[1] = 0;
    deal(address(gamm), address(this), 401e18);
    gamm.approve(address(govlocks), 401e18);
    govlocks.deposit(401e18);
    vm.roll(2);
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(72);
    goldigov.castVote(1, 1);
    vm.roll(5900);
    goldigov.queue(1);
    vm.warp(69 days);
    GoldiGovernor.ProposalState state = goldigov.getProposalState(1);

    assertEq(uint256(state), 6);
  }

  function testCancelStateFail() public {
    address[] memory targets = new address[](2);
    targets[0] = address(0x69);
    targets[1] = address(0x69);
    string[] memory signatures = new string[](2);
    signatures[0] = "hello";
    signatures[1] = "helloagain";
    bytes[] memory calldatas = new bytes[](2);
    calldatas[0] = hex"8eed55d1";
    calldatas[1] = hex"8eed55d1";
    uint256[] memory values = new uint256[](2);
    values[0] = 0;
    values[1] = 0;
    deal(address(gamm), address(this), 401e18);
    gamm.approve(address(govlocks), 401e18);
    govlocks.deposit(401e18);
    vm.roll(2);
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(72);
    goldigov.castVote(1, 1);
    vm.roll(5900);
    goldigov.queue(1);
    vm.warp(6 days);
    goldigov.execute(1);
    vm.expectRevert(InvalidProposalStateSelector);
    goldigov.cancel(1);
  }

  function testCancelProposerFail() public {
    address[] memory targets = new address[](2);
    targets[0] = address(0x69);
    targets[1] = address(0x69);
    string[] memory signatures = new string[](2);
    signatures[0] = "hello";
    signatures[1] = "helloagain";
    bytes[] memory calldatas = new bytes[](2);
    calldatas[0] = hex"8eed55d1";
    calldatas[1] = hex"8eed55d1";
    uint256[] memory values = new uint256[](2);
    values[0] = 0;
    values[1] = 0;
    deal(address(gamm), address(this), 5e18);
    gamm.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(72);
    goldigov.castVote(1, 1);
    vm.roll(5900);
    goldigov.queue(1);
    vm.prank(address(0x69));
    vm.expectRevert(NotProposerSelector);
    goldigov.cancel(1);
  }

  function testCancelThresholdFail() public {
    address[] memory targets = new address[](2);
    targets[0] = address(0x69);
    targets[1] = address(0x69);
    string[] memory signatures = new string[](2);
    signatures[0] = "hello";
    signatures[1] = "helloagain";
    bytes[] memory calldatas = new bytes[](2);
    calldatas[0] = hex"8eed55d1";
    calldatas[1] = hex"8eed55d1";
    uint256[] memory values = new uint256[](2);
    values[0] = 0;
    values[1] = 0;
    deal(address(gamm), address(this), 5e18);
    gamm.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(72);
    goldigov.castVote(1, 1);
    vm.roll(5900);
    goldigov.queue(1);
    vm.expectRevert(AboveThresholdSelector);
    goldigov.cancel(1);
  }

  function testCancelSuccess() public {
    address[] memory targets = new address[](2);
    targets[0] = address(0x69);
    targets[1] = address(0x69);
    string[] memory signatures = new string[](2);
    signatures[0] = "hello";
    signatures[1] = "helloagain";
    bytes[] memory calldatas = new bytes[](2);
    calldatas[0] = hex"8eed55d1";
    calldatas[1] = hex"8eed55d1";
    uint256[] memory values = new uint256[](2);
    values[0] = 0;
    values[1] = 0;
    deal(address(gamm), address(this), 5e18);
    gamm.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(72);
    goldigov.castVote(1, 1);
    vm.roll(5900);
    goldigov.queue(1);
    govlocks.withdraw(2e18);
    vm.roll(5903);
    goldigov.cancel(1);

    (, , uint256 eta, , , uint256 forVotes, uint256 againstVotes, , bool cancelled, bool executed) = goldigov.proposals(1);
    GoldiGovernor.ProposalState state = goldigov.getProposalState(1);

    assertEq(cancelled, true);
    assertEq(uint256(state), 2);
  }

  function testSetMultisigFail() public {
    vm.prank(address(0x69));
    vm.expectRevert(NotMultisigSelector);
    goldigov.setMultisig(address(0x69));
  }

  function testSetMultisig() public {
    goldigov.setMultisig(address(0x69));

    assertEq(address(0x69), goldigov.multisig());
  }

  function testSetVotingDelay() public {
    goldigov.setVotingDelay(2);
    
    assertEq(2, goldigov.votingDelay());
  }

  function testSetVotingDelayNotMultisig() public {
    vm.prank(address(0x69));
    vm.expectRevert(NotMultisigSelector);
    goldigov.setVotingDelay(2);
  }

  function testSetVotingPeriodFail() public {
    vm.expectRevert(InvalidVotingParameterSelector);
    goldigov.setVotingPeriod(5000);
  }

  function testSetVotingPeriod() public {
    goldigov.setVotingPeriod(6000);

    assertEq(6000, goldigov.votingPeriod());
  }

  function testSetProposalThresholdMultisigFail() public {
    vm.prank(address(0x69));
    vm.expectRevert(NotMultisigSelector);
    goldigov.setProposalThreshold(1000001e18);
  }

  function testSetProposalThresholdParameterFailHigh() public {
    vm.expectRevert(InvalidVotingParameterSelector);
    goldigov.setProposalThreshold(1e17);
  }

  function testSetProposalThresholdParameterFailLow() public {
    vm.expectRevert(InvalidVotingParameterSelector);
    goldigov.setProposalThreshold(20000000e18);
  }

  function testSetProposalThreshold() public {
    goldigov.setProposalThreshold(1000001e18);
    
    assertEq(1000001e18, goldigov.proposalThreshold());
  }

}