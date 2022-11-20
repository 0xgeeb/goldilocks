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
    locks.transferToAMM();
  }

  function testBuy() public {
    usdc.approve(address(amm), 10000000e6);
    uint256 result = amm.buy(36e18);
    assertEq(result, 3026098660859884570876);
  }

  function testMarketPrice() public {
    uint256 fsl = 1600000 * 1e18;
    uint256 psl = 400000 * 1e18;
    uint256 supply = 1000 * 1e18;
    uint256 result = amm._marketPrice(fsl, psl, supply);
    assertEq(result, 2820703125000000000000);
  }

  function testPython1() public {
    uint256 bought = 0;
    while(bought < 2000) {
      uint256 result = amm.buy(10e18);
      console.log(result);
      bought += 10;
    }
  }

  function testPython2() public {

  }

  function testPython3() public {
    uint256 result1 = amm.buy(38e18);
    console.log(result1);
    uint256 result2 = amm.sell(5e18);
    console.log(result2);
    uint256 result3 = amm.sell(30e18);
    console.log(result3);
    uint256 result4 = amm.buy(10e18);
    console.log(result4);
    uint256 result5 = amm.sell(20e18);
    console.log(result5);
    uint256 result6 = amm.sell(10e18);
    console.log(result6);
    uint256 result7 = amm.buy(15e18);
    console.log(result7);
    uint256 result8 = amm.sell(10e18);
    console.log(result8);
    uint256 result9 = amm.sell(12e18);
    console.log(result9);
    uint256 result10 = amm.buy(45e18);
    console.log(result10);
    uint256 result11 = amm.buy(8e18);
    console.log(result11);
    uint256 result12 = amm.sell(8e18);
    console.log(result12);
    uint256 result13 = amm.buy(45e18);
    console.log(result13);
    uint256 result14 = amm.buy(45e18);
    console.log(result14);
    uint256 result15 = amm.buy(45e18);
    console.log(result15);
    uint256 result16 = amm.sell(25e18);
    console.log(result16);
    uint256 result17 = amm.buy(45e18);
    console.log(result17);
    uint256 result18 = amm.buy(45e18);
    console.log(result18);
    uint256 result19 = amm.buy(12e18);
    console.log(result19);
    uint256 result20 = amm.sell(48e18);
    console.log(result20);
  }

}