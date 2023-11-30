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
import { LGE } from "../../src/governance/LGE.sol";

contract GoldiGovernorTest is Test {

  using LibRLP for address;

  Honey honey;
  GAMM gamm;
  GoldiGovernor goldigov;
  Timelock timelock;

  bytes4 ArrayMismatchSelector = 0xb7c1140d;
  bytes4 AlreadyProposingSelector = 0x0a709fd5;
  bytes4 AlreadyQueuedSelector = 0x5f8547c2;
  bytes4 AlreadyVotedSelector = 0x7c9a1cf9;
  bytes4 InvalidVotingParameterSelector = 0xe8781c67;
  bytes4 InvalidProposalActionSelector = 0xb1a713fd;
  bytes4 InvalidProposalStateSelector = 0xb4372803;
  bytes4 InvalidVoteTypeSelector = 0x8eed55d1;
  bytes4 InvalidSignatureSelector = 0x8baa579f;
  bytes4 NotMultisigSelector = 0xf05e412b;

  function setUp() public {
    Porridge porridgeComputed = Porridge(address(this).computeAddress(4));
    Borrow borrowComputed = Borrow(address(this).computeAddress(3));
    LGE lgeComputed = LGE(address(this).computeAddress(5));
    GoldiGovernor goldigovComputed = GoldiGovernor(address(this).computeAddress(4));
    honey = new Honey();
    gamm = new GAMM(address(this), address(porridgeComputed), address(borrowComputed), address(lgeComputed), address(honey));
    timelock = new Timelock(address(goldigovComputed), 5 days);
    goldigov = new GoldiGovernor(address(timelock), address(gamm), address(this), 5761, 69, 1000000e18);
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
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(71);
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
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(71);
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
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(71);
    vm.expectRevert(InvalidVoteTypeSelector);
    goldigov.castVote(1, 3);
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
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(71);
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
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(71);
    goldigov.castVote(1, 1);
    GoldiGovernor.Receipt memory receipt = goldigov.getReceipt(1, address(this));

    assertEq(receipt.support, 1);
    assertEq(receipt.votes, 0);
    assertEq(receipt.hasVoted, true);
  }

  function testCastVoteWithReason() public {
    (
      address[] memory targets,
      string[] memory signatures,
      bytes[] memory calldatas,
      uint256[] memory values
    ) = proposy();
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(71);
    goldigov.castVoteWithReason(1, 1, "reason");
  }

  function testCastVoteAgainst() public {
    (
      address[] memory targets,
      string[] memory signatures,
      bytes[] memory calldatas,
      uint256[] memory values
    ) = proposy();
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(71);
    goldigov.castVote(1, 0);
    GoldiGovernor.Receipt memory receipt = goldigov.getReceipt(1, address(this));

    assertEq(receipt.support, 0);
    assertEq(receipt.votes, 0);
    assertEq(receipt.hasVoted, true);
  }

  function testCastVoteAbstain() public {
    (
      address[] memory targets,
      string[] memory signatures,
      bytes[] memory calldatas,
      uint256[] memory values
    ) = proposy();
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(71);
    goldigov.castVote(1, 2);
    GoldiGovernor.Receipt memory receipt = goldigov.getReceipt(1, address(this));

    assertEq(receipt.support, 2);
    assertEq(receipt.votes, 0);
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
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(71);
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
    goldigov.propose(targets, signatures, calldatas, values, "");
    vm.roll(71);
    goldigov.castVote(1, 1);
    vm.expectRevert(InvalidProposalStateSelector);
    goldigov.execute(1);
  }

  // function testExecute() public {
  //   vm.store(address(goldigov), bytes32(uint256(2)), bytes32(uint256(5000e18)));
  //   address[] memory targets = new address[](2);
  //   targets[0] = address(0x69);
  //   targets[1] = address(0x69);
  //   string[] memory signatures = new string[](2);
  //   signatures[0] = "hello";
  //   signatures[1] = "helloagain";
  //   bytes[] memory calldatas = new bytes[](2);
  //   calldatas[0] = hex"8eed55d1";
  //   calldatas[1] = hex"8eed55d1";
  //   uint256[] memory values = new uint256[](2);
  //   values[0] = 69;
  //   values[1] = 69;
  //   goldigov.propose(targets, signatures, calldatas, values, "");
  //   vm.roll(71);
  //   goldigov.castVote(1, 1);
  //   vm.roll(5900);
  //   goldigov.queue(1);
  //   GoldiGovernor.ProposalState state = goldigov.getProposalState(1);
  //   goldigov.execute(1);
    // (, , uint256 eta, , , , , , ,) = goldigov.proposals(1);
  // }

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

  function testSetProposalThresholdParameterFail() public {
    vm.prank(address(0x69));
    vm.expectRevert(NotMultisigSelector);
    goldigov.setProposalThreshold(999999e18);
  }

  function testSetProposalThreshold() public {
    goldigov.setProposalThreshold(1000001e18);
    
    assertEq(1000001e18, goldigov.proposalThreshold());
  }

}