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
  IERC20 honey;

  function setUp() public {
    honey = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);
    locks = new Locks(address(this));
    amm = new AMM(address(locks), address(this));
    borrow = new Borrow(address(amm), address(locks), address(this));
    porridge = new Porridge(address(amm), address(locks), address(borrow), address(this));
    borrow.setPorridge(address(porridge));
    deal(address(honey), address(this), 1000000e18, true);
    deal(address(locks), address(this), 1000000e18, true);
    deal(address(honey), address(locks), 1000000e18, true);
    locks.setAmmAddress(address(amm));
    locks.transferToAMM(1600000e18, 400000e18);
    amm.updateSupply(1000e18);
  }

  function testBorrow() public {
    locks.approve(address(porridge), 1000e18);
    porridge.stake(1000e18);
    vm.prank(address(porridge));
    locks.approve(address(borrow), 100e18);
    vm.prank(address(amm));
    honey.approve(address(borrow), 100e18);
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
    honey.approve(address(borrow), 100e18);
    borrow.borrow(8e18);
    honey.approve(address(borrow), 1000e18);
    locks.approve(address(borrow), 1000e18);
    borrow.repay(8e18);
    
  }

  function testOverRepay() public {
    locks.approve(address(porridge), 1000e18);
    porridge.stake(1000e18);
    vm.prank(address(porridge));
    locks.approve(address(borrow), 100000e18);
    vm.prank(address(amm));
    honey.approve(address(borrow), 100e18);
    borrow.borrow(8e18);
    honey.approve(address(borrow), 100e18);
    locks.approve(address(borrow), 100e18);
    vm.expectRevert(bytes("repaying too much"));
    borrow.repay(8000002000000000000);
  }



}