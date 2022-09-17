// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Script.sol";
import "../src/LocksToken.sol";


contract LocksTokenScript is Script {

  function run() public {
    vm.startBroadcast();
    LocksToken lockstoken = new LocksToken();
    vm.stopBroadcast();
  }

}