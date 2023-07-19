//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Test.sol";
import { Honey } from "../src/Honey.sol";
import { GAMM } from "../src/GAMM.sol";
import { Borrow } from "../src/Borrow.sol";
import { Porridge } from "../src/Porridge.sol";

contract GAMMGasTest is Test {

  Honey honey;
  GAMM gamm;
  Borrow borrow;
  Porridge porridge;

  function setUp() public {
    honey = new Honey();
    gamm = new GAMM(address(honey), address(this));
    borrow = new Borrow(address(gamm), address(honey), address(this));
    porridge = new Porridge(address(gamm), address(borrow), address(honey));

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

  function test1Buy() public {
    gamm.buy(1e18, type(uint256).max);
  }
  
  function test5Buy() public {
    gamm.buy(5e18, type(uint256).max);
  }
  
  function test10Buy() public {
    gamm.buy(10e18, type(uint256).max);
  }
  
  function test25Buy() public {
    gamm.buy(25e18, type(uint256).max);
  }
  
  function test50Buy() public {
    gamm.buy(50e18, type(uint256).max);
  }
  
  function test100Buy() public {
    gamm.buy(100e18, type(uint256).max);
  }
  
  function test500Buy() public {
    gamm.buy(500e18, type(uint256).max);
  }
  
  function test1000Buy() public {
    gamm.buy(1000e18, type(uint256).max);
  }

}