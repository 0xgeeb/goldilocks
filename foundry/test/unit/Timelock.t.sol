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
import { govLOCKS } from "../../src/governance/govLOCKS.sol";

contract TimelockTest is Test {

  using LibRLP for address;

  Honey honey;
  GAMM gamm;
  GoldiGovernor goldigov;
  govLOCKS govlocks;
  Timelock timelock;

  bytes4 NotAdminSelector = 0x7bfa4b9f;
  bytes4 InvalidDelaySelector = 0x4fbe5dba;

  function setUp() public {
    Porridge porridgeComputed = Porridge(address(this).computeAddress(4));
    Borrow borrowComputed = Borrow(address(this).computeAddress(3));
    LGE lgeComputed = LGE(address(this).computeAddress(5));
    GoldiGovernor goldigovComputed = GoldiGovernor(address(this).computeAddress(4));
    govLOCKS govlocksComputed = govLOCKS(address(this).computeAddress(5));
    honey = new Honey();
    gamm = new GAMM(address(this), address(porridgeComputed), address(borrowComputed), address(lgeComputed), address(honey));
    timelock = new Timelock(address(goldigovComputed), 5 days);
    goldigov = new GoldiGovernor(address(timelock), address(govlocksComputed), address(this), 5761, 69, 1e18);
    govlocks = new govLOCKS(address(gamm), address(goldigov));
  }

  function testEmptySignatures() public {
    address[] memory targets = new address[](2);
    targets[0] = address(0x69);
    targets[1] = address(0x69);
    string[] memory signatures = new string[](2);
    signatures[0] = "";
    signatures[1] = "";
    bytes[] memory calldatas = new bytes[](2);
    calldatas[0] = hex"8eed55d1";
    calldatas[1] = hex"8eed55d2";
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
  }

  function testSetAdminFail() public {
    vm.prank(address(0x69));
    vm.expectRevert(NotAdminSelector);
    timelock.setAdmin(address(0x69));
  }

  function testSetAdmin() public {
    vm.prank(address(goldigov));
    timelock.setAdmin(address(0x69));
    
    assertEq(timelock.admin(), address(0x69));
  }

  function testSetDelayFailAdmin() public {
    vm.prank(address(0x69));
    vm.expectRevert(NotAdminSelector);
    timelock.setDelay(69);
  }

  function testSetDelayFailDelay() public {
    vm.prank(address(goldigov));
    vm.expectRevert(InvalidDelaySelector);
    timelock.setDelay(1 days);
  }

  function setDelaySuccess() public {
    uint256 delay = 3 days;
    vm.prank(address(goldigov));
    timelock.setDelay(delay);

    assertEq(timelock.delay(), delay);
  }

}