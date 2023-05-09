// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import { Script } from "../lib/forge-std/src/Script.sol";
import { Locks } from "../src/Locks.sol";
import { Porridge } from "../src/Porridge.sol";
import { AMM } from  "../src/AMM.sol";
import { Borrow } from "../src/Borrow.sol";
import { Honey } from "../src/Honey.sol";

contract Deploy01Script is Script {

  Locks locks;
  Porridge porridge;
  AMM amm;
  Borrow borrow;
  Honey honey;
  address admin = 0x50A7dd4778724FbED41aCe9B3d3056a7B36E874C;
  uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

  function run() external {
    vm.startBroadcast(deployerPrivateKey);

    honey = new Honey();
    locks = new Locks(admin);
    amm = new AMM(address(locks), admin);
    borrow = new Borrow(address(amm), address(locks), admin);
    porridge = new Porridge(address(amm), address(locks), address(borrow), admin);

    locks.setAmmAddress(address(amm));
    locks.setPorridgeAddress(address(porridge));
    locks.setHoneyAddress(address(honey));

    porridge.setLocksAddress(address(locks));
    porridge.setHoneyAddress(address(honey));

    amm.setHoneyAddress(address(honey));

    borrow.setHoneyAddress(address(honey));
    borrow.setPorridge(address(porridge));

    porridge.approveBorrowForLocks(address(borrow));

    amm.approveBorrowForHoney(address(borrow));

    honey.mint(address(locks), 1000e18);
    locks.transferToAMM(700000e18, 200000e18);
    
    vm.stopBroadcast();
  }

}