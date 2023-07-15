//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Test.sol";
import { Honey } from "../src/test/Honey.sol";
import { GAMM } from "../src/GAMM.sol";
import { Borrow } from "../src/Borrow.sol";
import { Porridge } from "../src/Porridge.sol";

contract BorrowTest is Test {

  Honey honey;
  GAMM gamm;
  Borrow borrow;
  Porridge porridge;

  bytes4 InsufficientBorrowLimitSelector = 0xda392797;

  function setUp() public {
    honey = new Honey();
    gamm = new GAMM(address(honey), address(this));
    borrow = new Borrow(address(gamm), address(honey), address(this));
    porridge = new Porridge(address(gamm), address(borrow), address(honey), address(this));

    gamm.setPorridgeAddress(address(porridge));
    gamm.setBorrowAddress(address(borrow));
    borrow.setPorridgeAddress(address(porridge));
  }

  modifier dealGammMaxHoney() {
    deal(address(honey), address(gamm), type(uint256).max);
    _;
  }

    modifier dealandStake100Locks() {
    deal(address(gamm), address(this), 100e18);
    gamm.approve(address(porridge), 100e18);
    porridge.stake(100e18);
    _;
  }

  function testBorrowLimit() public dealandStake100Locks {
    uint256 limit = borrow.borrowLimit(address(this));
    uint256 expectedLimit = 280e20;

    assertEq(limit, expectedLimit);
  }

  function testBorrow() public dealandStake100Locks dealGammMaxHoney{
    borrow.borrow(280e20);

    uint256 borrowAmount = 280e20;
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
    borrow.borrow(280e20);
    borrow.repay(280e20);


    // assertEq();
  }

function testBorrowLimitRevert() public dealandStake100Locks dealGammMaxHoney {
    vm.expectRevert(InsufficientBorrowLimitSelector);
    borrow.borrow(280e20 + 1);
  }

//   function testRepay() public {

//     borrow.borrow(borrowAmount);
//     borrow.repay(borrowAmount);
//     assertEq(borrow.getLocked(address(this)), 0);
//     assertEq(borrow.getBorrowed(address(this)), 0);
//   }

//   function testOverRepay() public {
//     porridge.stake(50e18);
//     uint256 floorPrice = gamm.floorPrice();
//     uint256 borrowAmount = (50e18 * floorPrice) / 1e18;
//     borrow.borrow(borrowAmount);
//     vm.expectRevert(bytes("repaying too much"));
//     borrow.repay(borrowAmount + 1e18);
//   }

//   function testCustomAllow() public {
//     uint256 beforeAllowance = honey.allowance(address(gamm), address(borrow));
//     console.log(beforeAllowance);
//     vm.prank(address(gamm));
//     honey.approve(address(borrow), 69);
//     uint256 afterAllowance = honey.allowance(address(gamm), address(borrow));
//     console.log(afterAllowance);
//     vm.prank(address(borrow));
//     honey.transferFrom(address(gamm), address(this), 10);
//   }

}