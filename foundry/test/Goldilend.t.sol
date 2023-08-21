//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Test.sol";
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

contract GoldilendTest is Test {

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
    bera = new Bera();
    honey = new Honey();
    honeycomb = new HoneyComb();
    beradrome = new Beradrome();
    bondbear = new BondBear();
    bandbear = new BandBear();
    consensusvault = new ConsensusVault(address(bera));
    
    gamm = new GAMM(address(honey), address(this));
    borrow = new Borrow(address(gamm), address(honey), address(this));
    porridge = new Porridge(address(gamm), address(borrow), address(honey));

    address[] memory nfts = new address[](2);
    nfts[0] = address(honeycomb);
    nfts[1] = address(beradrome);
    uint8[] memory boosts = new uint8[](2);
    boosts[0] = 6;
    boosts[1] = 9;
    
    goldilend = new Goldilend(
      69,
      15,
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

  function testBorrow() public dealUserBeras {

  }

}