// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Script.sol";
import "../src/PorridgeToken.sol";


contract PorridgeTokenScript is Script {

  function run() public {
    vm.startBroadcast();
    PorridgeToken porridgetoken = new PorridgeToken(0xb868Cc77A95a65F42611724AF05Aa2d3B6Ec05F2, 0x3fdc08D815cc4ED3B7F69Ee246716f2C8bCD6b07);
    vm.stopBroadcast();
  }

}