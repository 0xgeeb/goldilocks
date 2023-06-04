// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import { Script } from "../lib/forge-std/src/Script.sol";
import { Porridge } from "../src/Porridge.sol";
import { AMM } from  "../src/GAMM.sol";
import { Borrow } from "../src/Borrow.sol";
import { Honey } from "../src/test/Honey.sol";

contract Deploy01Script is Script {

  Porridge porridge;
  AMM amm;
  Borrow borrow;
  Honey honey;
  address admin = 0x50A7dd4778724FbED41aCe9B3d3056a7B36E874C;
  uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

  function run() external {
    vm.startBroadcast(deployerPrivateKey);

    honey = new Honey();
    amm = new AMM(admin);
    borrow = new Borrow(address(amm), admin);
    porridge = new Porridge(address(amm), address(borrow), admin);

    porridge.setHoneyAddress(address(honey));

    amm.setHoneyAddress(address(honey));
    amm.setPorridgeAddress(address(porridge));

    borrow.setHoneyAddress(address(honey));
    borrow.setPorridge(address(porridge));

    porridge.approveBorrowForLocks(address(borrow));

    amm.approveBorrowForHoney(address(borrow));
    
    vm.stopBroadcast();
  }

}