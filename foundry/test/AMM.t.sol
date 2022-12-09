//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Test.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "../src/AMM.sol";
import "../src/Locks.sol";

contract AMMTest is Test {

  AMM amm;
  Locks locks;
  IERC20 usdc;

  function setUp() public {
    locks = new Locks(address(this));
    amm = new AMM(address(locks), address(this));
    usdc = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    deal(address(usdc), address(this), 1000000e6, true);
    deal(address(locks), address(this), 1000000e18, true);
    deal(address(usdc), address(locks), 1000000e6, true);
    locks.setAmmAddress(address(amm));
  }

  function testBuy() public {
    locks.transferToAMM(8700000e18, 1900000e18);
    amm.updateSupply(2364e18);
    usdc.approve(address(amm), 10000000e6);
    (uint256 result, ) = amm.buy(5e18);
    assertEq(result, 5852730895767343661143);
  }

  function testMarketPrice() public {
    locks.transferToAMM(8700000e18, 1900000e18);
    amm.updateSupply(2364e18);
    uint256 fsl = 8700000e18;
    uint256 psl = 1900000e18;
    uint256 supply = 2364e18;
    uint256 result = amm._marketPrice(fsl, psl, supply);
    assertEq(result, 5838135059380809315810);
  }

  function testPurchase1() public {
    locks.transferToAMM(1600000e18, 400000e18);
    amm.updateSupply(1000e18);
    uint256 fsl = 1600000e18;
    uint256 psl = 400000e18;
    uint256 supply = 1000e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);
    uint256 bought = 0;
    while (bought < 400) {
      (uint256 market, uint256 floor) = amm.buy(10e18);
      console.log("market", market, "floor", floor);
      bought += 10;
      if (bought == 400) {
        assertEq(market, 8192298934682339084417);
      }
    }
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
    console.log('treasury: ', amm.treasuryValue());
  }

  function testPurchase2() public {
    locks.transferToAMM(1600000e18, 400000e18);
    amm.updateSupply(1000e18);
    uint256 fsl = 1600000e18;
    uint256 psl = 400000e18;
    uint256 supply = 1000e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);
    uint256 bought = 0;
    while(bought < 55e18) {
      (uint256 market, uint256 floor) = amm.buy(25e17);
      console.log("market", market, "floor", floor);
      bought += 25e17;
      if (bought == 55e18) {
        assertEq(market, 3073608937745290596199);
      }
    }
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
    console.log('treasury: ', amm.treasuryValue());    
  }

  function testPurchase3() public {
    locks.transferToAMM(1600000e18, 400000e18);
    amm.updateSupply(1000e18);
    uint256 fsl = 1600000e18;
    uint256 psl = 400000e18;
    uint256 supply = 1000e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);
    uint256 bought = 0;
    while(bought < 8000) {
      (uint256 market, uint256 floor) = amm.buy(40e18);
      console.log("market", market, "floor", floor);
      bought += 40;
      if (bought == 8000) {
        assertEq(market, 599017304714935805633347);
      }
    }
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
    console.log('treasury: ', amm.treasuryValue());    
  }

  function testPurchase4() public {
    locks.transferToAMM(8700000e18, 1900000e18);
    amm.updateSupply(2364e18);
    uint256 fsl = 8700000e18;
    uint256 psl = 1900000e18;
    uint256 supply = 2364e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);
    uint256 bought = 0;
    while(bought < 8000) {
      (uint256 market, uint256 floor) = amm.buy(40e18);
      console.log("market", market, "floor", floor);
      bought += 40;
      if (bought == 8000) {
        assertEq(market, 222277397198448458290986);
      }
    }
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
    console.log('treasury: ', amm.treasuryValue());    
  }

  function testMixed1() public {
    locks.transferToAMM(1600000e18, 400000e18);
    amm.updateSupply(1000e18);
    uint256 fsl = 1600000e18;
    uint256 psl = 400000e18;
    uint256 supply = 1000e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);

    (uint256 market, uint256 floor) = amm.buy(38e18);
    console.log("market", market, "floor", floor);

    (uint256 market1, uint256 floor1) = amm.sell(45e18);
    console.log("market", market1, "floor", floor1);

    (uint256 market2, uint256 floor2) = amm.sell(30e18);
    console.log("market", market2, "floor", floor2);

    (uint256 market3, uint256 floor3) = amm.buy(10e18);
    console.log("market", market3, "floor", floor3);

    (uint256 market4, uint256 floor4) = amm.sell(20e18);
    console.log("market", market4, "floor", floor4);

    (uint256 market5, uint256 floor5) = amm.sell(10e18);
    console.log("market", market5, "floor", floor5);

    (uint256 market6, uint256 floor6) = amm.buy(15e18);
    console.log("market", market6, "floor", floor6);

    (uint256 market7, uint256 floor7) = amm.sell(10e18);
    console.log("market", market7, "floor", floor7);

    (uint256 market8, uint256 floor8) = amm.sell(12e18);
    console.log("market", market8, "floor", floor8);

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

  function testMixed2() public {
    locks.transferToAMM(1600000e18, 400000e18);
    amm.updateSupply(1000e18);
    uint256 fsl = 1600000e18;
    uint256 psl = 400000e18;
    uint256 supply = 1000e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);

    (uint256 market, uint256 floor) = amm.buy(65e17);
    console.log("market", market, "floor", floor);

    amm.redeem(71e17);
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

    (uint256 market7, uint256 floor7) = amm.sell(6e18);
    console.log("market", market7, "floor", floor7);

    amm.redeem(32e17);
    console.log("market", amm._marketPrice(amm.fsl(), amm.psl(), amm.supply()), "floor", amm._floorPrice(amm.fsl(), amm.supply()));

    (uint256 market9, uint256 floor9) = amm.buy(4e18);
    console.log("market", market9, "floor", floor9);

    (uint256 market10, uint256 floor10) = amm.buy(10e18);
    console.log("market", market10, "floor", floor10);
  }

  function testMixed3() public {
    locks.transferToAMM(973000e18, 360000e18);
    amm.updateSupply(6780e18);
    uint256 fsl = 973000e18;
    uint256 psl = 360000e18;
    uint256 supply = 6780e18;
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

  function testRedeem1() public {
    locks.transferToAMM(1600000e18, 400000e18);
    amm.updateSupply(1000e18);
    uint256 fsl = 1600000e18;
    uint256 psl = 400000e18;
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

  function testRedeem2() public {
    locks.transferToAMM(1600000e18, 400000e18);
    amm.updateSupply(1000e18);
    uint256 fsl = 1600000e18;
    uint256 psl = 400000e18;
    uint256 supply = 1000e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);
    uint256 redeemed = 0;
    while(redeemed < 50e18) {
      amm.redeem(25e17);
      console.log("market", amm._marketPrice(amm.fsl(), amm.psl(), amm.supply()), "floor", amm._floorPrice(amm.fsl(), amm.supply()));
      redeemed += 25e17;
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

  function testSale1() public {
    locks.transferToAMM(1600000e18, 400000e18);
    amm.updateSupply(1000e18);
    uint256 fsl = 1600000e18;
    uint256 psl = 400000e18;
    uint256 supply = 1000e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);
    uint256 sold = 0;
    while(sold < 1800000e18) {
      (uint256 market, uint256 floor) = amm.sell(10e18);
      console.log("market", market, "floor", floor);
      sold += 10e18;
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

  function testSale2() public {
    locks.transferToAMM(1600000e18, 400000e18);
    amm.updateSupply(1000e18);
    uint256 fsl = 1600000e18;
    uint256 psl = 400000e18;
    uint256 supply = 1000e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);
    uint256 sold = 0;
    while(sold < 100e18) {
      (uint256 market, uint256 floor) = amm.sell(25e17);
      console.log("market", market, "floor", floor);
      sold += 25e17;
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
    console.log('treasury: ', amm.treasuryValue()); 
  }

  function testSale3() public {
    locks.transferToAMM(800000e18, 200000e18);
    amm.updateSupply(1000e18);
    uint256 fsl = 800000e18;
    uint256 psl = 200000e18;
    uint256 supply = 1000e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);
    uint256 sold = 0;
    while(sold < 800000e18) {
      (uint256 market, uint256 floor) = amm.sell(25e18);
      console.log("market", market, "floor", floor);
      sold += 25e18;
    }
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

  function testSale4() public {
    locks.transferToAMM(6300000e18, 3100000e18);
    amm.updateSupply(3124e18);
    uint256 fsl = 6300000e18;
    uint256 psl = 3100000e18;
    uint256 supply = 3124e18;
    uint256 initialMarketPrice = amm._marketPrice(fsl, psl, supply);
    console.log(initialMarketPrice);
    uint256 sold = 0;
    while(sold < 2000e18) {
      (uint256 market, uint256 floor) = amm.sell(285e17);
      console.log("market", market, "floor", floor);
      sold += 285e17;
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