// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../../lib/forge-std/src/Script.sol";
import "../../src/test/testAMM.sol";


contract testAMMScript is Script {

  testAMM testamm;

  function run() public {
    vm.startBroadcast();
    testamm = new testAMM();
    vm.stopBroadcast();
  }

}