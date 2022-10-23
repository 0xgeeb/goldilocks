//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Test.sol";
import "../src/Porridge.sol";
import "../src/Locks.sol";
import "../src/AMM.sol";
import "../src/Borrow.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract PorridgeTest is Test {

  IERC20 usdc;
  Porridge porridge;
  Locks locks;
  AMM amm;
  Borrow borrow;
  

  function setUp() public {
    usdc = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    locks = new Locks(address(this));
    amm = new AMM(address(locks), address(this));
    borrow = new Borrow(address(amm), address(locks), address(this));
    porridge = new Porridge(address(amm), address(locks), address(borrow), address(this));
  }

  function testCalculateYield() public {
    deal(address(locks), address(this), 100e18);
    locks.approve(address(porridge), 100e18);
    porridge.stake(100e18);
    vm.warp(block.timestamp + 86400);
    uint256 result = porridge.claim();
    assertEq(result, 5e17);
  }

  function testUnstake() public {
    deal(address(locks), address(this), 100e18);
    locks.approve(address(porridge), 100e18);
    porridge.stake(100e18);
    vm.warp(block.timestamp + 129600);
    porridge.unstake(100e18);
    assertEq(porridge.balanceOf(address(this)), 75e16);
  }

  function testRealize() public {
    borrow.setPorridge(address(porridge));
    deal(address(usdc), address(this), 1000000e6, true);
    deal(address(usdc), address(locks), 1000000e6, true);
    deal(address(locks), address(usdc), 1000000e18, true);
    deal(address(porridge), address(this), 1000000e18, true);
    locks.setAmmAddress(address(amm));
    locks.transferToAMM();
    locks.setPorridgeAddress(address(porridge));
    usdc.approve(address(porridge), 100000e6);
    porridge.realize(10e18);
    assertEq(locks.balanceOf(address(this)), 10e18);
  }

}