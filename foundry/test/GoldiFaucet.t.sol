//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Test.sol";
import { GoldiFaucet } from "../src/mock/GoldiFaucet.sol";

contract GoldiFaucetTest is Test {

  GoldiFaucet faucet;

  function setUp() public {
    faucet = new GoldiFaucet();
    vm.warp(2 days);
    deal(address(faucet), 1 ether);
  }

  function testDrip() public {
    faucet.drip();
  }

  function testDripTooQuick() public {
    faucet.drip();
    vm.warp(1 days / 2);
    vm.expectRevert();
    faucet.drip();
  }

  receive() external payable {}
}