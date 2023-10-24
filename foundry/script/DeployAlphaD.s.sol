// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Script } from "../lib/forge-std/src/Script.sol";
import { LibRLP } from "../lib/solady/src/utils/LibRLP.sol";
import { Porridge } from "../src/core/Porridge.sol";
import { GAMM } from  "../src/core/GAMM.sol";
import { Borrow } from "../src/core/Borrow.sol";
import { Honey } from "../src/mock/Honey.sol";
import { Goldilend } from "../src/core/Goldilend.sol";

contract DeployDScript is Script {

  using LibRLP for address;

  Porridge porridge;
  GAMM gamm;
  Borrow borrow;
  Honey honey;
  address admin = 0x50A7dd4778724FbED41aCe9B3d3056a7B36E874C;
  uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

  function run() external {
    vm.startBroadcast(deployerPrivateKey);

    Porridge porridgeComputed = Porridge(address(this).computeAddress(4));
    Borrow borrowComputed = Borrow(address(this).computeAddress(3));
    Goldilend goldilendComputed = Goldilend(address(this).computeAddress(69));

    honey = new Honey();
    gamm = new GAMM(address(admin), address(porridgeComputed), address(borrowComputed), address(honey));
    borrow = new Borrow(address(gamm), address(porridgeComputed), address(honey));
    porridge = new Porridge(address(gamm), address(borrow), address(goldilendComputed), address(admin), address(honey));
    
    vm.stopBroadcast();
  }

}