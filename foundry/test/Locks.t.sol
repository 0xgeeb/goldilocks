//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Test.sol";
import "../src/Locks.sol";

contract LocksTest is Test {

  Locks locks;

  function setUp() public {
    locks = new Locks();
  }

  function testHardCap() public {
    assertEq(locks.hardCap(), 1000000e18);
  }

  function testMint() public {
    locks.mint(msg.sender, 100);
    assertEq(locks.totalSupply(), 100e18);
    assertEq(locks.balanceOf(msg.sender), 100e18);
  }

  function testBurn() public {
    locks.mint(msg.sender, 100);
    locks.burn(msg.sender, 100);
    assertEq(locks.totalSupply(), 0);
    assertEq(locks.balanceOf(msg.sender), 0);
  }

}