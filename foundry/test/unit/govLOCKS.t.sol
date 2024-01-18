//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Test.sol";
import { LibRLP } from "../../lib/solady/src/utils/LibRLP.sol";
import { Honey } from "../../src/mock/Honey.sol";
import { Goldiswap } from "../../src/core/Goldiswap.sol";
import { Borrow } from "../../src/core/Borrow.sol";
import { Porridge } from "../../src/core/Porridge.sol";
import { GoldiGovernor } from "../../src/governance/GoldiGovernor.sol";
import { Timelock } from "../../src/governance/Timelock.sol";
import { govLOCKS } from "../../src/governance/govLOCKS.sol";

contract govLOCKSTest is Test {

  using LibRLP for address;

  Honey honey;
  Goldiswap goldiswap;
  GoldiGovernor goldigov;
  Timelock timelock;
  govLOCKS govlocks;

  bytes4 NoSuchBlockSelector = 0xfd8d4168;

  function setUp() public {
    Porridge porridgeComputed = Porridge(address(this).computeAddress(4));
    Borrow borrowComputed = Borrow(address(this).computeAddress(3));
    GoldiGovernor goldigovComputed = GoldiGovernor(address(this).computeAddress(4));
    honey = new Honey();
    goldiswap = new Goldiswap(address(this), address(porridgeComputed), address(borrowComputed), address(honey));
    timelock = new Timelock(address(goldigovComputed), 5 days);
    goldigov = new GoldiGovernor(address(timelock), address(goldiswap), address(this), 5761, 69, 1000000e18);
    govlocks = new govLOCKS(address(goldiswap), address(goldigov));
  }

  function testLocksName() public {
    assertEq(govlocks.name(), "Governance Locks");
  }

  function testLocksSymbol() public {
    assertEq(govlocks.symbol(), "govLOCKS");
  }

  function testDeposit() public {
    deal(address(goldiswap), address(this), 5e18);
    goldiswap.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);

    assertEq(goldiswap.balanceOf(address(this)), 0);
    assertEq(govlocks.balanceOf(address(this)), 5e18);
  }

  function testWithdraw() public {
    deal(address(goldiswap), address(this), 5e18);
    goldiswap.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    govlocks.withdraw(5e18);

    assertEq(goldiswap.balanceOf(address(this)), 5e18);
    assertEq(govlocks.balanceOf(address(this)), 0);
  }

  function testNoSuchBlock() public {
    deal(address(goldiswap), address(this), 5e18);
    goldiswap.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    vm.expectRevert(NoSuchBlockSelector);
    govlocks.getPriorVotes(address(this), 2);
  }

  function testGetCurrentVotes() public {
    deal(address(goldiswap), address(this), 5e18);
    goldiswap.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    uint256 votes = govlocks.getCurrentVotes(address(this));

    assertEq(votes, 5e18);
  }

  function testGetPriorVotesNone() public {
    vm.roll(2);
    uint256 votes = govlocks.getPriorVotes(address(this), 1);

    assertEq(votes, 0);
  }

  function testGetPriorVotes() public {
    deal(address(goldiswap), address(this), 5e18);
    goldiswap.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    uint256 votes = govlocks.getPriorVotes(address(this), 1);

    assertEq(votes, 5e18);
  }

  function testGetPriorVotesImplicitZero() public {
    vm.roll(69);
    deal(address(goldiswap), address(this), 5e18);
    goldiswap.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(420);
    uint256 votes = govlocks.getPriorVotes(address(this), 40);

    assertEq(votes, 0);
  }

  function testGetPriorVotesNotMostRecentBalance() public {
    vm.roll(69);
    deal(address(goldiswap), address(this), 5e18);
    goldiswap.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(420);
    deal(address(goldiswap), address(this), 5e18);
    goldiswap.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(500);
    uint256 votes = govlocks.getPriorVotes(address(this), 80);

    assertEq(votes, 5e18);
  }

  function testGetPriorVotesNotMostRecentBalanceEqual() public {
    vm.roll(69);
    deal(address(goldiswap), address(this), 5e18);
    goldiswap.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(420);
    deal(address(goldiswap), address(this), 5e18);
    goldiswap.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(500);
    deal(address(goldiswap), address(this), 5e18);
    goldiswap.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(1000);
    deal(address(goldiswap), address(this), 5e18);
    goldiswap.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    uint256 votes = govlocks.getPriorVotes(address(this), 420);

    assertEq(votes, 10e18);
  }

  function testGetPriorVotesNotMostRecentBalanceLower() public {
    vm.roll(69);
    deal(address(goldiswap), address(this), 5e18);
    goldiswap.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(420);
    deal(address(goldiswap), address(this), 5e18);
    goldiswap.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(500);
    deal(address(goldiswap), address(this), 5e18);
    goldiswap.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(1000);
    deal(address(goldiswap), address(this), 5e18);
    goldiswap.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    uint256 votes = govlocks.getPriorVotes(address(this), 421);

    assertEq(votes, 10e18);
  }

  function testDelegate() public {
    address user = address(0x69);
    deal(address(goldiswap), address(this), 5e18);
    goldiswap.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    govlocks.delegate(user);
    vm.roll(3);
    uint256 userVotes = govlocks.getPriorVotes(user, block.number - 1);
    uint256 thisVotes = govlocks.getPriorVotes(address(this), block.number - 1);

    assertEq(userVotes, 5e18);
    assertEq(thisVotes, 5e18);
  }

  function testDelegateDelegate() public {
    address user = address(0x69);
    address user2 = address(0x420);
    deal(address(goldiswap), address(this), 5e18);
    goldiswap.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(2);
    govlocks.delegate(user);
    vm.roll(3);
    govlocks.delegate(user2);
    vm.roll(4);
    uint256 userVotes = govlocks.getPriorVotes(user, block.number - 1);
    uint256 user2Votes = govlocks.getPriorVotes(user2, block.number - 1);
    uint256 thisVotes = govlocks.getPriorVotes(address(this), block.number - 1);

    assertEq(userVotes, 0);
    assertEq(user2Votes, 5e18);
    assertEq(thisVotes, 5e18);
  }

  function testDelegateDelegateCheck() public {
    address user = address(0x69);
    address user2 = address(0x420);
    deal(address(goldiswap), address(this), 5e18);
    goldiswap.approve(address(govlocks), 5e18);
    govlocks.deposit(5e18);
    vm.roll(5);
    govlocks.delegate(user);
    vm.roll(10);
    address currentDelegate = govlocks.delegates(address(this));
    uint256 balance = govlocks.balanceOf(address(this));
    govlocks.delegate(user2);
  }

}