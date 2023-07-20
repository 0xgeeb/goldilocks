//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Test.sol";
import { Honey } from "../src/Honey.sol";
import { GAMM } from "../src/GAMM.sol";
import { Borrow } from "../src/Borrow.sol";
import { Porridge } from "../src/Porridge.sol";

contract PorridgeTest is Test {

  Honey honey;
  GAMM gamm;
  Borrow borrow;
  Porridge porridge;

  uint256 OneDayofYield = 5e17;
  uint256 borrowAmount = 280e20;

  bytes4 NoClaimablePRGSelector = 0x018bb287;
  bytes4 InvalidUnstakeSelector = 0x280cf628;
  bytes4 LocksBorrowedAgainstSelector = 0xad7facc8;

  function setUp() public {
    honey = new Honey();
    gamm = new GAMM(address(honey), address(this));
    borrow = new Borrow(address(gamm), address(honey), address(this));
    porridge = new Porridge(address(gamm), address(borrow), address(honey));

    gamm.setPorridgeAddress(address(porridge));
    gamm.setBorrowAddress(address(borrow));
    borrow.setPorridgeAddress(address(porridge));
  }

  modifier dealandStake100Locks() {
    deal(address(gamm), address(this), 100e18);
    gamm.approve(address(porridge), 100e18);
    porridge.stake(100e18);

    _;
  }

  modifier dealUser280Honey() {
    deal(address(honey), address(this), 280e18);
    honey.approve(address(porridge), 280e18);
    _;
  }

  modifier dealGammMaxHoney() {
    deal(address(honey), address(gamm), type(uint256).max);
    _;
  }

  function testCalculate1DayofYield() public dealandStake100Locks {
    vm.warp(block.timestamp + porridge.DAYS_SECONDS());
    porridge.claim();

    uint256 oneDayofYield = 5e17;
    uint256 prgBalance = porridge.balanceOf(address(this));

    assertEq(prgBalance, oneDayofYield);
  }

  function testStake() public dealandStake100Locks {
    uint256 userBalanceofLocks = gamm.balanceOf(address(this));
    uint256 contractBalance = gamm.balanceOf(address(porridge));
    uint256 getStakedUserBalance = porridge.getStaked(address(this));

    assertEq(userBalanceofLocks, 0);
    assertEq(contractBalance, 100e18);
    assertEq(getStakedUserBalance, 100e18);
  }

  function testUnstake() public dealandStake100Locks {
    vm.warp(block.timestamp + porridge.DAYS_SECONDS());
    porridge.unstake(100e18);

    uint256 userBalanceofLocks = gamm.balanceOf(address(this));
    uint256 contractBalance = gamm.balanceOf(address(porridge));
    uint256 getStakedUserBalance = porridge.getStaked(address(this));
    uint256 prgBalance = porridge.balanceOf(address(this));

    assertEq(userBalanceofLocks, 100e18);
    assertEq(contractBalance, 0);
    assertEq(getStakedUserBalance, 0);
    assertEq(prgBalance, OneDayofYield);
  }

  function testRealize() public dealandStake100Locks dealUser280Honey {
    vm.warp(block.timestamp + (2 * porridge.DAYS_SECONDS()));
    porridge.unstake(100e18);
    porridge.realize(1e18);

    uint256 userBalanceofPrg = porridge.balanceOf(address(this));
    uint256 userBalanceofLocks = gamm.balanceOf(address(this));
    uint256 userBalanceofHoney = honey.balanceOf(address(this));
    uint256 gammBalanceofHoney = honey.balanceOf(address(gamm));

    assertEq(userBalanceofPrg, 0);
    assertEq(userBalanceofLocks, 101e18);
    assertEq(userBalanceofHoney, 0);
    assertEq(gammBalanceofHoney, 280e18);
  }

  function testClaim() public dealandStake100Locks {
    vm.warp(block.timestamp + porridge.DAYS_SECONDS());
    porridge.claim();

    uint256 userBalanceofPrg = porridge.balanceOf(address(this));
    uint256 userStakedLocks = porridge.getStaked(address(this));

    assertEq(userBalanceofPrg, OneDayofYield);
    assertEq(userStakedLocks, 100e18);
  }

  function testNoClaimablePRG() public dealandStake100Locks {
    vm.expectRevert(NoClaimablePRGSelector);
    porridge.claim();
  }

  function testInvalidUnstake() public dealandStake100Locks {
    vm.expectRevert(InvalidUnstakeSelector);
    porridge.unstake(100e18 + 1);
  }

  function testLocksBorrowedAgainst() public dealandStake100Locks dealGammMaxHoney {
    borrow.borrow(borrowAmount);
    vm.expectRevert(LocksBorrowedAgainstSelector);
    porridge.unstake(1);
  }

}