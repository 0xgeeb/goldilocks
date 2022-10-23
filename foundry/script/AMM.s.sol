// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Script.sol";
import "../src/AMM.sol";


contract AMMScript is Script {

  IERC20 usdc;
  AMM amm;

  function run() public {
    vm.startBroadcast();
    amm = new AMM(0x2F54D1563963fC04770E85AF819c89Dc807f6a06, 0x2F54D1563963fC04770E85AF819c89Dc807f6a06);
    vm.stopBroadcast();
  }

}