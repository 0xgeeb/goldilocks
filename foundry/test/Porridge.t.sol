//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Test.sol";
import { Honey } from "../src/test/Honey.sol";
import { GAMM } from "../src/GAMM.sol";
import { Borrow } from "../src/Borrow.sol";
import { Porridge } from "../src/Porridge.sol";

contract PorridgeTest is Test {

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
  }

  modifier deal100Locks() {
    deal(address(gamm), address(this), 100e18);
    gamm.approve(address(porridge), 100e18);
    _;
  }

  modifier deal280Honey() {
    deal(address(honey), address(this), 280e18);
    honey.approve(address(porridge), 280e18);
    _;
  }

  function testCalculate1DayofYield() public deal100Locks {
    porridge.stake(100e18);
    vm.warp(block.timestamp + porridge.DAYS_SECONDS());
    porridge.claim();

    uint256 OneDayofYield = 5e17;
    uint256 prgBalance = porridge.balanceOf(address(this));

    assertEq(prgBalance, OneDayofYield);
  }

  function testStake() public deal100Locks {
    porridge.stake(100e18);

    uint256 userBalanceofLocks = gamm.balanceOf(address(this));
    uint256 contractBalance = gamm.balanceOf(address(porridge));
    uint256 getStakedUserBalance = porridge.getStaked(address(this));

    assertEq(userBalanceofLocks, 0);
    assertEq(contractBalance, 100e18);
    assertEq(getStakedUserBalance, 100e18);
  }

  function testUnstake() public deal100Locks {
    porridge.stake(100e18);
    vm.warp(block.timestamp + porridge.DAYS_SECONDS());
    porridge.unstake(100e18);

    uint256 OneDayofYield = 5e17;
    uint256 userBalanceofLocks = gamm.balanceOf(address(this));
    uint256 contractBalance = gamm.balanceOf(address(porridge));
    uint256 getStakedUserBalance = porridge.getStaked(address(this));
    uint256 prgBalance = porridge.balanceOf(address(this));

    assertEq(userBalanceofLocks, 100e18);
    assertEq(contractBalance, 0);
    assertEq(getStakedUserBalance, 0);
    assertEq(prgBalance, OneDayofYield);
  }

  function testRealize() public deal100Locks deal280Honey {
    porridge.stake(100e18);
    vm.warp(block.timestamp + (2 * porridge.DAYS_SECONDS()));
    porridge.unstake(100e18);
    porridge.realize(1e18);

    uint256 userBalanceofPrg = porridge.balanceOf(address(this));
    uint256 userBalanceofLocks = gamm.balanceOf(address(this));
    uint256 userBalanceofHoney = honey.balanceOf(address(this));
    uint256 gammBalanceofHoney = honey.balanceOf(address(gamm));

    assertEq(userBalanceofPrg, 0);
    assertEq(userBalanceofLocks, 101e18);
    assertEq(userBalanceofHoney, 0);
    assertEq(gammBalanceofHoney, 280e18);
  }

}