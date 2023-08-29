//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Test.sol";
import { Honey } from "../src/mock/Honey.sol";
import { GAMM } from "../src/core/GAMM.sol";
import { Borrow } from "../src/core/Borrow.sol";
import { Porridge } from "../src/core/Porridge.sol";

contract GAMMGasTest is Test {

  Honey honey;
  GAMM gamm;
  Borrow borrow;
  Porridge porridge;

  uint256 txAmount = 10e18;
  uint256 mediumTxAmount = 100e18;
  uint256 largeTxAmount = 1000e18;

  function setUp() public {
    honey = new Honey();
    gamm = new GAMM(address(this), address(honey));
    borrow = new Borrow(address(gamm), address(this), address(honey));
    porridge = new Porridge(address(gamm), address(borrow), address(this), address(honey));

    gamm.setPorridgeAddress(address(porridge));
    gamm.setBorrowAddress(address(borrow));
    borrow.setPorridgeAddress(address(porridge));
  }

  modifier dealandApproveUserHoney() {
    deal(address(honey), address(this), type(uint256).max / 2);
    honey.approve(address(gamm), type(uint256).max);
    _;
  }

  modifier dealUserLocks() {
    deal(address(gamm), address(this), type(uint256).max / 2);
    _;
  }

  modifier dealGammHoney() {
    deal(address(honey), address(gamm), type(uint256).max / 2);
    _;
  }

  function test10Buy() public dealandApproveUserHoney {
    gamm.buy(txAmount, type(uint256).max);
  }

  function test100Buy() public dealandApproveUserHoney {
    gamm.buy(mediumTxAmount, type(uint256).max);
  }

  function test1000Buy() public dealandApproveUserHoney {
    gamm.buy(largeTxAmount, type(uint256).max);
  }

  // 10buy -    114349   | cost - 5641049601535046139648

  // 100buy -   297769   | cost - 57852097809804339185412

  // 1000buy -  2120343  | cost - 935738532191833460868212

  // 7   / 5641   = 0.001240915
  // 18  / 57852  = 0.000311139
  // 132 / 935738 = 0.000141065

}