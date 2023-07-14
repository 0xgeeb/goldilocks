//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Test.sol";
import { Honey } from "../src/test/Honey.sol";
import { GAMM } from "../src/GAMM.sol";
import { Borrow } from "../src/Borrow.sol";
import { Porridge } from "../src/Porridge.sol";

contract BorrowTest is Test {

  Honey honey;
  GAMM gamm;
  Borrow borrow;
  Porridge porridge;

  function setUp() public {
    honey = new Honey();
    gamm = new GAMM(address(honey), address(this));
    borrow = new Borrow(address(gamm), address(honey), address(this));
    porridge = new Porridge(address(gamm), address(borrow), address(honey), address(this));

    gamm.setPorridgeAddress(address(porridge));
    borrow.setPorridgeAddress(address(porridge));

    deal(address(honey), address(gamm), 1800000e18, true);
    deal(address(gamm), address(this), 5000e18, true);
    deal(address(honey), address(this), 1000000e18, true);
  }

  function testBorrowTransfers() public {
    gamm.approve(address(porridge), type(uint256).max);
    porridge.stake(50e18);
    // uint256 floorPrice = gamm.floorPrice();
    
    // uint256 borrowAmount = (50e18 * floorPrice) / 1e18;
    // borrow.borrow(borrowAmount);
    // uint256 fee = (borrowAmount / 100) * 3;
    // assertEq(result, borrowAmount - fee);
  }

// function testBorrowLimit() public {
//     porridge.stake(50e18);
//     uint256 floorPrice = gamm.floorPrice();
//     uint256 borrowAmount = (50e18 * floorPrice) / 1e18;
//     vm.expectRevert(bytes("insufficient borrow limit"));
//     borrow.borrow(borrowAmount + 1e18);
//   }

//   function testRepay() public {
//     porridge.stake(50e18);
//     uint256 floorPrice = gamm.floorPrice();
//     uint256 borrowAmount = (50e18 * floorPrice) / 1e18;
//     borrow.borrow(borrowAmount);
//     borrow.repay(borrowAmount);
//     assertEq(borrow.getLocked(address(this)), 0);
//     assertEq(borrow.getBorrowed(address(this)), 0);
//   }

//   function testOverRepay() public {
//     porridge.stake(50e18);
//     uint256 floorPrice = gamm.floorPrice();
//     uint256 borrowAmount = (50e18 * floorPrice) / 1e18;
//     borrow.borrow(borrowAmount);
//     vm.expectRevert(bytes("repaying too much"));
//     borrow.repay(borrowAmount + 1e18);
//   }

//   function testCustomAllow() public {
//     uint256 beforeAllowance = honey.allowance(address(gamm), address(borrow));
//     console.log(beforeAllowance);
//     vm.prank(address(gamm));
//     honey.approve(address(borrow), 69);
//     uint256 afterAllowance = honey.allowance(address(gamm), address(borrow));
//     console.log(afterAllowance);
//     vm.prank(address(borrow));
//     honey.transferFrom(address(gamm), address(this), 10);
//   }

}