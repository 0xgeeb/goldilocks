//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Test.sol";
import { Porridge } from "../src/Porridge.sol";
import { GAMM } from "../src/GAMM.sol";
import { Borrow } from "../src/Borrow.sol";
import { Honey } from "../src/test/Honey.sol";

contract BorrowTest is Test {

  Porridge porridge;
  GAMM gamm;
  Borrow borrow;
  Honey honey;

  function setUp() public {
    honey = new Honey();
    gamm = new GAMM(address(this));
    borrow = new Borrow(address(gamm), address(this));
    porridge = new Porridge(address(gamm), address(borrow), address(this));
    porridge.setHoneyAddress(address(honey));
    gamm.setHoneyAddress(address(honey));
    gamm.setPorridgeAddress(address(porridge));
    borrow.setHoneyAddress(address(honey));
    borrow.setPorridge(address(porridge));
    gamm.approveBorrowForHoney(address(borrow));
    deal(address(honey), address(this), 1000000e18, true);
    honey.approve(address(borrow), 1000000e18);
    vm.store(address(gamm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
  }

  function testBorrow() public {
    porridge.stake(50e18);
    uint256 floorPrice = gamm.floorPrice();
    uint256 borrowAmount = (50e18 * floorPrice) / 1e18;
    uint256 result = borrow.borrow(borrowAmount);
    uint256 fee = (borrowAmount / 100) * 3;
    assertEq(result, borrowAmount - fee);
  }

function testBorrowLimit() public {
    porridge.stake(50e18);
    uint256 floorPrice = gamm.floorPrice();
    uint256 borrowAmount = (50e18 * floorPrice) / 1e18;
    vm.expectRevert(bytes("insufficient borrow limit"));
    borrow.borrow(borrowAmount + 1e18);
  }

  function testRepay() public {
    porridge.stake(50e18);
    uint256 floorPrice = gamm.floorPrice();
    uint256 borrowAmount = (50e18 * floorPrice) / 1e18;
    borrow.borrow(borrowAmount);
    borrow.repay(borrowAmount);
    assertEq(borrow.getLocked(address(this)), 0);
    assertEq(borrow.getBorrowed(address(this)), 0);
  }

  function testOverRepay() public {
    porridge.stake(50e18);
    uint256 floorPrice = gamm.floorPrice();
    uint256 borrowAmount = (50e18 * floorPrice) / 1e18;
    borrow.borrow(borrowAmount);
    vm.expectRevert(bytes("repaying too much"));
    borrow.repay(borrowAmount + 1e18);
  }

}