//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Test.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "../src/AMM.sol";
import "../src/Locks.sol";

contract AMMOldTest is Test {

  AMM amm;
  Locks locks;
  IERC20 honey;

  function setUp() public {
    locks = new Locks(address(this));
    amm = new AMM(address(locks), address(this));
    honey = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);
    deal(address(honey), address(this), 1000000e18, true);
    deal(address(locks), address(this), 1000000e18, true);
    deal(address(honey), address(locks), 1000000e18, true);
    locks.setAmmAddress(address(amm));
  }

  function testNewPurchase1() public {
    locks.transferToAMM(951e17, 49e17);
    amm.updateSupply(1e18);
    uint256 fsl = 951e17;
    uint256 psl = 49e17;
    uint256 supply = 1e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);
    uint256 bought = 0;
    while(bought < 10000) {
      (uint256 market, uint256 floor) = amm.buy(10e18);
      console.log("market", market, "floor", floor);
      bought += 10;
    }
    console.log('fsl: ', amm.fsl());
    console.log('psl: ', amm.psl());
    console.log('supply: ', amm.supply());    
  }

  function testNewPurchase2() public {
    locks.transferToAMM(951e17, 49e17);
    amm.updateSupply(1e18);
    uint256 fsl = 951e17;
    uint256 psl = 49e17;
    uint256 supply = 1e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);
    uint256 bought = 0;
    while(bought < 10000e18) {
      (uint256 market, uint256 floor) = amm.buy(125e17);
      console.log("market", market, "floor", floor);
      bought += 125e17;
    }
    console.log('fsl: ', amm.fsl());
    console.log('psl: ', amm.psl());
    console.log('supply: ', amm.supply());    
  }

  // this test requires you to change the line in the AMM buy function from if (_treasuryValue >= 100e18) { to if (_treasuryValue >= 500000e18) {
  function testNewPurchase3() public {
    locks.transferToAMM(951e17, 49e17);
    amm.updateSupply(1e18);
    uint256 fsl = 951e17;
    uint256 psl = 49e17;
    uint256 supply = 1e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);
    uint256 bought = 0;
    while(bought < 10000e18) {
      (uint256 market, uint256 floor) = amm.buy(125e17);
      console.log("market", market, "floor", floor);
      bought += 125e17;
    }
    console.log('fsl: ', amm.fsl());
    console.log('psl: ', amm.psl());
    console.log('supply: ', amm.supply()); 
  }

  function testNewPurchase4() public {
    locks.transferToAMM(100000e18, 25250e18);
    amm.updateSupply(157e18);
    uint256 fsl = 100000e18;
    uint256 psl = 25250e18;
    uint256 supply = 157e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);
    uint256 bought = 0;
    while(bought < 10000e18) {
      (uint256 market, uint256 floor) = amm.buy(125e17);
      console.log("market", market, "floor", floor);
      bought += 125e17;
    }
    console.log('fsl: ', amm.fsl());
    console.log('psl: ', amm.psl());
    console.log('supply: ', amm.supply());    
  }

  function testNewMixed1() public {
    locks.transferToAMM(951e17, 49e17);
    amm.updateSupply(1e18);
    uint256 fsl = 951e17;
    uint256 psl = 49e17;
    uint256 supply = 1e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);

    (uint256 market, uint256 floor) = amm.buy(100e18);
    console.log("market", market, "floor", floor);

    (uint256 market1, uint256 floor1) = amm.sell(45e18);
    console.log("market", market1, "floor", floor1);

    (uint256 market2, uint256 floor2) = amm.sell(30e18);
    console.log("market", market2, "floor", floor2);

    (uint256 market3, uint256 floor3) = amm.buy(20e18);
    console.log("market", market3, "floor", floor3);

    (uint256 market4, uint256 floor4) = amm.sell(10e18);
    console.log("market", market4, "floor", floor4);

    (uint256 market5, uint256 floor5) = amm.sell(10e18);
    console.log("market", market5, "floor", floor5);

    (uint256 market6, uint256 floor6) = amm.buy(15e18);
    console.log("market", market6, "floor", floor6);

    (uint256 market7, uint256 floor7) = amm.sell(12e18);
    console.log("market", market7, "floor", floor7);

    (uint256 market9, uint256 floor9) = amm.buy(45e18);
    console.log("market", market9, "floor", floor9);

    (uint256 market10, uint256 floor10) = amm.buy(8e18);
    console.log("market", market10, "floor", floor10);

    (uint256 market11, uint256 floor11) = amm.sell(8e18);
    console.log("market", market11, "floor", floor11);

    (uint256 market12, uint256 floor12) = amm.buy(45e18);
    console.log("market", market12, "floor", floor12);

    (uint256 market13, uint256 floor13) = amm.buy(45e18);
    console.log("market", market13, "floor", floor13);

    (uint256 market14, uint256 floor14) = amm.buy(45e18);
    console.log("market", market14, "floor", floor14);
    
    (uint256 market15, uint256 floor15) = amm.sell(25e18);
    console.log("market", market15, "floor", floor15);

    (uint256 market16, uint256 floor16) = amm.buy(45e18);
    console.log("market", market16, "floor", floor16);

    (uint256 market17, uint256 floor17) = amm.buy(45e18);
    console.log("market", market17, "floor", floor17);

    (uint256 market18, uint256 floor18) = amm.buy(12e18);
    console.log("market", market18, "floor", floor18);

    (uint256 market19, uint256 floor19) = amm.sell(48e18);
    console.log("market", market19, "floor", floor19);
  }

  function testNewMixed2() public {
    locks.transferToAMM(951e17, 49e17);
    amm.updateSupply(1e18);
    uint256 fsl = 951e17;
    uint256 psl = 49e17;
    uint256 supply = 1e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);

    (uint256 market, uint256 floor) = amm.buy(65e17);
    console.log("market", market, "floor", floor);

    amm.redeem(21e17);
    console.log("market", amm._marketPrice(amm.fsl(), amm.psl(), amm.supply()), "floor", amm._floorPrice(amm.fsl(), amm.supply()));

    (uint256 market2, uint256 floor2) = amm.buy(32e17);
    console.log("market", market2, "floor", floor2);

    amm.redeem(29e17);
    console.log("market", amm._marketPrice(amm.fsl(), amm.psl(), amm.supply()), "floor", amm._floorPrice(amm.fsl(), amm.supply()));

    (uint256 market4, uint256 floor4) = amm.buy(5e18);
    console.log("market", market4, "floor", floor4);

    (uint256 market5, uint256 floor5) = amm.sell(31e17);
    console.log("market", market5, "floor", floor5);

    (uint256 market6, uint256 floor6) = amm.buy(28e17);
    console.log("market", market6, "floor", floor6);

    (uint256 market7, uint256 floor7) = amm.sell(4e18);
    console.log("market", market7, "floor", floor7);

    amm.redeem(32e17);
    console.log("market", amm._marketPrice(amm.fsl(), amm.psl(), amm.supply()), "floor", amm._floorPrice(amm.fsl(), amm.supply()));

    (uint256 market9, uint256 floor9) = amm.buy(4e18);
    console.log("market", market9, "floor", floor9);

    (uint256 market10, uint256 floor10) = amm.buy(10e18);
    console.log("market", market10, "floor", floor10);
  }

  function testNewMixed3() public {
    locks.transferToAMM(951e17, 49e17);
    amm.updateSupply(1e18);
    uint256 fsl = 951e17;
    uint256 psl = 49e17;
    uint256 supply = 1e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);

    (uint256 market, uint256 floor) = amm.buy(6523e17);
    console.log("market", market, "floor", floor);

    amm.redeem(719e17);
    console.log("market", amm._marketPrice(amm.fsl(), amm.psl(), amm.supply()), "floor", amm._floorPrice(amm.fsl(), amm.supply()));

    (uint256 market2, uint256 floor2) = amm.buy(32e18);
    console.log("market", market2, "floor", floor2);

    amm.redeem(298e18);
    console.log("market", amm._marketPrice(amm.fsl(), amm.psl(), amm.supply()), "floor", amm._floorPrice(amm.fsl(), amm.supply()));

    (uint256 market4, uint256 floor4) = amm.buy(53e18);
    console.log("market", market4, "floor", floor4);

    (uint256 market5, uint256 floor5) = amm.sell(317e17);
    console.log("market", market5, "floor", floor5);

    (uint256 market6, uint256 floor6) = amm.buy(286e18);
    console.log("market", market6, "floor", floor6);

    (uint256 market7, uint256 floor7) = amm.sell(651e17);
    console.log("market", market7, "floor", floor7);

    amm.redeem(32e18);
    console.log("market", amm._marketPrice(amm.fsl(), amm.psl(), amm.supply()), "floor", amm._floorPrice(amm.fsl(), amm.supply()));

    (uint256 market9, uint256 floor9) = amm.buy(47e17);
    console.log("market", market9, "floor", floor9);

    (uint256 market10, uint256 floor10) = amm.buy(123e18);
    console.log("market", market10, "floor", floor10);
  }

  function testNewRedeem1() public {
    locks.transferToAMM(951e17, 49e17);
    amm.updateSupply(1000e18);
    uint256 fsl = 951e17;
    uint256 psl = 49e17;
    uint256 supply = 1000e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);
    uint256 redeemed = 0;
    while(redeemed < 400) {
      amm.redeem(10e18);
      console.log("market", amm._marketPrice(amm.fsl(), amm.psl(), amm.supply()), "floor", amm._floorPrice(amm.fsl(), amm.supply()));
      redeemed += 10;
    }
  }

  function testNewRedeem2() public {
    locks.transferToAMM(951e17, 49e17);
    amm.updateSupply(100e18);
    uint256 fsl = 951e17;
    uint256 psl = 49e17;
    uint256 supply = 100e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);
    uint256 redeemed = 0;
    while(redeemed < 50e18) {
      amm.redeem(25e17);
      console.log("market", amm._marketPrice(amm.fsl(), amm.psl(), amm.supply()), "floor", amm._floorPrice(amm.fsl(), amm.supply()));
      redeemed += 25e17;
    }
  }

  function testNewSale1() public {
    locks.transferToAMM(1600000e18, 400000e18);
    amm.updateSupply(1000e18);
    uint256 fsl = 1600000e18;
    uint256 psl = 400000e18;
    uint256 supply = 1000e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);
    uint256 sold = 0;
    while(sold < 900e18) {
      (uint256 market, uint256 floor) = amm.sell(10e18);
      console.log("market", market, "floor", floor);
      sold += 10e18;
    }
  }


  function testNewSale2() public {
    locks.transferToAMM(951e17, 49e17);
    amm.updateSupply(1000e18);
    uint256 fsl = 951e17;
    uint256 psl = 49e17;
    uint256 supply = 1000e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);
    uint256 sold = 0;
    while(sold < 100e18) {
      (uint256 market, uint256 floor) = amm.sell(25e17);
      console.log("market", market, "floor", floor);
      sold += 25e17;
    }
    console.log('fsl: ', amm.fsl());
    console.log('psl: ', amm.psl());
    console.log('supply: ', amm.supply());
  }

  function testNewSale3() public {
    locks.transferToAMM(800000e18, 200000e18);
    amm.updateSupply(1000e18);
    uint256 fsl = 800000e18;
    uint256 psl = 200000e18;
    uint256 supply = 1000e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);
    uint256 sold = 0;
    while(sold < 800000) {
      (uint256 market, uint256 floor) = amm.sell(25e18);
      console.log("market", market, "floor", floor);
      sold += 25;
    }
  }

  function testNewSale4() public {
    locks.transferToAMM(198576e18, 28573e18);
    amm.updateSupply(3700e18);
    uint256 fsl = 198576e18;
    uint256 psl = 28573e18;
    uint256 supply = 3700e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);
    uint256 sold = 0;
    while(sold < 2000e18) {
      (uint256 market, uint256 floor) = amm.sell(285e17);
      console.log("market", market, "floor", floor);
      sold += 285e17;
    }
  }
  
}