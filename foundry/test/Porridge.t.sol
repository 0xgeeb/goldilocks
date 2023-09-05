//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Test.sol";
import { Honey } from "../src/mock/Honey.sol";
import { GAMM } from "../src/core/GAMM.sol";
import { Borrow } from "../src/core/Borrow.sol";
import { Porridge } from "../src/core/Porridge.sol";
import { Goldilend } from "../src/core/Goldilend.sol";
import { ConsensusVault } from "../src/mock/ConsensusVault.sol";
import { Bera } from "../src/mock/Bera.sol";
import { HoneyComb } from "../src/mock/HoneyComb.sol";
import { Beradrome } from "../src/mock/Beradrome.sol";
import { BondBear } from "../src/mock/BondBear.sol";
import { BandBear } from "../src/mock/BandBear.sol";


contract PorridgeTest is Test {

  Honey honey;
  GAMM gamm;
  Borrow borrow;
  Porridge porridge;

  Goldilend goldilend;
  Bera bera;
  ConsensusVault consensusvault;
  HoneyComb honeycomb;
  Beradrome beradrome;
  BondBear bondbear;
  BandBear bandbear;

  uint256 OneDayofYield = 5e17;
  uint256 borrowAmount = 280e20;

  bytes4 NoClaimablePRGSelector = 0x018bb287;
  bytes4 InvalidUnstakeSelector = 0x280cf628;
  bytes4 LocksBorrowedAgainstSelector = 0xad7facc8;

  function setUp() public {
    honey = new Honey();
    gamm = new GAMM(address(this), address(honey));
    borrow = new Borrow(address(gamm), address(this), address(honey));
    porridge = new Porridge(address(gamm), address(borrow), address(this), address(honey));

    gamm.setPorridgeAddress(address(porridge));
    gamm.setBorrowAddress(address(borrow));
    borrow.setPorridgeAddress(address(porridge));

    bera = new Bera();
    honeycomb = new HoneyComb();
    beradrome = new Beradrome();
    bondbear = new BondBear();
    bandbear = new BandBear();
    consensusvault = new ConsensusVault(address(bera));

    uint256 startingPoolSize = 1e18;
    uint256 protocolInterestRate = 15;
    uint256 porridgeMultiple = 1e13;
    address[] memory boostNfts = new address[](2);
    boostNfts[0] = address(honeycomb);
    boostNfts[1] = address(beradrome);
    uint8[] memory boosts = new uint8[](2);
    boosts[0] = 6;
    boosts[1] = 9;
    
    goldilend = new Goldilend(
      startingPoolSize,
      protocolInterestRate,
      porridgeMultiple,
      address(porridge),
      address(this),
      address(bera),
      address(consensusvault),
      boostNfts,
      boosts
    );

    address[] memory nfts = new address[](2);
    nfts[0] = address(bondbear);
    nfts[1] = address(bandbear);
    uint256[] memory values = new uint256[](2);
    values[0] = 50;
    values[1] = 50;

    goldilend.setValue(100e18, nfts, values);

    porridge.setGoldilendAddress(address(goldilend));
  }

  modifier dealandStake100Locks() {
    deal(address(gamm), address(this), 100e18);
    gamm.approve(address(porridge), 100e18);
    porridge.stake(100e18);
    _;
  }

  modifier dealUser280Honey() {
    deal(address(honey), address(this), 280e18);
    honey.approve(address(porridge), 280e18);
    _;
  }

  modifier dealGammMaxHoney() {
    deal(address(honey), address(gamm), type(uint256).max);
    _;
  }

  function testCalculateHalfDayofYield() public dealandStake100Locks {
    vm.warp(block.timestamp + (porridge.DAYS_SECONDS() / 2));
    porridge.claim();

    uint256 halfDayofYield = 25e16;
    uint256 prgBalance = porridge.balanceOf(address(this));
    
    assertEq(prgBalance, halfDayofYield);
  }

  function testCalculate1DayofYield() public dealandStake100Locks {
    vm.warp(block.timestamp + porridge.DAYS_SECONDS());
    porridge.claim();

    uint256 oneDayofYield = 5e17;
    uint256 prgBalance = porridge.balanceOf(address(this));

    assertEq(prgBalance, oneDayofYield);
  }

  function testCalculate1andHalfDayofYield() public dealandStake100Locks {
    vm.warp(block.timestamp + porridge.DAYS_SECONDS() + (porridge.DAYS_SECONDS() / 2));
    porridge.claim();

    uint256 oneDayandHalfofYield = 75e16;
    uint256 prgBalance = porridge.balanceOf(address(this));
    
    assertEq(prgBalance, oneDayandHalfofYield);
  }

  function testStake() public dealandStake100Locks {
    uint256 userBalanceofLocks = gamm.balanceOf(address(this));
    uint256 contractBalance = gamm.balanceOf(address(porridge));
    uint256 getStakedUserBalance = porridge.getStaked(address(this));

    assertEq(userBalanceofLocks, 0);
    assertEq(contractBalance, 100e18);
    assertEq(getStakedUserBalance, 100e18);
  }

  function testDoubleStake() public dealandStake100Locks {
    deal(address(gamm), address(this), 100e18);
    gamm.approve(address(porridge), 100e18);
    porridge.stake(100e18);
  }

  function testUnstake() public dealandStake100Locks {
    vm.warp(block.timestamp + porridge.DAYS_SECONDS());
    porridge.unstake(100e18);

    uint256 userBalanceofLocks = gamm.balanceOf(address(this));
    uint256 contractBalance = gamm.balanceOf(address(porridge));
    uint256 getStakedUserBalance = porridge.getStaked(address(this));
    uint256 prgBalance = porridge.balanceOf(address(this));

    assertEq(userBalanceofLocks, 100e18);
    assertEq(contractBalance, 0);
    assertEq(getStakedUserBalance, 0);
    assertEq(prgBalance, OneDayofYield);
  }

  function testStakeUnstake() public dealandStake100Locks {
    porridge.unstake(100e18);

    uint256 userBalanceofLocks = gamm.balanceOf(address(this));
    uint256 getStakedUserBalance = porridge.getStaked(address(this));

    assertEq(userBalanceofLocks, 100e18);
    assertEq(getStakedUserBalance, 0);
  }

  function testRealize() public dealandStake100Locks dealUser280Honey {
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

  function testClaim() public dealandStake100Locks {
    vm.warp(block.timestamp + porridge.DAYS_SECONDS());
    porridge.claim();

    uint256 userBalanceofPrg = porridge.balanceOf(address(this));
    uint256 userStakedLocks = porridge.getStaked(address(this));

    assertEq(userBalanceofPrg, OneDayofYield);
    assertEq(userStakedLocks, 100e18);
  }

  function testStakeClaim() public dealandStake100Locks {
    vm.warp(block.timestamp + porridge.DAYS_SECONDS());
    deal(address(gamm), address(this), 1e18);
    gamm.approve(address(porridge), 1e18);
    porridge.stake(1e18);

    uint256 userBalanceofPrg = porridge.balanceOf(address(this));

    assertEq(userBalanceofPrg, OneDayofYield);
  }

  function testInvalidUnstake() public dealandStake100Locks {
    vm.expectRevert(InvalidUnstakeSelector);
    porridge.unstake(100e18 + 1);
  }

  function testLocksBorrowedAgainst() public dealandStake100Locks dealGammMaxHoney {
    borrow.borrow(borrowAmount);
    vm.expectRevert(LocksBorrowedAgainstSelector);
    porridge.unstake(1);
  }

  function testGetStaked() public dealandStake100Locks{
    uint256 userStakedLocks = porridge.getStaked(address(this));

    assertEq(userStakedLocks, 100e18);
  }

  function testGetStakeStartTime() public {
    vm.warp(69);
    deal(address(gamm), address(this), 100e18);
    gamm.approve(address(porridge), 100e18);
    porridge.stake(100e18);

    uint256 timestamp = porridge.getStakeStartTime(address(this));

    assertEq(timestamp, 69);
  }

  function testGetClaimable() public dealandStake100Locks {
    vm.warp(block.timestamp + porridge.DAYS_SECONDS());

    uint256 claimable = porridge.getClaimable(address(this));

    assertEq(claimable, OneDayofYield);
  }

  function testSetGoldilendAddress() public {
    porridge.setGoldilendAddress(address(goldilend));

    assertEq(address(goldilend), porridge.goldilendAddress());
  }

  //todo: not done
  function testGoldilendMint() public {
    console.log(block.timestamp);
    deal(address(goldilend), address(this), 100e18);
    goldilend.approve(address(goldilend), 100e18);
    goldilend.stake(100e18);
    vm.warp(block.timestamp + (30 * porridge.DAYS_SECONDS()));

    uint256 userBalanceofPrg = porridge.balanceOf(address(this));

    assertEq(userBalanceofPrg, 0);
  }

  //todo: not done
  function testRealizeSupplyAmount() public dealandStake100Locks dealUser280Honey {
    // vm.warp(block.timestamp + (2 * porridge.DAYS_SECONDS()));
    // porridge.unstake(100e18);
    // porridge.realize(1e18);

    // uint256 userBalanceofPrg = porridge.balanceOf(address(this));
    // uint256 userBalanceofLocks = gamm.balanceOf(address(this));
    // uint256 userBalanceofHoney = honey.balanceOf(address(this));
    // uint256 gammBalanceofHoney = honey.balanceOf(address(gamm));

    // assertEq(userBalanceofPrg, 0);
    // assertEq(userBalanceofLocks, 101e18);
    // assertEq(userBalanceofHoney, 0);
    // assertEq(gammBalanceofHoney, 280e18);

    console.log(gamm.supply());
    console.log(gamm.totalSupply());

    // assertEq(gamm.totalSupply(), gamm.supply());
  }



}