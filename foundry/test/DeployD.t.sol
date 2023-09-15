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

contract DeployDTest is Test {


  function setUp() public {
    // honey = new Honey();
    // bera = new Bera();
    // honeycomb = new HoneyComb();
    // beradrome = new Beradrome();hen dealing with outbreaks, & your co
    // bondbear = new BondBear();
    // bandbear = new BandBear();
    // consensusvault = new ConsensusVault(address(bera));
    
    // gamm = new GAMM(address(this), address(honey));
    // borrow = new Borrow(address(gamm), address(this), address(honey));
    // porridge = new Porridge(address(gamm), address(borrow), address(this), address(honey));  
  }
}