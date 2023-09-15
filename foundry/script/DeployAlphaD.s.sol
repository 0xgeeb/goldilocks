// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Script } from "../lib/forge-std/src/Script.sol";
import { LibRLP } from "../lib/solady/src/utils/LibRLP.sol";
import { Porridge } from "../src/core/Porridge.sol";
import { GAMM } from  "../src/core/GAMM.sol";
import { Borrow } from "../src/core/Borrow.sol";
import { Honey } from "../src/mock/Honey.sol";

contract DeployDScript is Script {

  Porridge porridge;
  GAMM gamm;
  Borrow borrow;
  Honey honey;
  // address admin = 0x50A7dd4778724FbED41aCe9B3d3056a7B36E874C;
  address admin = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
  uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

  function run() external {
    vm.startBroadcast(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80);

    honey = new Honey();
    gamm = new GAMM(address(admin), address(honey));
    borrow = new Borrow(address(gamm), address(admin), address(honey));
    porridge = new Porridge(address(gamm), address(borrow), address(admin), address(honey));

    gamm.setPorridgeAddress(address(porridge));
    gamm.setBorrowAddress(address(borrow));
    borrow.setPorridgeAddress(address(porridge));
    
    vm.stopBroadcast();
  }

}