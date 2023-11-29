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
  bytes4 NotPendingAdminSelector = 0x058d9a1b;
  bytes4 NotAdminSelector = 0x7bfa4b9f;

  function setUp() public {
    Porridge porridgeComputed = Porridge(address(this).computeAddress(4));
    Borrow borrowComputed = Borrow(address(this).computeAddress(3));
    LGE lgeComputed = LGE(address(this).computeAddress(5));
    GoldiGovernor goldigovComputed = GoldiGovernor(address(this).computeAddress(4));
    honey = new Honey();
    gamm = new GAMM(address(this), address(porridgeComputed), address(borrowComputed), address(lgeComputed), address(honey));
    timelock = new Timelock(address(goldigovComputed), 5 days);
    goldigov = new GoldiGovernor(address(timelock), address(gamm), 5761, 69, 1000000e18);
  }

  function testArrayMismatch() public {
    // address[] memory targets = new address[](3);
    // targets[0] = address(0x69);
    // targets[1] = address(0x69);
    // targets[2] = address(0x69);
    // string[] memory signatures = new string[](2);
    // signatures[0] = "hello";
    // signatures[1] = "hello";
    // bytes[] memory calldatas = new bytes[](2);
    // calldatas[0] = hex"8eed55d1";
    // calldatas[1] = hex"8eed55d1";
    // uint256[] memory values = new uint256[](2);
    // values[0] = 69;
    // values[1] = 69;
    // vm.expectRevert(ArrayMismatchSelector);
    // goldigov.propose(targets, signatures, calldatas, values, "");
  }

}