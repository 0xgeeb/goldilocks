//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Test.sol";
import { LibRLP } from "../../lib/solady/src/utils/LibRLP.sol";
import { IERC721 } from "../../lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import { IERC721Receiver } from "../../lib/openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol";
import { INFT } from "../../src/mock/INFT.sol";
import { Goldilend } from "../../src/core/Goldilend.sol";
import { Porridge } from "../../src/core/Porridge.sol";
import { GAMM } from "../../src/core/GAMM.sol";
import { Borrow } from "../../src/core/Borrow.sol"; 
import { Honey } from "../../src/mock/Honey.sol";
import { ConsensusVault } from "../../src/mock/ConsensusVault.sol";
import { Bera } from "../../src/mock/Bera.sol";
import { HoneyComb } from "../../src/mock/HoneyComb.sol";
import { Beradrome } from "../../src/mock/Beradrome.sol";
import { BondBear } from "../../src/mock/BondBear.sol";
import { BandBear } from "../../src/mock/BandBear.sol";

contract GoldilendTest is Test, IERC721Receiver {

  using LibRLP for address;

  Goldilend goldilend;
  GAMM gamm;
  Borrow borrow;
  Porridge porridge;
  Honey honey;
  Bera bera;
  ConsensusVault consensusvault;
  HoneyComb honeycomb;
  Beradrome beradrome;
  BondBear bondbear;
  BandBear bandbear;

  bytes4 InvalidLoanAmountSelector = 0x56976661;
  bytes4 InvalidBoostSelector = 0xe4c30186;
  bytes4 InvalidUnstakeSelector = 0x280cf628;
  bytes4 LoanNotFoundSelector = 0x0e7e621d;
  bytes4 ExcessiveRepaySelector = 0x7bc3c3ef;
  bytes4 LoanExpiredSelector = 0x5dc919ca;
  bytes4 UnliquidatableSelector = 0x13d94799;

  uint256 twoMonthsOfYield = 43e18;
  uint256 twoMonthsOfBoostedYield = 4945e16;
  uint256 singleBorrowInterest = 4646574074074073;
  uint256 singleBorrowInterestBoosted = 4367779629629560;
  uint256 singleBorrowInterestMaxBoost = 2323287037037000;

  function setUp() public {
    Porridge porridgeComputed = Porridge(address(this).computeAddress(10));
    Borrow borrowComputed = Borrow(address(this).computeAddress(9));
    Goldilend goldilendComputed = Goldilend(address(this).computeAddress(11));
    honey = new Honey();
    bera = new Bera();
    honeycomb = new HoneyComb();
    beradrome = new Beradrome();
    bondbear = new BondBear();
    bandbear = new BandBear();
    consensusvault = new ConsensusVault(address(bera));
  
    gamm = new GAMM(address(this), address(porridgeComputed), address(borrowComputed), address(honey));
    borrow = new Borrow(address(gamm), address(porridgeComputed), address(honey));
    porridge = new Porridge(address(gamm), address(borrow), address(goldilendComputed), address(this), address(honey));

    uint256 startingPoolSize = 1000e18;
    uint256 protocolInterestRate = 1e17;
    // amount of porridge earned per gbera per second
    // depends on what we want the initial apr
    // apr will be a function of the bera and porridge prices
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
    deal(address(bera), address(goldilend), startingPoolSize);
    deal(address(bera), address(consensusvault), type(uint256).max / 2);
  }

  modifier dealUserBera() {
    deal(address(bera), address(this), type(uint256).max / 2);
    bera.approve(address(goldilend), type(uint256).max / 2);
    _;
  }

  modifier dealUserBeras() {
    INFT(address(bondbear)).mint(address(this));
    INFT(address(bandbear)).mint(address(this));
    IERC721(bondbear).setApprovalForAll(address(goldilend), true);
    IERC721(bandbear).setApprovalForAll(address(goldilend), true);
    _;
  }

  modifier dealUserPartnerNFTs() {
    INFT(address(honeycomb)).mint(address(this));
    INFT(address(beradrome)).mint(address(this));
    IERC721(honeycomb).setApprovalForAll(address(goldilend), true);
    IERC721(beradrome).setApprovalForAll(address(goldilend), true);
    _;
  }

  function testInvalidLoanAmount() public {
    vm.expectRevert(InvalidLoanAmountSelector);
    goldilend.borrow(101e18, 1209600, address(bondbear), 1);
  }

  function testLoanNotFound() public {
    vm.expectRevert(LoanNotFoundSelector);
    goldilend.lookupLoan(address(this), 1);
  }

  function testInvalidBoost() public {
    vm.expectRevert(InvalidBoostSelector);
    goldilend.withdrawBoost();
  }

  function testInvalidStake() public {
    vm.expectRevert(InvalidUnstakeSelector);
    goldilend.unstake(69e18);
  }

  function testExcessiveRepay() public dealUserBeras {
    goldilend.borrow(1e18, 1209600, address(bondbear), 1);
    vm.expectRevert(ExcessiveRepaySelector);
    goldilend.repay(2e18, 1);
  }

  function testLoanExpired() public dealUserBeras {
    goldilend.borrow(1e18, 1209600, address(bondbear), 1);
    vm.warp(1209602);
    vm.expectRevert(LoanExpiredSelector);
    goldilend.repay(1e18, 1);
  }

  function testUnliquidatable() public dealUserBeras {
    goldilend.borrow(1e18, 1209600, address(bondbear), 1);
    vm.warp(1209599);
    vm.expectRevert(UnliquidatableSelector);
    goldilend.liquidate(address(this), 1);
  }

  function testLookupLoans() public dealUserBeras {
    uint256 duration = 1209600;
    goldilend.borrow(1e18, duration, address(bondbear), 1);
    goldilend.borrow(1e18, duration, address(bandbear), 1);
    
    Goldilend.Loan[] memory userLoans = goldilend.lookupLoans(address(this));
    uint256 userDuration = userLoans[0].duration;
    uint256 userDuration2 = userLoans[1].duration;

    assertEq(userDuration, duration);
    assertEq(userDuration2, duration);
  }

  function testGetgBERARatio() public {
    deal(address(bera), address(this), 11157e16);
    bera.approve(address(goldilend), type(uint256).max);
    goldilend.lock(100e18);
    vm.store(address(goldilend), bytes32(uint256(2)), bytes32(uint256(100e18)));
    vm.store(address(goldilend), bytes32(uint256(18)), bytes32(uint256(1000e18)));

    uint256 gBERARatio = goldilend.getgBERARatio();

    assertEq(gBERARatio, 10e16);
  }

  function testTransferBeras() public dealUserBeras {
    IERC721(address(bondbear)).safeTransferFrom(address(this), address(goldilend), 1);
    IERC721(address(bandbear)).safeTransferFrom(address(this), address(goldilend), 1);

    uint256 goldilendBondBalance = IERC721(address(bondbear)).balanceOf(address(goldilend));
    uint256 goldilendBandBalance = IERC721(address(bandbear)).balanceOf(address(goldilend));

    assertEq(goldilendBondBalance + goldilendBandBalance, 2);
  }

  function testCalculateClaim() public {
    deal(address(goldilend), address(this), 1e18);
    goldilend.approve(address(goldilend), 1e18);
    goldilend.stake(1e18);
    vm.warp(block.timestamp + (goldilend.MONTH_DAYS() * 2));

    uint256 userClaimable = goldilend.getClaimable(address(this));

    assertEq(userClaimable, twoMonthsOfYield);
  }

  function testCalculateBoostedClaim() public dealUserPartnerNFTs {
    deal(address(goldilend), address(this), 1e18);
    goldilend.approve(address(goldilend), 1e18);
    goldilend.stake(1e18);
    vm.warp(block.timestamp + (goldilend.MONTH_DAYS() * 2));

    address[] memory nfts = new address[](2);
    nfts[0] = address(beradrome);
    nfts[1] = address(honeycomb);
    uint256[] memory ids = new uint256[](2);
    ids[0] = 1;
    ids[1] = 1;

    goldilend.boost(nfts, ids, block.timestamp + (goldilend.MONTH_DAYS() * 3));

    uint256 userClaimable = goldilend.getClaimable(address(this));

    assertEq(userClaimable, twoMonthsOfBoostedYield);
  }

  function testCalculatePostEmissionsClaim() public {
    deal(address(goldilend), address(this), 2e18);
    goldilend.approve(address(goldilend), 2e18);
    goldilend.stake(1e18);
    vm.warp(block.timestamp + (goldilend.MONTH_DAYS() * 6));
    uint256 userClaimable = goldilend.getClaimable(address(this));

    vm.warp(block.timestamp + (goldilend.MONTH_DAYS() * 26));
    uint256 userClaimableAfter = goldilend.getClaimable(address(this));


    assertEq(userClaimable, userClaimableAfter);
  }

  function testCalculatePostEmissionsClaimMaxAverage() public {
    deal(address(goldilend), address(this), 2e18);
    goldilend.approve(address(goldilend), 2e18);
    goldilend.stake(1e18);
    vm.warp(block.timestamp + (goldilend.MONTH_DAYS() * 36));

    goldilend.stake(1e18);
    vm.warp(block.timestamp + (goldilend.MONTH_DAYS() * 36));
    uint256 userClaimable = goldilend.getClaimable(address(this));

    assertEq(userClaimable, 0);    
  }

  function testSingleStake() public {
    deal(address(goldilend), address(this), 1e18);
    goldilend.approve(address(goldilend), 1e18);
    goldilend.stake(1e18);
    
    uint256 usergBeraBalance = goldilend.balanceOf(address(this));
    uint256 goldilendgBeraBalance = goldilend.balanceOf(address(goldilend));
    (uint256 claim, uint256 staked) = goldilend.stakes(address(this));

    assertEq(goldilendgBeraBalance, 1e18);
    assertEq(usergBeraBalance, 0);
    assertEq(staked, 1e18);
    assertEq(claim, 1);
  }

  function testDoubleStake() public {
    deal(address(goldilend), address(this), 2e18);
    goldilend.approve(address(goldilend), 2e18);
    goldilend.stake(1e18);
    vm.warp(block.timestamp + (goldilend.MONTH_DAYS() * 2));
    goldilend.stake(1e18);

    uint256 prgBalance = porridge.balanceOf(address(this));

    assertEq(prgBalance, twoMonthsOfYield);
  }

  function testUnstake() public {
    deal(address(goldilend), address(this), 1e18);
    goldilend.approve(address(goldilend), 1e18);
    goldilend.stake(1e18);
    vm.warp(block.timestamp + (goldilend.MONTH_DAYS() * 2));
    goldilend.unstake(1e18);

    uint256 usergBeraBalance = goldilend.balanceOf(address(this));
    uint256 userPrgBalance = porridge.balanceOf(address(this));
    uint256 goldilendgBeraBalance = goldilend.balanceOf(address(goldilend));
    (uint256 claim, uint256 staked) = goldilend.stakes(address(this));

    assertEq(goldilendgBeraBalance, 0);
    assertEq(userPrgBalance, twoMonthsOfYield);
    assertEq(usergBeraBalance, 1e18);
    assertEq(staked, 0);
    assertEq(claim, goldilend.MONTH_DAYS() * 2 + 1);
  }

  function testBoostMapping() public {
    uint256 honeycombValue = goldilend.partnerNFTBoosts(address(honeycomb));
    uint256 beradromeValue = goldilend.partnerNFTBoosts(address(beradrome));
    uint256 randomValue = goldilend.partnerNFTBoosts(address(0x01));
    
    assertEq(honeycombValue, 6);
    assertEq(beradromeValue, 9);
    assertEq(randomValue, 0);
  }

  function testFairValueMapping() public {
    uint256 bondbearValue = goldilend.nftFairValues(address(bondbear));
    uint256 randomValue = goldilend.nftFairValues(address(0x01));
    
    assertEq(bondbearValue, 50);
    assertEq(randomValue, 0);
  }

  function testCalculateFairValue() public {
    address[] memory nfts = new address[](2);
    nfts[0] = address(bondbear);
    nfts[1] = address(bandbear);

    uint256 fairValues = goldilend.getFairValues(nfts);

    assertEq(fairValues, 100e18);
  }

  function testSuccessfulBoost() public dealUserPartnerNFTs {
    address[] memory nfts = new address[](2);
    nfts[0] = address(honeycomb);
    nfts[1] = address(beradrome);
    uint256[] memory ids = new uint256[](2);
    ids[0] = 1;
    ids[1] = 1;
    goldilend.boost(nfts, ids, goldilend.MONTH_DAYS() + 1);
    Goldilend.Boost memory userBoost = goldilend.lookupBoost(address(this));

    assertEq(IERC721(honeycomb).balanceOf(address(this)), 0);
    assertEq(IERC721(beradrome).balanceOf(address(this)), 0);
    assertEq(IERC721(honeycomb).balanceOf(address(goldilend)), 1);
    assertEq(IERC721(beradrome).balanceOf(address(goldilend)), 1);
    assertEq(userBoost.expiry, goldilend.MONTH_DAYS() + 1);
    assertEq(userBoost.boostMagnitude, 15);
  }

  function testExtendBoost() public dealUserPartnerNFTs {
    address[] memory nfts = new address[](2);
    nfts[0] = address(honeycomb);
    nfts[1] = address(beradrome);
    uint256[] memory ids = new uint256[](2);
    ids[0] = 1;
    ids[1] = 1;
    goldilend.boost(nfts, ids, goldilend.MONTH_DAYS() + 1);
    goldilend.extendBoost(goldilend.MONTH_DAYS() + 1);
    Goldilend.Boost memory userBoost = goldilend.lookupBoost(address(this));

    assertEq(IERC721(honeycomb).balanceOf(address(this)), 0);
    assertEq(IERC721(beradrome).balanceOf(address(this)), 0);
    assertEq(IERC721(honeycomb).balanceOf(address(goldilend)), 1);
    assertEq(IERC721(beradrome).balanceOf(address(goldilend)), 1);
    assertEq(userBoost.expiry, goldilend.MONTH_DAYS() + 1);
    assertEq(userBoost.boostMagnitude, 15);
  }

  function testWithdrawBoost() public dealUserPartnerNFTs {
    address[] memory nfts = new address[](2);
    nfts[0] = address(honeycomb);
    nfts[1] = address(beradrome);
    uint256[] memory ids = new uint256[](2);
    ids[0] = 1;
    ids[1] = 1;
    goldilend.boost(nfts, ids, goldilend.MONTH_DAYS() + 1);
    vm.warp(goldilend.MONTH_DAYS() + 2);
    goldilend.withdrawBoost();
    Goldilend.Boost memory userBoost = goldilend.lookupBoost(address(this));

    assertEq(IERC721(honeycomb).balanceOf(address(this)), 1);
    assertEq(IERC721(beradrome).balanceOf(address(this)), 1);
    assertEq(IERC721(honeycomb).balanceOf(address(goldilend)), 0);
    assertEq(IERC721(beradrome).balanceOf(address(goldilend)), 0);
    assertEq(userBoost.expiry, 0);
    assertEq(userBoost.boostMagnitude, 0);
  }

  function testBoostBoostWithdrawBoost() public {
    INFT(address(honeycomb)).mint(address(this));
    INFT(address(honeycomb)).mint(address(this));
    INFT(address(beradrome)).mint(address(this));
    INFT(address(beradrome)).mint(address(this));
    address[] memory nfts = new address[](2);
    nfts[0] = address(honeycomb);
    nfts[1] = address(beradrome);
    uint256[] memory ids = new uint256[](2);
    ids[0] = 1;
    ids[1] = 1;
    IERC721(honeycomb).setApprovalForAll(address(goldilend), true);
    IERC721(beradrome).setApprovalForAll(address(goldilend), true);
    assertEq(IERC721(honeycomb).balanceOf(address(this)), 2);
    assertEq(IERC721(beradrome).balanceOf(address(this)), 2);
    goldilend.boost(nfts, ids, goldilend.MONTH_DAYS() + 1);
    uint256[] memory ids2 = new uint256[](2);
    ids2[0] = 2;
    ids2[1] = 2;
    goldilend.boost(nfts, ids2, goldilend.MONTH_DAYS() + 1);
    vm.warp(goldilend.MONTH_DAYS() + 2);
    goldilend.withdrawBoost();
    Goldilend.Boost memory userBoost = goldilend.lookupBoost(address(this));
    assertEq(IERC721(honeycomb).balanceOf(address(this)), 2);
    assertEq(IERC721(beradrome).balanceOf(address(this)), 2);
    assertEq(IERC721(honeycomb).balanceOf(address(goldilend)), 0);
    assertEq(IERC721(beradrome).balanceOf(address(goldilend)), 0);
    assertEq(userBoost.expiry, 0);
    assertEq(userBoost.boostMagnitude, 0);
  }

  function testSingleBoostMultipleBoost() public {
    INFT(address(honeycomb)).mint(address(this));
    INFT(address(honeycomb)).mint(address(this));
    INFT(address(beradrome)).mint(address(this));
    address[] memory nfts = new address[](2);
    nfts[0] = address(honeycomb);
    nfts[1] = address(beradrome);
    uint256[] memory ids = new uint256[](2);
    ids[0] = 2;
    ids[1] = 1;
    IERC721(honeycomb).setApprovalForAll(address(goldilend), true);
    IERC721(beradrome).setApprovalForAll(address(goldilend), true);
    goldilend.boost(address(honeycomb), 1, goldilend.MONTH_DAYS() + 1);
    goldilend.boost(nfts, ids, goldilend.MONTH_DAYS() + 1);
    Goldilend.Boost memory userBoost = goldilend.lookupBoost(address(this));

    assertEq(IERC721(honeycomb).balanceOf(address(this)), 0);
    assertEq(IERC721(beradrome).balanceOf(address(this)), 0);
    assertEq(IERC721(honeycomb).balanceOf(address(goldilend)), 2);
    assertEq(IERC721(beradrome).balanceOf(address(goldilend)), 1);
    assertEq(userBoost.expiry, goldilend.MONTH_DAYS() + 1);
    assertEq(userBoost.boostMagnitude, 21);
  }

  function testSingleBoostSingleBoost() public {
    INFT(address(honeycomb)).mint(address(this));
    INFT(address(beradrome)).mint(address(this));
    IERC721(honeycomb).setApprovalForAll(address(goldilend), true);
    IERC721(beradrome).setApprovalForAll(address(goldilend), true);
    goldilend.boost(address(honeycomb), 1, goldilend.MONTH_DAYS() + 1);
    goldilend.boost(address(beradrome), 1, goldilend.MONTH_DAYS() + 1);
    Goldilend.Boost memory userBoost = goldilend.lookupBoost(address(this));

    assertEq(IERC721(honeycomb).balanceOf(address(this)), 0);
    assertEq(IERC721(beradrome).balanceOf(address(this)), 0);
    assertEq(IERC721(honeycomb).balanceOf(address(goldilend)), 1);
    assertEq(IERC721(beradrome).balanceOf(address(goldilend)), 1);
    assertEq(userBoost.expiry, goldilend.MONTH_DAYS() + 1);
    assertEq(userBoost.boostMagnitude, 15);
    assertEq(userBoost.partnerNFTs[0], address(honeycomb));
    assertEq(userBoost.partnerNFTs[1], address(beradrome));
  }

  function testSuccessfulLock() public {
    deal(address(bera), address(this), 100e18);
    bera.approve(address(goldilend), type(uint256).max);
    goldilend.lock(100e18);

    uint256 gberaBalance = goldilend.balanceOf(address(this));

    assertEq(gberaBalance, 100e18);
  }

  function testSetValue() public {
    uint256 val = 69e18;
    address[] memory nfts = new address[](2);
    nfts[0] = address(bondbear);
    nfts[1] = address(bandbear);
    uint256[] memory values = new uint256[](2);
    values[0] = 50;
    values[1] = 50;
    goldilend.setValue(val, nfts, values);

    uint256 totalVal = goldilend.totalValuation();
    uint256 bond = goldilend.nftFairValues(address(bondbear));
    uint256 band = goldilend.nftFairValues(address(bandbear));

    assertEq(totalVal, val);
    assertEq(bond, 50);
    assertEq(band, 50);
  }

  function testSetInterestRate() public {
    goldilend.setProtocolInterestRate(69e18);

    uint256 rate = goldilend.protocolInterestRate();

    assertEq(rate, 69e18);
  }

  function testEmergencyWithdraw() public {
    uint256 transferAmount = goldilend.poolSize() - goldilend.outstandingDebt();
    goldilend.emergencyWithdraw();

    uint256 goldilendBeraBalance = bera.balanceOf(address(goldilend));
    uint256 thisBeraBalance = bera.balanceOf(address(this));

    assertEq(goldilendBeraBalance, 0);
    assertEq(thisBeraBalance, transferAmount);
  }

  function testSingleBorrow() public dealUserBeras {
    goldilend.borrow(1e18, 1209600, address(bondbear), 1);
    
    Goldilend.Loan memory userLoan = goldilend.lookupLoan(address(this), 1);

    assertEq(userLoan.collateralNFTs[0], address(bondbear));
    assertEq(userLoan.collateralNFTIds[0], 1);
    assertEq(userLoan.borrowedAmount, 1e18 + singleBorrowInterest);
    assertEq(userLoan.interest, singleBorrowInterest);
    assertEq(userLoan.duration, 1209600);
    assertEq(userLoan.endDate, block.timestamp + 1209600);
    assertEq(userLoan.loanId, 1);
    assertEq(userLoan.liquidated, false);
  }

  function testMultipleBorrow() public dealUserBeras {
    address[] memory nfts = new address[](2);
    nfts[0] = address(bondbear);
    nfts[1] = address(bandbear);
    uint256[] memory ids = new uint256[](2);
    ids[0] = 1;
    ids[1] = 1;
    goldilend.borrow(1e18, 1209600, nfts, ids);
    
    Goldilend.Loan memory userLoan = goldilend.lookupLoan(address(this), 1);

    assertEq(userLoan.collateralNFTs[0], address(bondbear));
    assertEq(userLoan.collateralNFTIds[0], 1);
    assertEq(userLoan.collateralNFTs[1], address(bandbear));
    assertEq(userLoan.collateralNFTIds[1], 1);
    assertEq(userLoan.borrowedAmount, 1e18 + singleBorrowInterest);
    assertEq(userLoan.interest, singleBorrowInterest);
    assertEq(userLoan.duration, 1209600);
    assertEq(userLoan.endDate, block.timestamp + 1209600);
    assertEq(userLoan.loanId, 1);
    assertEq(userLoan.liquidated, false);
  }

  function testSingleBoostedBorrow() public dealUserBeras dealUserPartnerNFTs {
    goldilend.boost(address(honeycomb), 1, 2592002);
    goldilend.borrow(1e18, 1209600, address(bondbear), 1);
    
    Goldilend.Loan memory userLoan = goldilend.lookupLoan(address(this), 1);

    assertEq(userLoan.collateralNFTs[0], address(bondbear));
    assertEq(userLoan.collateralNFTIds[0], 1);
    assertEq(userLoan.borrowedAmount, 1e18 + singleBorrowInterestBoosted);
    assertEq(userLoan.interest, singleBorrowInterestBoosted);
    assertEq(userLoan.duration, 1209600);
    assertEq(userLoan.endDate, block.timestamp + 1209600);
    assertEq(userLoan.loanId, 1);
    assertEq(userLoan.liquidated, false);
  }

  function testSingleMaxBoostedBorrow() public dealUserBeras  {
    INFT(address(honeycomb)).mint(address(this));
    INFT(address(beradrome)).mint(address(this));
    INFT(address(beradrome)).mint(address(this));
    INFT(address(beradrome)).mint(address(this));
    INFT(address(beradrome)).mint(address(this));
    INFT(address(beradrome)).mint(address(this));
    address[] memory nfts = new address[](6);
    nfts[0] = address(honeycomb);
    nfts[1] = address(beradrome);
    nfts[2] = address(beradrome);
    nfts[3] = address(beradrome);
    nfts[4] = address(beradrome);
    nfts[5] = address(beradrome);
    uint256[] memory ids = new uint256[](6);
    ids[0] = 1;
    ids[1] = 1;
    ids[2] = 2;
    ids[3] = 3;
    ids[4] = 4;
    ids[5] = 5;
    IERC721(honeycomb).setApprovalForAll(address(goldilend), true);
    IERC721(beradrome).setApprovalForAll(address(goldilend), true);
    goldilend.boost(nfts, ids, 2592002);
    goldilend.borrow(1e18, 1209600, address(bondbear), 1);
    
    Goldilend.Loan memory userLoan = goldilend.lookupLoan(address(this), 1);

    assertEq(userLoan.collateralNFTs[0], address(bondbear));
    assertEq(userLoan.collateralNFTIds[0], 1);
    assertEq(userLoan.borrowedAmount, 1e18 + singleBorrowInterestMaxBoost);
    assertEq(userLoan.interest, singleBorrowInterestMaxBoost);
    assertEq(userLoan.duration, 1209600);
    assertEq(userLoan.endDate, block.timestamp + 1209600);
    assertEq(userLoan.loanId, 1);
    assertEq(userLoan.liquidated, false);
  }

  function testMultipleBoostedBorrow() public dealUserBeras dealUserPartnerNFTs {
    goldilend.boost(address(honeycomb), 1, 2592002);
    address[] memory nfts = new address[](2);
    nfts[0] = address(bondbear);
    nfts[1] = address(bandbear);
    uint256[] memory ids = new uint256[](2);
    ids[0] = 1;
    ids[1] = 1;
    goldilend.borrow(1e18, 1209600, nfts, ids);
    
    Goldilend.Loan memory userLoan = goldilend.lookupLoan(address(this), 1);

    assertEq(userLoan.collateralNFTs[0], address(bondbear));
    assertEq(userLoan.collateralNFTIds[0], 1);
    assertEq(userLoan.borrowedAmount, 1e18 + singleBorrowInterestBoosted);
    assertEq(userLoan.interest, singleBorrowInterestBoosted);
    assertEq(userLoan.duration, 1209600);
    assertEq(userLoan.endDate, block.timestamp + 1209600);
    assertEq(userLoan.loanId, 1);
    assertEq(userLoan.liquidated, false);
  }

  function testMultipleMaxBoostedBorrow() public dealUserBeras {
    INFT(address(honeycomb)).mint(address(this));
    INFT(address(beradrome)).mint(address(this));
    INFT(address(beradrome)).mint(address(this));
    INFT(address(beradrome)).mint(address(this));
    INFT(address(beradrome)).mint(address(this));
    INFT(address(beradrome)).mint(address(this));
    address[] memory nfts = new address[](6);
    nfts[0] = address(honeycomb);
    nfts[1] = address(beradrome);
    nfts[2] = address(beradrome);
    nfts[3] = address(beradrome);
    nfts[4] = address(beradrome);
    nfts[5] = address(beradrome);
    uint256[] memory ids = new uint256[](6);
    ids[0] = 1;
    ids[1] = 1;
    ids[2] = 2;
    ids[3] = 3;
    ids[4] = 4;
    ids[5] = 5;
    IERC721(honeycomb).setApprovalForAll(address(goldilend), true);
    IERC721(beradrome).setApprovalForAll(address(goldilend), true);
    goldilend.boost(nfts, ids, 2592002);
    address[] memory nftss = new address[](2);
    nftss[0] = address(bondbear);
    nftss[1] = address(bandbear);
    uint256[] memory idss = new uint256[](2);
    idss[0] = 1;
    idss[1] = 1;
    goldilend.borrow(1e18, 1209600, nftss, idss);
    
    Goldilend.Loan memory userLoan = goldilend.lookupLoan(address(this), 1);

    assertEq(userLoan.collateralNFTs[0], address(bondbear));
    assertEq(userLoan.collateralNFTIds[0], 1);
    assertEq(userLoan.borrowedAmount, 1e18 + singleBorrowInterestMaxBoost);
    assertEq(userLoan.interest, singleBorrowInterestMaxBoost);
    assertEq(userLoan.duration, 1209600);
    assertEq(userLoan.endDate, block.timestamp + 1209600);
    assertEq(userLoan.loanId, 1);
    assertEq(userLoan.liquidated, false);
  }

  function testSingleBorrowRepay() public dealUserBera dealUserBeras {
    uint256 startingPoolSize = 1000e18;
    goldilend.borrow(1e18, 1209600, address(bondbear), 1);
    Goldilend.Loan memory userLoanBefore = goldilend.lookupLoan(address(this), 1);
    goldilend.repay(1e18+userLoanBefore.interest, 1);

    Goldilend.Loan memory userLoan = goldilend.lookupLoan(address(this), 1);
    uint256 debt = goldilend.outstandingDebt();
    uint256 pool = goldilend.poolSize();

    assertEq(userLoan.collateralNFTs[0], address(bondbear));
    assertEq(userLoan.collateralNFTIds[0], 1);
    assertEq(userLoan.borrowedAmount, 0);
    assertEq(userLoan.interest, 0);
    assertEq(userLoan.duration, 1209600);
    assertEq(userLoan.endDate, block.timestamp + 1209600);
    assertEq(userLoan.loanId, 1);
    assertEq(userLoan.liquidated, false);
    assertEq(debt, 0);
    assertEq(pool, startingPoolSize + ((userLoanBefore.interest / 100) * 95) + 5e18);
  }

  function testMultipleBorrowRepay() public dealUserBera dealUserBeras {
    uint256 startingPoolSize = 1000e18;
    address[] memory nfts = new address[](2);
    nfts[0] = address(bondbear);
    nfts[1] = address(bandbear);
    uint256[] memory ids = new uint256[](2);
    ids[0] = 1;
    ids[1] = 1;
    goldilend.borrow(1e18, 1209600, nfts, ids);
    Goldilend.Loan memory userLoanBefore = goldilend.lookupLoan(address(this), 1);
    goldilend.repay(1e18+userLoanBefore.interest, 1);

    Goldilend.Loan memory userLoan = goldilend.lookupLoan(address(this), 1);
    uint256 debt = goldilend.outstandingDebt();
    uint256 pool = goldilend.poolSize();

    assertEq(userLoan.collateralNFTs[0], address(bondbear));
    assertEq(userLoan.collateralNFTIds[0], 1);
    assertEq(userLoan.borrowedAmount, 0);
    assertEq(userLoan.interest, 0);
    assertEq(userLoan.duration, 1209600);
    assertEq(userLoan.endDate, block.timestamp + 1209600);
    assertEq(userLoan.loanId, 1);
    assertEq(userLoan.liquidated, false);
    assertEq(debt, 0);
    assertEq(pool, startingPoolSize + ((userLoanBefore.interest / 100) * 95) + 5e18);
  }
  
  function testSingleBorrowLiquidate() public dealUserBera dealUserBeras {
    goldilend.borrow(1e18, 1209600, address(bondbear), 1);
    vm.warp(1209602);
    goldilend.liquidate(address(this), 1);

    Goldilend.Loan memory userLoan = goldilend.lookupLoan(address(this), 1);
    uint256 goldilendBondBalance = IERC721(address(bondbear)).balanceOf(address(goldilend));
    uint256 userBondBalance = IERC721(address(bondbear)).balanceOf(address(this));

    assertEq(userLoan.collateralNFTs[0], address(bondbear));
    assertEq(userLoan.collateralNFTIds[0], 1);
    assertEq(userLoan.borrowedAmount, 0);
    assertEq(userLoan.duration, 1209600);
    assertEq(userLoan.endDate, 1209601);
    assertEq(userLoan.loanId, 1);
    assertEq(userLoan.liquidated, true);
    assertEq(goldilendBondBalance, 0);
    assertEq(userBondBalance, 1);
  }

  function onERC721Received(
    address,
    address,
    uint256,
    bytes calldata
  ) external virtual returns (bytes4) {
    return IERC721Receiver.onERC721Received.selector;
  }

}