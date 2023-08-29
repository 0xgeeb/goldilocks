// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Script } from "../lib/forge-std/src/Script.sol";
import { Porridge } from "../src/core/Porridge.sol";
import { GAMM } from  "../src/core/GAMM.sol";
import { Borrow } from "../src/core/Borrow.sol";
import { Honey } from "../src/mock/Honey.sol";

contract DeployAlphaScript is Script {

  Porridge porridge;
  GAMM gamm;
  Borrow borrow;
  Honey honey;
  address admin = 0x50A7dd4778724FbED41aCe9B3d3056a7B36E874C;
  uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

  function run() external {
    vm.startBroadcast(deployerPrivateKey);

    honey = new Honey();
    gamm = new GAMM(address(this), address(honey));
    borrow = new Borrow(address(gamm), address(this), address(honey));
    porridge = new Porridge(address(gamm), address(borrow), address(this), address(honey));

    gamm.setPorridgeAddress(address(porridge));
    gamm.setBorrowAddress(address(borrow));
    borrow.setPorridgeAddress(address(porridge));
    
    vm.stopBroadcast();
  }

}