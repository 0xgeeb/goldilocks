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

  function testPurchase3() public {
    locks.transferToAMM(1600000e18, 400000e18);
    amm.updateSupply(1000e18);
    uint256 fsl = 1600000e18;
    uint256 psl = 400000e18;
    uint256 supply = 1000e18;
    uint256 markyPricy = amm._marketPrice(fsl, psl, supply);
    console.log(markyPricy);
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

  function testPurchase4() public {
    locks.transferToAMM(8700000e18, 1900000e18);
    amm.updateSupply(2364e18);
    uint256 fsl = 8700000e18;
    uint256 psl = 1900000e18;
    uint256 supply = 2364e18;
    uint256 markyPricy = amm._marketPrice(fsl, psl, supply);
    console.log(markyPricy);
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

}