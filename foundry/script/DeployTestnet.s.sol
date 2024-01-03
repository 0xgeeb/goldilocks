// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Script } from "../lib/forge-std/src/Script.sol";
import { HoneyComb } from "../src/mock/HoneyComb.sol";

contract DeployTestnetScript is Script {

  HoneyComb honeycomb;
  uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

  function run() external {
    vm.startBroadcast(deployerPrivateKey);

    honeycomb = new HoneyComb();
   
    vm.stopBroadcast();
  }

}