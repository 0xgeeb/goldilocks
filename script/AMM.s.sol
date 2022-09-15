// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Script.sol";
import "../src/AMM.sol";


contract AMMScript is Script {

  IERC20 usdc;

  function run() public {
    vm.startBroadcast();
    AMM amm = new AMM(0x3fdc08D815cc4ED3B7F69Ee246716f2C8bCD6b07, 0x286B8DecD5ED79c962b2d8F4346CD97FF0E2C352, 0x70E5370b8981Abc6e14C91F4AcE823954EFC8eA3, 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);
    vm.stopBroadcast();
  }

}