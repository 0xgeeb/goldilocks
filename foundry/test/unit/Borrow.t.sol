//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Test.sol";
import { LibRLP } from "../../lib/solady/src/utils/LibRLP.sol";
import { Honey } from "../../src/mock/Honey.sol";
import { GAMM } from "../../src/core/GAMM.sol";
import { Borrow } from "../../src/core/Borrow.sol";
import { Porridge } from "../../src/core/Porridge.sol";
import { Goldilend } from "../../src/core/Goldilend.sol";

contract BorrowTest is Test {

  using LibRLP for address;

  Honey honey;
  GAMM gamm;
  Borrow borrow;
  Porridge porridge;

  uint256 borrowAmount = 280e20;

  bytes4 NotAdminSelector = 0x7bfa4b9f;
  bytes4 InsufficientBorrowLimitSelector = 0xda392797;
  bytes4 ExcessiveRepaySelector = 0x7bc3c3ef;

  function setUp() public {
    Porridge porridgeComputed = Porridge(address(this).computeAddress(4));
    Borrow borrowComputed = Borrow(address(this).computeAddress(3));
    Goldilend goldilendComputed = Goldilend(address(this).computeAddress(13));
    honey = new Honey();
    gamm = new GAMM(address(this), address(porridgeComputed), address(borrowComputed), address(honey));
    borrow = new Borrow(address(gamm), address(porridgeComputed), address(honey));
    porridge = new Porridge(address(gamm), address(borrow), address(goldilendComputed), address(this), address(honey));
  }

  modifier dealandStake100Locks() {
    deal(address(gamm), address(this), 100e18);
    gamm.approve(address(porridge), 100e18);
    porridge.stake(100e18);
    _;
  }

  modifier dealGammMaxHoney() {
    deal(address(honey), address(gamm), type(uint256).max);
    _;
  }

  function testBorrowLimit() public dealandStake100Locks dealGammMaxHoney {
    vm.expectRevert(InsufficientBorrowLimitSelector);
    borrow.borrow(borrowAmount + 1);
  }

  function testExcessiveRepay() public dealandStake100Locks dealGammMaxHoney {
    borrow.borrow(borrowAmount);
    vm.expectRevert(ExcessiveRepaySelector);
    borrow.repay(borrowAmount + 1);
  }

  function testBorrowLimitCalculation() public dealandStake100Locks {
    uint256 limit = borrow.borrowLimit(address(this));

    assertEq(limit, borrowAmount);
  }

  function testBorrow() public dealandStake100Locks dealGammMaxHoney{
    borrow.borrow(borrowAmount);

    uint256 gammHoneyBalance = honey.balanceOf(address(gamm));
    uint256 userHoneyBalance = honey.balanceOf(address(this));
    uint256 locked = borrow.getLocked(address(this));
    uint256 borrowed = borrow.getBorrowed(address(this));

    assertEq(gammHoneyBalance, type(uint256).max - borrowAmount);
    assertEq(userHoneyBalance, borrowAmount);
    assertEq(locked, 100e18);
    assertEq(borrowed, borrowAmount);
  }

  function testRepay() public dealandStake100Locks dealGammMaxHoney {
    borrow.borrow(borrowAmount);
    honey.approve(address(borrow), 280e20);
    borrow.repay(borrowAmount);

    uint256 locked = borrow.getLocked(address(this));
    uint256 borrowed = borrow.getBorrowed(address(this));
    uint256 userHoneyBalance = honey.balanceOf(address(this));
    uint256 userStakedLocksBalance = porridge.getStaked(address(this));

    assertEq(locked, 0);
    assertEq(borrowed, 0);
    assertEq(userHoneyBalance, 0);
    assertEq(userStakedLocksBalance, 100e18);
  }

  function testLockedAfterRepay() public dealGammMaxHoney {
    deal(address(gamm), address(this), 696969e18);
    gamm.approve(address(porridge), 696969e18);
    porridge.stake(696969e18);
    borrow.borrow(696969e18);
    honey.approve(address(borrow), type(uint256).max);
    borrow.repay(696969e18);

    uint256 locked = borrow.getLocked(address(this));

    assertEq(locked, 0);
  }

}