// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Script } from "../lib/forge-std/src/Script.sol";
import { Porridge } from "../src/core/Porridge.sol";
import { Goldiswap } from  "../src/core/Goldiswap.sol";
import { Borrow } from "../src/core/Borrow.sol";
import { Goldilend } from "../src/core/Goldilend.sol";
import { Honey } from "../src/mock/Honey.sol";
import { ConsensusVault } from "../src/mock/ConsensusVault.sol";
import { Bera } from "../src/mock/Bera.sol";
import { HoneyComb } from "../src/mock/HoneyComb.sol";
import { Beradrome } from "../src/mock/Beradrome.sol";
import { BondBear } from "../src/mock/BondBear.sol";
import { BandBear } from "../src/mock/BandBear.sol";
import { BeraFaucet } from "../src/mock/BeraFaucet.sol";

contract DeployBetaScript is Script {

  Goldilend goldilend;
  Porridge porridge;
  Goldiswap goldiswap;
  Borrow borrow;
  Honey honey;
  Bera bera;
  ConsensusVault consensusvault;
  HoneyComb honeycomb;
  Beradrome beradrome;
  BondBear bondbear;
  BandBear bandbear;
  BeraFaucet berafaucet;
  address admin = 0x50A7dd4778724FbED41aCe9B3d3056a7B36E874C;
  uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

  function run() external {
    vm.startBroadcast(deployerPrivateKey);

    // honey = new Honey();
    // bera = new Bera();
    // honeycomb = new HoneyComb();
    // beradrome = new Beradrome();
    // bondbear = new BondBear();
    // bandbear = new BandBear();

    // consensusvault = new ConsensusVault(address(bera));
    // consensusvault = new ConsensusVault(0xB0F2B8A4A0C4c71e3623Aa95fFE1E09f4568FDAC);

    // berafaucet = new BeraFaucet(address(bondbear), address(bandbear), address(honeycomb), address(beradrome), address(bera));
    // berafaucet = new BeraFaucet(0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083, 0x853fE59f27A9AC25422Cb6cEFb116126468D3025, 0xc8CA5f855203a05773F8529367c35c7cF6676E70, 0x3017Fff986824372d26BE6c5695cB79414e0ca8c, 0xB0F2B8A4A0C4c71e3623Aa95fFE1E09f4568FDAC);

    // gamm = new GAMM(address(admin), address(honey));
    // gamm = new GAMM(admin, 0xeB7095ccbb4Ce4Bf72717e0fDc54f1a7f48E3F63);

    // borrow = new Borrow(address(gamm), address(admin), address(honey));
    // borrow = new Borrow(0x4d9dC113486aAafc4b40319eE05A128C792bb10C, admin, 0xeB7095ccbb4Ce4Bf72717e0fDc54f1a7f48E3F63);

    // porridge = new Porridge(address(gamm), address(borrow), address(admin), address(honey));
    // porridge = new Porridge(0x4d9dC113486aAafc4b40319eE05A128C792bb10C, 0x746ed951978a9eFBf47137E1F6844bd8740B3B96, admin, 0xeB7095ccbb4Ce4Bf72717e0fDc54f1a7f48E3F63);

    // gamm.setPorridgeAddress(address(porridge));
    // gamm.setBorrowAddress(address(borrow));
    // borrow.setPorridgeAddress(address(porridge));

    // uint256 startingPoolSize = 1000e18;
    // uint256 protocolInterestRate = 1e17;
    // // amount of porridge earned per gbera per second
    // // depends on what we want the initial apr
    // // apr will be a function of the bera and porridge prices
    // uint256 porridgeMultiple = 1e13;
    // address[] memory boostNfts = new address[](2);
    // // boostNfts[0] = address(honeycomb);
    // boostNfts[0] = 0xc8CA5f855203a05773F8529367c35c7cF6676E70;
    // // boostNfts[1] = address(beradrome);
    // boostNfts[1] = 0x3017Fff986824372d26BE6c5695cB79414e0ca8c;
    // uint8[] memory boosts = new uint8[](2);
    // boosts[0] = 6;
    // boosts[1] = 9;
    
    // goldilend = new Goldilend(
    //   startingPoolSize,
    //   protocolInterestRate,
    //   porridgeMultiple,
    //   // address(porridge),
    //   0x18A0Db5A6Ae6cBc317a11F8BD241fe1e9071dE5C,
    //   admin,
    //   // address(bera),
    //   0xB0F2B8A4A0C4c71e3623Aa95fFE1E09f4568FDAC,
    //   // address(consensusvault),
    //   0x06fc8931870719618c937BD3E0FF7F39553d0F94,
    //   boostNfts,
    //   boosts
    // );

    // address[] memory nfts = new address[](2);
    // // nfts[0] = address(bondbear);
    // nfts[0] = 0x9C3C3E7f882aFe6d9C63F4b84DDc1E434Dc8e083;
    
    // // nfts[1] = address(bandbear);
    // nfts[1] = 0x853fE59f27A9AC25422Cb6cEFb116126468D3025;

    // uint256[] memory values = new uint256[](2);
    // values[0] = 50;
    // values[1] = 50;

    // goldilend.setValue(100e18, nfts, values);
    // Goldilend(0xB5dfc873f71748073F965fF6e8d510F44707eCb5).setValue(100e18, nfts, values);

    // bera.mint(address(goldilend), startingPoolSize);
    // Bera(0xB0F2B8A4A0C4c71e3623Aa95fFE1E09f4568FDAC).mint(0xB5dfc873f71748073F965fF6e8d510F44707eCb5, 1000e18);

    // bera.mint(address(consensusvault), type(uint256).max / 2);
    // Bera(0xB0F2B8A4A0C4c71e3623Aa95fFE1E09f4568FDAC).mint(0x06fc8931870719618c937BD3E0FF7F39553d0F94, type(uint256).max / 2);

    // porridge.setGoldilendAddress(address(goldilend));
    
    vm.stopBroadcast();
  }

}