// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Script.sol";
import "../src/LocksToken.sol";


contract LocksTokenScript is Script {

  LocksToken lockstoken;

  function run() public {
    vm.startBroadcast();
    lockstoken = new LocksToken();
    vm.stopBroadcast();
  }

}