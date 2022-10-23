//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Test.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "../src/Locks.sol";
import "../src/Porridge.sol";
import "../src/AMM.sol";
import "../src/Borrow.sol";

contract BorrowTest is Test {

  Locks locks;
  Porridge porridge;
  AMM amm;
  Borrow borrow;
  IERC20 usdc;

  function setUp() public {
    usdc = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    locks = new Locks(address(this));
    amm = new AMM(address(locks), address(this));
    borrow = new Borrow(address(amm), address(locks), address(this));
    porridge = new Porridge(address(amm), address(locks), address(borrow), address(this));
    borrow.setPorridge(address(porridge));
    deal(address(usdc), address(this), 1000000e6, true);
    deal(address(locks), address(this), 1000000e18, true);
    deal(address(usdc), address(locks), 1000000e6, true);
    locks.setAmmAddress(address(amm));
    locks.transferToAMM();
  }

  function testBorrow() public {
    locks.approve(address(porridge), 10e18);
    porridge.stake(10e18);
    vm.prank(address(porridge));
    locks.approve(address(borrow), 100e18);
    vm.prank(address(amm));
    usdc.approve(address(borrow), 100e6);
    uint256 result = borrow.borrow(5e18);
    assertEq(result, 4850000);
  }

function testLimitBorrow() public {
    locks.approve(address(porridge), 10e18);
    porridge.stake(10e18);
    vm.expectRevert(bytes("insufficient borrow limit"));
    borrow.borrow(9e18);
  }

  function testRepay() public {
    locks.approve(address(porridge), 10e18);
    porridge.stake(10e18);
    vm.prank(address(porridge));
    locks.approve(address(borrow), 100e18);
    vm.prank(address(amm));
    usdc.approve(address(borrow), 100e6);
    borrow.borrow(8e18);
    usdc.approve(address(borrow), 100e18);
    locks.approve(address(borrow), 100e18);
    borrow.repay(8e18);
    
  }

  function testOverRepay() public {
    locks.approve(address(porridge), 10e18);
    porridge.stake(10e18);
    vm.prank(address(porridge));
    locks.approve(address(borrow), 100e18);
    vm.prank(address(amm));
    usdc.approve(address(borrow), 100e6);
    borrow.borrow(8e18);
    usdc.approve(address(borrow), 100e18);
    locks.approve(address(borrow), 100e18);
    vm.expectRevert(bytes("repaying too much"));
    borrow.repay(8000002000000000000);
  }



}