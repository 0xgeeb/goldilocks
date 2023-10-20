//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Test.sol";
import { Honey } from "../../src/mock/Honey.sol";
import { GAMM } from "../../src/core/GAMM.sol";
import { Borrow } from "../../src/core/Borrow.sol";
import { Porridge } from "../../src/core/Porridge.sol";

contract GAMMInvariantTest is Test { 

  GAMM gamm;
  Honey honey;

  function setUp() public {
    honey = new Honey();
    gamm = new GAMM(address(this), address(honey));
  }
}