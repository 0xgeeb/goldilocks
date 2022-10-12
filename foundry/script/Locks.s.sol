// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Script.sol";
import "../src/Locks.sol";


contract LocksScript is Script {

  Locks locks;

  function run() public {
    vm.startBroadcast();
    locks = new Locks();
    vm.stopBroadcast();
  }

}