//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Test.sol";
import "../src/PorridgeToken.sol";
import "../src/LocksToken.sol";
import "../src/AMM.sol";
import "../src/Borrow.sol";

contract PorridgeTokenTest is Test {

  PorridgeToken porridgetoken;
  LocksToken lockstoken;
  AMM amm;
  Borrow borrow;
  address jeff = 0xFB38050d2dEF04c1bb5Ff21096d50cD992418be3;

  function setUp() public {
    lockstoken = new LocksToken();
    amm = new AMM(address(lockstoken));
    borrow = new Borrow(address(lockstoken), address(lockstoken), address(lockstoken), address(lockstoken));
    porridgetoken = new PorridgeToken(address(amm), address(lockstoken), address(borrow));
  }

  function testMint() public {
    porridgetoken.mint(msg.sender, 100);
    assertEq(porridgetoken.totalSupply(), 100);
    assertEq(porridgetoken.balanceOf(msg.sender), 100);
  }

  function testBurn() public {
    porridgetoken.mint(msg.sender, 100);
    porridgetoken.burn(msg.sender, 100);
    assertEq(porridgetoken.totalSupply(), 0);
    assertEq(porridgetoken.balanceOf(msg.sender), 0);
  }

  function testCalculateYield() public {
    deal(address(lockstoken), jeff, 100);
    vm.prank(jeff);
    lockstoken.approve(address(porridgetoken), 1000000000);
    vm.prank(jeff);
    porridgetoken.stake(100);
    vm.warp(block.timestamp + 9);
  }




}