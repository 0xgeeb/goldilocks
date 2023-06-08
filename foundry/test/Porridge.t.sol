//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "../lib/forge-std/src/Test.sol";
import { Porridge } from "../src/Porridge.sol";
import { GAMM } from "../src/GAMM.sol";
import { Borrow } from "../src/Borrow.sol";
import { Honey } from "../src/test/Honey.sol";

contract PorridgeTest is Test {

  Porridge porridge;
  GAMM gamm;
  Borrow borrow;
  Honey honey;

  function setUp() public {
    honey = new Honey();
    gamm = new GAMM(address(this));
    borrow = new Borrow(address(gamm), address(this));
    porridge = new Porridge(address(gamm), address(borrow), address(this));
    borrow.setPorridge(address(porridge));
    porridge.setHoneyAddress(address(honey));
  }

  // function testCalculateYield() public {
  //   porridge.setLocksAddress(address(locks));
  //   deal(address(locks), address(this), 100e18);
  //   locks.approve(address(porridge), 100e18);
  //   porridge.stake(100e18);
  //   vm.warp(block.timestamp + 86400);
  //   uint256 result = porridge.claim();
  //   assertEq(result, 5e17);
  // }

  // function testUnstake() public {
  //   porridge.setLocksAddress(address(locks));
  //   deal(address(locks), address(this), 100e18);
  //   locks.approve(address(porridge), 100e18);
  //   porridge.stake(100e18);
  //   vm.warp(block.timestamp + 129600);
  //   porridge.unstake(100e18);
  //   assertEq(porridge.balanceOf(address(this)), 75e16);
  // }

  // function testRealize() public {
  //   deal(address(honey), address(this), 1000000e18, true);
  //   deal(address(honey), address(locks), 1000000e18, true);
  //   deal(address(porridge), address(this), 1000000e18, true);
  //   locks.transferToAMM(1600000e18, 400000e18);
  //   honey.approve(address(porridge), 1600000000e18);
  //   porridge.realize(10e18);
  //   assertEq(locks.balanceOf(address(this)), 10e18);
  // }

}