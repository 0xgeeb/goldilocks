//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Test.sol";
import "../src/Locks.sol";
import "../src/Porridge.sol";
import "../src/AMM.sol";
import "../src/Borrow.sol";

contract BorrowTest is Test {

  Locks locks;
  Porridge porridge;
  AMM amm;
  Borrow borrow;

  function setUp() public {
    // lockstoken = new LocksToken();
    // amm = new AMM(address(lockstoken));
    // porridgetoken = new PorridgeToken(address(lockstoken));
    // borrow = new Borrow(address(amm), address(lockstoken), address(porridgetoken), address(msg.sender));
  }



}