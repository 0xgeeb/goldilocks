// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Script.sol";
import "../src/Locks.sol";
import "../src/Porridge.sol";
import "../src/AMM.sol";
import "../src/Borrow.sol";
import "../src/TestHoney.sol";

contract Deploy01Script is Script {

  Locks locks;
  Porridge porridge;
  AMM amm;
  Borrow borrow;
  TestHoney testhoney;
  address admin = 0x50A7dd4778724FbED41aCe9B3d3056a7B36E874C;
  uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

  function run() external {
    vm.startBroadcast(deployerPrivateKey);

    testhoney = new TestHoney();

    locks = new Locks(admin);
    locks.setHoneyAddress(address(testhoney));

    amm = new AMM(address(locks), admin);
    amm.setHoneyAddress(address(testhoney));

    borrow = new Borrow(address(amm), address(locks), admin);
    borrow.setHoneyAddress(address(testhoney));

    porridge = new Porridge(address(amm), address(locks), address(borrow), admin);
    porridge.setLocksAddress(address(locks));
    porridge.setHoneyAddress(address(testhoney));

    borrow.setPorridge(address(porridge));

    locks.setAmmAddress(address(amm));
    locks.setPorridgeAddress(address(porridge));

    testhoney.mint(address(locks), 1000e18);
    locks.transferToAMM(700000e18, 200000e18);
    
    vm.stopBroadcast();
  }

}