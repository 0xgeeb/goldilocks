// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Script.sol";
import "../src/Locks.sol";


contract LocksScript is Script {

  Locks locks;
  address admin = 0xFB38050d2dEF04c1bb5Ff21096d50cD992418be3;

  function run() public {
    vm.startBroadcast();
    locks = new Locks(admin);
    vm.stopBroadcast();
  }

}