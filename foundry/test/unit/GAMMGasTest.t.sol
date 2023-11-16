//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Test.sol";
import { LibRLP } from "../../lib/solady/src/utils/LibRLP.sol";
import { Honey } from "../../src/mock/Honey.sol";
import { GAMM } from "../../src/core/GAMM.sol";
import { Borrow } from "../../src/core/Borrow.sol";
import { Porridge } from "../../src/core/Porridge.sol";
import { Goldilend } from "../../src/core/Goldilend.sol";
import { LGE } from "../../src/governance/LGE.sol";

contract GAMMGasTest is Test {

  using LibRLP for address;

  Honey honey;
  GAMM gamm;
  Borrow borrow;
  Porridge porridge;

  uint256 txAmount = 10e18;
  uint256 mediumTxAmount = 100e18;
  uint256 largeTxAmount = 1000e18;

  function setUp() public {
    Porridge porridgeComputed = Porridge(address(this).computeAddress(4));
    Borrow borrowComputed = Borrow(address(this).computeAddress(3));
    Goldilend goldilendComputed = Goldilend(address(this).computeAddress(11));
    LGE lgeComputed = LGE(address(this).computeAddress(4));
    honey = new Honey();
    gamm = new GAMM(address(this), address(porridgeComputed), address(borrowComputed), address(lgeComputed), address(honey));
    borrow = new Borrow(address(gamm), address(porridgeComputed), address(honey));
    porridge = new Porridge(address(gamm), address(borrow), address(goldilendComputed), address(honey));
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