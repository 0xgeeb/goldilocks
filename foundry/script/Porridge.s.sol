// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Script.sol";
import "../src/Porridge.sol";


contract PorridgeScript is Script {

  Porridge porridge;

  function run() public {
    vm.startBroadcast();
    porridge = new Porridge(0xb868Cc77A95a65F42611724AF05Aa2d3B6Ec05F2, 0x3fdc08D815cc4ED3B7F69Ee246716f2C8bCD6b07, 0x70E5370b8981Abc6e14C91F4AcE823954EFC8eA3);
    vm.stopBroadcast();
  }

}