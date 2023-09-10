//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Test.sol";
import { IERC721 } from "../lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import { IERC721Receiver } from "../lib/openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol";
import { INFT } from "../src/mock/INFT.sol";
import { Goldilend } from "../src/core/Goldilend.sol";
import { Porridge } from "../src/core/Porridge.sol";
import { GAMM } from "../src/core/GAMM.sol";
import { Borrow } from "../src/core/Borrow.sol"; 
import { Honey } from "../src/mock/Honey.sol";
import { ConsensusVault } from "../src/mock/ConsensusVault.sol";
import { Bera } from "../src/mock/Bera.sol";
import { HoneyComb } from "../src/mock/HoneyComb.sol";
import { Beradrome } from "../src/mock/Beradrome.sol";
import { BondBear } from "../src/mock/BondBear.sol";
import { BandBear } from "../src/mock/BandBear.sol";

contract GoldilendTest is Test, IERC721Receiver {

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
  bytes4 LoanNotFoundSelector = 0x0e7e621d;

  uint256 twoMonthsOfYield = 43e18;
  uint256 twoMonthsOfBoostedYield = 4945e16;

  function setUp() public {
    honey = new Honey();
    bera = new Bera();
    honeycomb = new HoneyComb();
    beradrome = new Beradrome();
    bondbear = new BondBear();
    bandbear = new BandBear();
    consensusvault = new ConsensusVault(address(bera));
    
    gamm = new GAMM(address(this), address(honey));
    borrow = new Borrow(address(gamm), address(this), address(honey));
    porridge = new Porridge(address(gamm), address(borrow), address(this), address(honey));

    gamm.setPorridgeAddress(address(porridge));
    gamm.setBorrowAddress(address(borrow));
    borrow.setPorridgeAddress(address(porridge));

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

    porridge.setGoldilendAddress(address(goldilend));
  }

  modifier dealUserBeras() {
    INFT(address(bondbear)).mint();
    INFT(address(bandbear)).mint();
    IERC721(bondbear).setApprovalForAll(address(goldilend), true);
    IERC721(bandbear).setApprovalForAll(address(goldilend), true);
    _;
  }

  modifier dealUserPartnerNFTs() {
    INFT(address(honeycomb)).mint();
    INFT(address(beradrome)).mint();
    IERC721(honeycomb).setApprovalForAll(address(goldilend), true);
    IERC721(beradrome).setApprovalForAll(address(goldilend), true);
    _;
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

  function testInvalidLoanAmount() public {
    vm.expectRevert(InvalidLoanAmountSelector);
    goldilend.borrow(101e18, 1209600, address(bondbear), 1);
  }

  function testCalculateFairValue() public {
    address[] memory nfts = new address[](2);
    nfts[0] = address(bondbear);
    nfts[1] = address(bandbear);

    uint256 fairValues = goldilend.getFairValues(nfts);

    assertEq(fairValues, 100e18);
  }

  function testLoanNotFound() public {
    vm.expectRevert(LoanNotFoundSelector);
    goldilend.lookupLoan(address(this), 1);
  }

  function testInvalidBoost() public {
    vm.expectRevert(InvalidBoostSelector);
    goldilend.withdrawBoost();
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
    INFT(address(honeycomb)).mint();
    INFT(address(honeycomb)).mint();
    INFT(address(beradrome)).mint();
    INFT(address(beradrome)).mint();
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
    INFT(address(honeycomb)).mint();
    INFT(address(honeycomb)).mint();
    INFT(address(beradrome)).mint();
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

  function testSuccessfulLock() public {
    deal(address(bera), address(this), 100e18);
    bera.approve(address(goldilend), type(uint256).max);
    goldilend.lock(100e18);

    uint256 gberaBalance = goldilend.balanceOf(address(this));

    assertEq(gberaBalance, 100e18);
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