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

  function setUp() public {
    honey = new Honey();
    bera = new Bera();
    honeycomb = new HoneyComb();
    beradrome = new Beradrome();
    bondbear = new BondBear();
    bandbear = new BandBear();
    consensusvault = new ConsensusVault(address(bera));
    
    gamm = new GAMM(address(honey), address(this));
    borrow = new Borrow(address(gamm), address(honey), address(this));
    porridge = new Porridge(address(gamm), address(borrow), address(honey));

    uint256 startingPoolSize = 69;
    uint256 protocolInterestRate = 15;
    address[] memory nfts = new address[](2);
    nfts[0] = address(honeycomb);
    nfts[1] = address(beradrome);
    uint8[] memory boosts = new uint8[](2);
    boosts[0] = 6;
    boosts[1] = 9;
    
    goldilend = new Goldilend(
      startingPoolSize,
      protocolInterestRate,
      // staking one gbera euqals one porridge ina year
      10,
      address(bera),
      address(porridge),
      address(this),
      address(this),
      nfts,
      boosts
    );
  }

  modifier dealUserBeras() {
    INFT(address(bondbear)).mint();
    INFT(address(bandbear)).mint();
    _;
  }

  function testTransferBeras() public dealUserBeras {
    IERC721(address(bondbear)).safeTransferFrom(address(this), address(goldilend), 1);
    IERC721(address(bandbear)).safeTransferFrom(address(this), address(goldilend), 1);

    uint256 goldilendBondBalance = IERC721(address(bondbear)).balanceOf(address(goldilend));
    uint256 goldilendBandBalance = IERC721(address(bandbear)).balanceOf(address(goldilend));

    assertEq(goldilendBondBalance + goldilendBandBalance, 2);
  }

  function testBorrow() public dealUserBeras {

  }

  function testCalculateClaim() public {
    deal(address(goldilend), address(this), 100e18);
    goldilend.approve(address(goldilend), 100e18);
    goldilend.stake(100e18);
    vm.warp(block.timestamp + (30 * porridge.DAYS_SECONDS()));

    uint256 userClaimable = goldilend.getClaimable(address(this));

    assertEq(userClaimable, 0);
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