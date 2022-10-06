// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Script.sol";
import "../src/Borrow.sol";


contract BorrowScript is Script {

  //use other contract objects and address(contract object) in new Borrow line duh

  Borrow borrow;

  function run() public {
    vm.startBroadcast();
    borrow = new Borrow(0xb868Cc77A95a65F42611724AF05Aa2d3B6Ec05F2, 0x3fdc08D815cc4ED3B7F69Ee246716f2C8bCD6b07, 0x286B8DecD5ED79c962b2d8F4346CD97FF0E2C352, 0xcBf203F2ee13702Ec41404856f75357e0872484e);
    vm.stopBroadcast();
  }

}