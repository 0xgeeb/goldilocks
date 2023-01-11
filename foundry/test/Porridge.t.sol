//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../lib/forge-std/src/Test.sol";
import "../src/Porridge.sol";
import "../src/Locks.sol";
import "../src/AMM.sol";
import "../src/Borrow.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract PorridgeTest is Test {

  IERC20 honey;
  Porridge porridge;
  Locks locks;
  AMM amm;
  Borrow borrow;

  function setUp() public {
    honey = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);
    locks = new Locks(address(this));
    amm = new AMM(address(locks), address(this));
    borrow = new Borrow(address(amm), address(locks), address(this));
    porridge = new Porridge(address(amm), address(locks), address(borrow), address(this));
  }

  function testCalculateYield() public {
    porridge.setLocksAddress(address(locks));
    deal(address(locks), address(this), 100e18);
    locks.approve(address(porridge), 100e18);
    porridge.stake(100e18);
    vm.warp(block.timestamp + 86400);
    uint256 result = porridge.claim();
    assertEq(result, 5e17);
  }

  function testUnstake() public {
    porridge.setLocksAddress(address(locks));
    deal(address(locks), address(this), 100e18);
    locks.approve(address(porridge), 100e18);
    porridge.stake(100e18);
    vm.warp(block.timestamp + 129600);
    porridge.unstake(100e18);
    assertEq(porridge.balanceOf(address(this)), 75e16);
  }

  function testRealize() public {
    borrow.setPorridge(address(porridge));
    deal(address(honey), address(this), 1000000e18, true);
    deal(address(honey), address(locks), 1000000e18, true);
    deal(address(locks), address(honey), 1000000e18, true);
    deal(address(porridge), address(this), 1000000e18, true);
    locks.setAmmAddress(address(amm));
    locks.transferToAMM(1600000e18, 400000e18);
    locks.setPorridgeAddress(address(porridge));
    honey.approve(address(porridge), 100000e18);
    porridge.realize(10e18);
    assertEq(locks.balanceOf(address(this)), 10e18);
  }

}