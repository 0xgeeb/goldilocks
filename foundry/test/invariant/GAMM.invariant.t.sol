//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Test.sol";
import { LibRLP } from "../../lib/solady/src/utils/LibRLP.sol";
import { Honey } from "../../src/mock/Honey.sol";
import { Porridge } from "../../src/core/Porridge.sol";
import { Borrow } from "../../src/core/Borrow.sol";
import { GAMM } from "../../src/core/GAMM.sol";

contract GAMMInvariantTest is Test { 

  using LibRLP for address;

  Honey honey;
  GAMM gamm;

  function setUp() public {
    Porridge porridgeComputed = Porridge(address(this).computeAddress(2));
    Borrow borrowComputed = Borrow(address(this).computeAddress(3));
    honey = new Honey();
    gamm = new GAMM(address(this), address(porridgeComputed), address(borrowComputed), address(honey));
  }
}