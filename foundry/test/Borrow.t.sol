//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { Test } from "../lib/forge-std/src/Test.sol";
import { Locks } from "../src/Locks.sol";
import { Porridge } from "../src/Porridge.sol";
import { AMM } from "../src/AMM.sol";
import { Borrow } from "../src/Borrow.sol";
import { TestHoney } from "../src/TestHoney.sol";

contract BorrowTest is Test {

  Locks locks;
  Porridge porridge;
  AMM amm;
  Borrow borrow;
  TestHoney testhoney;

  function setUp() public {
    testhoney = new TestHoney();
    locks = new Locks(address(this));
    amm = new AMM(address(locks), address(this));
    borrow = new Borrow(address(amm), address(locks), address(this));
    porridge = new Porridge(address(amm), address(locks), address(borrow), address(this));
    porridge.setLocksAddress(address(locks));
    borrow.setPorridge(address(porridge));
    locks.setAmmAddress(address(amm));
    locks.setPorridgeAddress(address(porridge));
    locks.setHoneyAddress(address(testhoney));
    porridge.setHoneyAddress(address(testhoney));
    deal(address(testhoney), address(this), 1000000e18, true);
    deal(address(locks), address(this), 1000000e18, true);
    deal(address(testhoney), address(locks), 1000000e18, true);
    locks.setAmmAddress(address(amm));
    locks.transferToAMM(1600000e18, 400000e18);
    vm.store(address(amm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
  }

  function testBorrow() public {
    locks.approve(address(porridge), 1000e18);
    porridge.stake(1000e18);
    vm.prank(address(porridge));
    locks.approve(address(borrow), 100e18);
    vm.prank(address(amm));
    testhoney.approve(address(borrow), 100e18);
    uint256 result = borrow.borrow(5e18);
    assertEq(result, 4850000);
  }

function testLimitBorrow() public {
    locks.approve(address(porridge), 1000000e18);
    porridge.stake(1000e18);
    vm.expectRevert(bytes("insufficient borrow limit"));
    borrow.borrow(9000e18);
  }

  function testRepay() public {
    locks.approve(address(porridge), 1000e18);
    porridge.stake(1000e18);
    vm.prank(address(porridge));
    locks.approve(address(borrow), 100000e18);
    vm.prank(address(amm));
    testhoney.approve(address(borrow), 100e18);
    borrow.borrow(8e18);
    testhoney.approve(address(borrow), 1000e18);
    locks.approve(address(borrow), 1000e18);
    borrow.repay(8e18);
    
  }

  function testOverRepay() public {
    locks.approve(address(porridge), 1000e18);
    porridge.stake(1000e18);
    vm.prank(address(porridge));
    locks.approve(address(borrow), 100000e18);
    vm.prank(address(amm));
    testhoney.approve(address(borrow), 100e18);
    borrow.borrow(8e18);
    testhoney.approve(address(borrow), 100e18);
    locks.approve(address(borrow), 100e18);
    vm.expectRevert(bytes("repaying too much"));
    borrow.repay(8000002000000000000);
  }

}