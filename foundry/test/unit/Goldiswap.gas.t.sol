//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Test.sol";
import { LibRLP } from "../../lib/solady/src/utils/LibRLP.sol";
import { Honey } from "../../src/mock/Honey.sol";
import { Goldiswap } from "../../src/core/Goldiswap.sol";
import { Borrow } from "../../src/core/Borrow.sol";
import { Porridge } from "../../src/core/Porridge.sol";
import { Goldilend } from "../../src/core/Goldilend.sol";

contract GAMMGasTest is Test {

  using LibRLP for address;

  Honey honey;
  Goldiswap goldiswap;
  Borrow borrow;
  Porridge porridge;

  uint256 txAmount = 10e18;
  uint256 mediumTxAmount = 100e18;
  uint256 largeTxAmount = 1000e18;

  uint256 gas10Buy = 10e18;
  uint256 gas100Buy = 10e18;
  uint256 gas1000Buy = 10e18;

  function setUp() public {
    Porridge porridgeComputed = Porridge(address(this).computeAddress(4));
    Borrow borrowComputed = Borrow(address(this).computeAddress(3));
    Goldilend goldilendComputed = Goldilend(address(this).computeAddress(11));
    honey = new Honey();
    goldiswap = new Goldiswap(address(this), address(porridgeComputed), address(borrowComputed), address(honey));
    borrow = new Borrow(address(goldiswap), address(porridgeComputed), address(honey));
    porridge = new Porridge(address(goldiswap), address(borrow), address(goldilendComputed), address(honey));
  }

  modifier dealandApproveUserHoney() {
    deal(address(honey), address(this), type(uint256).max / 2);
    honey.approve(address(goldiswap), type(uint256).max);
    _;
  }

  modifier dealUserLocks() {
    deal(address(goldiswap), address(this), type(uint256).max / 2);
    _;
  }

  modifier dealGammHoney() {
    deal(address(honey), address(goldiswap), type(uint256).max / 2);
    _;
  }

  // gasused = 119360, actual = 114264
  function test10Buy() public dealandApproveUserHoney {
    uint256 gasStart = gasleft();
    goldiswap.buy(txAmount, type(uint256).max);
    uint256 gasEnd = gasleft();
    uint256 gasUsed = gasStart   - gasEnd;
    assert(gasUsed <= 119360);
  }

  // gasused = 301430, actual = 296334
  function test100Buy() public dealandApproveUserHoney {
    uint256 gasStart = gasleft();
    goldiswap.buy(mediumTxAmount, type(uint256).max);
    uint256 gasEnd = gasleft();
    uint256 gasUsed = gasStart - gasEnd;
    assert(gasUsed <= 310430);
  }

  // gasused = 2110494, actual = 2105398
  function test1000Buy() public dealandApproveUserHoney {
    uint256 gasStart = gasleft();
    goldiswap.buy(largeTxAmount, type(uint256).max);
    uint256 gasEnd = gasleft();
    uint256 gasUsed = gasStart - gasEnd;
    assert(gasUsed <= 2110494);
  }

  // 10buy -    114264   | cost - 5641049601535046139648

  // 100buy -   296334   | cost - 57852097809804339185412

  // 1000buy -  2105398  | cost - 935738532191833460868212

  // 7   / 5641   = 0.001240915
  // 18  / 57852  = 0.000311139
  // 132 / 935738 = 0.000141065


  // gasused = 128109, actual = 122898
  function testnew10000Buy() public dealandApproveUserHoney {
    uint256 gasStart = gasleft();
    goldiswap.buy(txAmount*1000, type(uint256).max);
    uint256 gasEnd = gasleft();
    uint256 gasUsed = gasStart   - gasEnd;
    console.log(gasUsed);
    assert(gasUsed <= 128109);
  }

  // gasused = 323893, actual = 318682
  function testnew100000Buy() public dealandApproveUserHoney {
    uint256 gasStart = gasleft();
    goldiswap.buy(mediumTxAmount*1000, type(uint256).max);
    uint256 gasEnd = gasleft();
    uint256 gasUsed = gasStart - gasEnd;
    console.log(gasUsed);
    assert(gasUsed <= 323893);
  }

  // gasused = 2268989, actual = 2263778
  function testnew1000000Buy() public dealandApproveUserHoney {
    uint256 gasStart = gasleft();
    goldiswap.buy(largeTxAmount*1000, type(uint256).max);
    uint256 gasEnd = gasleft();
    uint256 gasUsed = gasStart - gasEnd;
    console.log(gasUsed);
    assert(gasUsed <= 2268989);
  }

}