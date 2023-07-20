// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import { Script } from "../lib/forge-std/src/Script.sol";
import { Porridge } from "../src/Porridge.sol";
import { GAMM } from  "../src/GAMM.sol";
import { Borrow } from "../src/Borrow.sol";
import { Honey } from "../src/Honey.sol";

contract DeployScript is Script {

  Porridge porridge;
  GAMM gamm;
  Borrow borrow;
  Honey honey;
  address admin = 0x50A7dd4778724FbED41aCe9B3d3056a7B36E874C;
  uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

  function run() external {
    vm.startBroadcast(deployerPrivateKey);

    honey = new Honey();
    gamm = new GAMM(address(honey), admin);
    borrow = new Borrow(address(gamm), address(honey), admin);
    porridge = new Porridge(address(gamm), address(borrow), address(honey));

    gamm.setPorridgeAddress(address(porridge));
    gamm.setBorrowAddress(address(borrow));
    borrow.setPorridgeAddress(address(porridge));
    
    vm.stopBroadcast();
  }

}