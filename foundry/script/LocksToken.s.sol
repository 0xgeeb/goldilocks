// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Script.sol";
import "../src/LocksToken.sol";


contract LocksTokenScript is Script {

  function run() public {
    vm.startBroadcast();
    LocksToken lockstoken = new LocksToken(0xb868Cc77A95a65F42611724AF05Aa2d3B6Ec05F2, 0x286B8DecD5ED79c962b2d8F4346CD97FF0E2C352);
    vm.stopBroadcast();
  }

}