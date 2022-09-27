// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Script.sol";
import "../src/SLP.sol";


contract SLPScript is Script {

  SLP slp;

  function run() public {
    vm.startBroadcast();
    slp = new SLP(0x8E45C0936fa1a65bDaD3222bEFeC6a03C83372cE);
    vm.stopBroadcast();
  }

}