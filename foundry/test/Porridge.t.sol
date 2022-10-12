//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Test.sol";
import "../src/Porridge.sol";
import "../src/Locks.sol";
import "../src/AMM.sol";
import "../src/Borrow.sol";

contract PorridgeTest is Test {

  Porridge porridge;
  Locks locks;
  AMM amm;
  Borrow borrow;
  address jeff = 0xFB38050d2dEF04c1bb5Ff21096d50cD992418be3;

  function setUp() public {
    locks = new Locks();
    amm = new AMM(address(locks));
    borrow = new Borrow(address(locks), address(locks), address(locks), address(locks));
    porridge = new Porridge(address(amm), address(locks), address(borrow));
  }

  function testMint() public {
    porridge.mint(msg.sender, 100);
    assertEq(porridge.totalSupply(), 100e18);
    assertEq(porridge.balanceOf(msg.sender), 100e18);
  }

  function testBurn() public {
    porridge.mint(msg.sender, 100);
    porridge.burn(msg.sender, 100);
    assertEq(porridge.totalSupply(), 0);
    assertEq(porridge.balanceOf(msg.sender), 0);
  }

  function testCalculateYield() public {
    deal(address(locks), jeff, 100e18);
    vm.prank(jeff);
    locks.approve(address(porridge), 100e18);
    vm.prank(jeff);
    porridge.stake(100);
    vm.warp(block.timestamp + 9);
  }




}