//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { Test } from "../lib/forge-std/src/Test.sol";
import { Locks } from "../src/Locks.sol";
import { AMM } from "../src/AMM.sol";
import { TestHoney } from "../src/TestHoney.sol";

contract LocksTest is Test {

  Locks locks;
  AMM amm;
  TestHoney testhoney;

  function setUp() public {
    locks = new Locks(address(this));
    amm = new AMM(address(locks), address(this));
    testhoney = new TestHoney();
    locks.setAmmAddress(address(amm));
    locks.setHoneyAddress(address(testhoney));
  }

  function testHardCap() public {
    vm.expectRevert(bytes("hardcap hit"));
    locks.contribute(1000001e18);
  }

  function testMint() public {
    locks.setAmmAddress(address(amm));
    vm.prank(address(amm));
    locks.ammMint(msg.sender, 100e18);
    assertEq(locks.totalSupply(), 100e18);
    assertEq(locks.balanceOf(msg.sender), 100e18);
  }

  function testBurn() public {
    locks.setAmmAddress(address(amm));
    vm.prank(address(amm));
    locks.ammMint(msg.sender, 100e18);
    vm.prank(address(amm));
    locks.ammBurn(msg.sender, 100e18);
    assertEq(locks.totalSupply(), 0);
    assertEq(locks.balanceOf(msg.sender), 0);
  }

  function testOnlyAdmin() public {
    vm.expectRevert(bytes("not admin"));
    vm.prank(address(testhoney));
    locks.setPorridgeAddress(address(this));
  }

  function testOnlyAMM() public {
    vm.expectRevert(bytes("not amm"));
    locks.ammMint(msg.sender, 100e18);
  }

  function testTransferToAMM() public {
    deal(address(testhoney), address(locks), 1000000e18, true);
    locks.setAmmAddress(address(amm));
    locks.transferToAMM(1600000e18, 400000e18);
    assertEq(testhoney.balanceOf(address(amm)), 1000000e18);
    assertEq(testhoney.balanceOf(address(locks)), 0);
    assertEq(amm.fsl(), 1600000e18);
    assertEq(amm.psl(), 400000e18);
  }

}