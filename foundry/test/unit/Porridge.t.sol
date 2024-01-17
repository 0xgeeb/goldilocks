//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Test.sol";
import { LibRLP } from "../../lib/solady/src/utils/LibRLP.sol";
import { Honey } from "../../src/mock/Honey.sol";
import { GAMM } from "../../src/core/GAMM.sol";
import { Borrow } from "../../src/core/Borrow.sol";
import { Porridge } from "../../src/core/Porridge.sol";
import { Goldilend } from "../../src/core/Goldilend.sol";
import { ConsensusVault } from "../../src/mock/ConsensusVault.sol";
import { Bera } from "../../src/mock/Bera.sol";
import { HoneyComb } from "../../src/mock/HoneyComb.sol";
import { Beradrome } from "../../src/mock/Beradrome.sol";
import { BondBear } from "../../src/mock/BondBear.sol";
import { BandBear } from "../../src/mock/BandBear.sol";

contract PorridgeTest is Test {

  using LibRLP for address;

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

  uint256 locksAmount = 100e18;
  uint256 borrowAmount = 280e20;
  uint256 HalfDayofYield = 68493150684931500;
  uint256 OneDayofYield = 136986301369863000;
  uint256 OneDayandHalfofYield = 205479452054794500;
  uint256 TwoDaysofYield = 273972602739726000;
  uint256 twoMonthsOfGoldilendStakingYield = 43e18;

  bytes4 NotGoldilendSelector = 0xc81d51dc;
  bytes4 InvalidUnstakeSelector = 0x280cf628;
  bytes4 LocksBorrowedAgainstSelector = 0xad7facc8;

  function setUp() public {
    Porridge porridgeComputed = Porridge(address(this).computeAddress(4));
    Borrow borrowComputed = Borrow(address(this).computeAddress(3));
    Goldilend goldilendComputed = Goldilend(address(this).computeAddress(11));
    honey = new Honey();
    gamm = new GAMM(address(this), address(porridgeComputed), address(borrowComputed), address(honey));
    borrow = new Borrow(address(gamm), address(porridgeComputed), address(honey));
    porridge = new Porridge(address(gamm), address(borrow), address(goldilendComputed), address(honey));

    bera = new Bera();
    honeycomb = new HoneyComb();
    beradrome = new Beradrome();
    bondbear = new BondBear();
    bandbear = new BandBear();
    consensusvault = new ConsensusVault(address(bera));

    address honeyjar = address(0x69420);
    uint256 startingPoolSize = 1000e18;
    uint256 protocolInterestRate = 1e17;
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
      honeyjar,
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

    goldilend.setValue(locksAmount, nfts, values);
    deal(address(bera), address(goldilend), startingPoolSize);
    deal(address(bera), address(consensusvault), type(uint256).max / 2);
  }

  modifier dealandStake100Locks() {
    deal(address(gamm), address(this), locksAmount);
    gamm.approve(address(porridge), locksAmount);
    porridge.stake(locksAmount);
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

  function testNotGoldilend() public { 
    vm.prank(address(0x01));
    vm.expectRevert(NotGoldilendSelector);
    porridge.goldilendMint(address(this), 69e18);
  }

  function testInvalidUnstake() public dealandStake100Locks {
    vm.expectRevert(InvalidUnstakeSelector);
    porridge.unstake(locksAmount + 1);
  }

  function testLocksBorrowedAgainst() public dealandStake100Locks dealGammMaxHoney {
    borrow.borrow(borrowAmount);
    vm.expectRevert(LocksBorrowedAgainstSelector);
    porridge.unstake(1e18);
  }

  function testPRGName() public {
    assertEq(porridge.name(), "Porridge Token");
  }

  function testPRGSymbol() public {
    assertEq(porridge.symbol(), "PRG");
  }

  function testCalculateHalfDayofYield() public dealandStake100Locks {
    vm.warp(block.timestamp + (1 days / 2));
    porridge.claim();

    uint256 prgBalance = porridge.balanceOf(address(this));
    
    assertEq(prgBalance, HalfDayofYield);
  }

  function testCalculate1DayofYield() public dealandStake100Locks {
    vm.warp(block.timestamp + 1 days);
    porridge.claim();

    uint256 prgBalance = porridge.balanceOf(address(this));

    assertEq(prgBalance, OneDayofYield);
  }

  function testCalculate1andHalfDayofYield() public dealandStake100Locks {
    vm.warp(block.timestamp + 1 days + (1 days / 2));
    porridge.claim();

    uint256 prgBalance = porridge.balanceOf(address(this));
    
    assertEq(prgBalance, OneDayandHalfofYield);
  }

  function testStake() public dealandStake100Locks {
    uint256 userBalanceofLocks = gamm.balanceOf(address(this));
    uint256 contractBalance = gamm.balanceOf(address(porridge));
    uint256 getStakedUserBalance = porridge.getStaked(address(this));

    assertEq(userBalanceofLocks, 0);
    assertEq(contractBalance, locksAmount);
    assertEq(getStakedUserBalance, locksAmount);
  }

  function testDoubleStake() public dealandStake100Locks {
    deal(address(gamm), address(this), locksAmount);
    gamm.approve(address(porridge), locksAmount);
    porridge.stake(locksAmount);
  }

  function testUnstake() public dealandStake100Locks {
    vm.warp(block.timestamp + 1 days);
    porridge.unstake(locksAmount);

    uint256 userBalanceofLocks = gamm.balanceOf(address(this));
    uint256 contractBalance = gamm.balanceOf(address(porridge));
    uint256 getStakedUserBalance = porridge.getStaked(address(this));
    uint256 prgBalance = porridge.balanceOf(address(this));

    assertEq(userBalanceofLocks, locksAmount);
    assertEq(contractBalance, 0);
    assertEq(getStakedUserBalance, 0);
    assertEq(prgBalance, OneDayofYield);
  }

  function testStakeUnstake() public dealandStake100Locks {
    porridge.unstake(locksAmount);

    uint256 userBalanceofLocks = gamm.balanceOf(address(this));
    uint256 getStakedUserBalance = porridge.getStaked(address(this));

    assertEq(userBalanceofLocks, locksAmount);
    assertEq(getStakedUserBalance, 0);
  }

  function testRealize() public dealandStake100Locks dealUser280Honey {
    vm.warp(block.timestamp + (2 * 1 days));
    porridge.unstake(locksAmount);
    porridge.realize(TwoDaysofYield);

    uint256 userBalanceofPrg = porridge.balanceOf(address(this));
    uint256 userBalanceofLocks = gamm.balanceOf(address(this));
    uint256 userBalanceofHoney = honey.balanceOf(address(this));
    uint256 gammBalanceofHoney = honey.balanceOf(address(gamm));

    assertEq(userBalanceofPrg, 0);
    assertEq(userBalanceofLocks, 100273972602739726000);
    assertEq(userBalanceofHoney, 203287671232876720000);
    assertEq(gammBalanceofHoney, 76712328767123280000);
  }

  function testClaim() public dealandStake100Locks {
    vm.warp(block.timestamp + 1 days);
    porridge.claim();

    uint256 userBalanceofPrg = porridge.balanceOf(address(this));
    uint256 userStakedLocks = porridge.getStaked(address(this));

    assertEq(userBalanceofPrg, OneDayofYield);
    assertEq(userStakedLocks, locksAmount);
  }

  function testGetStaked() public dealandStake100Locks{
    uint256 userStakedLocks = porridge.getStaked(address(this));

    assertEq(userStakedLocks, locksAmount);
  }

  function testGetStakeStartTime() public {
    vm.warp(69);
    deal(address(gamm), address(this), locksAmount);
    gamm.approve(address(porridge), locksAmount);
    porridge.stake(locksAmount);

    uint256 timestamp = porridge.getStakeStartTime(address(this));

    assertEq(timestamp, 69);
  }

  function testGetClaimable() public dealandStake100Locks {
    vm.warp(block.timestamp + 1 days);

    uint256 claimable = porridge.getClaimable(address(this));

    assertEq(claimable, OneDayofYield);
  }

  function testGoldilendMint() public {
    deal(address(goldilend), address(this), 1e18);
    goldilend.approve(address(goldilend), 1e18);
    goldilend.stake(1e18);
    vm.warp(block.timestamp + (goldilend.MONTH_DAYS() * 2));
    goldilend.claim();

    uint256 userPrgBalance = porridge.balanceOf(address(this));

    assertEq(userPrgBalance, twoMonthsOfGoldilendStakingYield);
  }

}