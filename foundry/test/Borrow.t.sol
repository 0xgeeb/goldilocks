//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../lib/forge-std/src/Test.sol";
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
    locks.setAmmAddress(address(amm));
    locks.setPorridgeAddress(address(porridge));
    locks.setHoneyAddress(address(testhoney));
    porridge.setLocksAddress(address(locks));
    porridge.setHoneyAddress(address(testhoney));
    amm.setHoneyAddress(address(testhoney));
    borrow.setHoneyAddress(address(testhoney));
    borrow.setPorridge(address(porridge));
    porridge.approveBorrowForLocks(address(borrow));
    amm.approveBorrowForHoney(address(borrow));
    testhoney.mint(address(locks), 1000000e18);
    locks.transferToAMM(700000e18, 200000e18);
    deal(address(testhoney), address(this), 1000000e18, true);
    deal(address(locks), address(this), 1000000e18, true);
    locks.approve(address(porridge), 1000000e18);
    testhoney.approve(address(borrow), 1000000e18);
    vm.store(address(amm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
  }

  function testBorrow() public {
    porridge.stake(50e18);
    uint256 floorPrice = amm.floorPrice();
    uint256 borrowAmount = (50e18 * floorPrice) / 1e18;
    uint256 result = borrow.borrow(borrowAmount);
    uint256 fee = (borrowAmount / 100) * 3;
    assertEq(result, borrowAmount - fee);
  }

function testBorrowLimit() public {
    porridge.stake(50e18);
    uint256 floorPrice = amm.floorPrice();
    uint256 borrowAmount = (50e18 * floorPrice) / 1e18;
    vm.expectRevert(bytes("insufficient borrow limit"));
    borrow.borrow(borrowAmount + 1e18);
  }

  function testRepay() public {
    porridge.stake(50e18);
    uint256 floorPrice = amm.floorPrice();
    uint256 borrowAmount = (50e18 * floorPrice) / 1e18;
    borrow.borrow(borrowAmount);
    borrow.repay(borrowAmount);
    assertEq(borrow.getLocked(address(this)), 0);
    assertEq(borrow.getBorrowed(address(this)), 0);
  }

  function testOverRepay() public {
    porridge.stake(50e18);
    uint256 floorPrice = amm.floorPrice();
    uint256 borrowAmount = (50e18 * floorPrice) / 1e18;
    borrow.borrow(borrowAmount);
    vm.expectRevert(bytes("repaying too much"));
    borrow.repay(borrowAmount + 1e18);
  }

}