//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Test.sol";
import "../src/LocksToken.sol";

contract LocksTokenTest is Test {

  LocksToken lockstoken;

  function setUp() public {
    lockstoken = new LocksToken();
  }

  function testHardCap() public {
    assertEq(lockstoken.getHardCap(), 1000000e18);
  }

  function testMint() public {
    lockstoken.mint(msg.sender, 100);
    assertEq(lockstoken.totalSupply(), 100e18);
    assertEq(lockstoken.balanceOf(msg.sender), 100e18);
  }

  function testBurn() public {
    lockstoken.mint(msg.sender, 100);
    lockstoken.burn(msg.sender, 100);
    assertEq(lockstoken.totalSupply(), 0);
    assertEq(lockstoken.balanceOf(msg.sender), 0);
  }

}