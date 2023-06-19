//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Test.sol";
import { Honey } from "../src/test/Honey.sol";
import { GAMM } from "../src/GAMM.sol";
import { Borrow } from "../src/Borrow.sol";
import { Porridge } from "../src/Porridge.sol";

contract GAMMTest is Test {

  Honey honey;
  GAMM gamm;
  Borrow borrow;
  Porridge porridge;

  function setUp() public {
    honey = new Honey();
    gamm = new GAMM(address(honey), address(this));
    borrow = new Borrow(address(gamm), address(honey), address(this));
    porridge = new Porridge(address(gamm), address(borrow), address(honey), address(this));

    gamm.setPorridgeAddress(address(porridge));
    borrow.setPorridgeAddress(address(porridge));

    deal(address(honey), address(gamm), 1800000e18, true);
    deal(address(gamm), address(this), 5000e18, true);
  }

  function testMarketPrice() public {
    vm.store(address(gamm), bytes32(uint256(2)), bytes32(uint256(243457e18)));
    vm.store(address(gamm), bytes32(uint256(3)), bytes32(uint256(4645e18)));
    vm.store(address(gamm), bytes32(uint256(5)), bytes32(uint256(668e18)));
    uint256 regularResult = gamm.marketPrice();
    uint256 soladyResult = gamm.soladyMarketPrice(243457e18, 4645e18, 668e18);
    console.log(regularResult);
    console.log(soladyResult);
  }

  function testBuy1() public {
    gamm.buy(1e18, type(uint256).max);
  }
  
  function testBuy5() public {
    gamm.buy(5e18, type(uint256).max);
  }
  
  function testBuy10() public {
    gamm.buy(10e18, type(uint256).max);
  }
  
  function testBuy25() public {
    gamm.buy(25e18, type(uint256).max);
  }
  
  function testBuy50() public {
    gamm.buy(50e18, type(uint256).max);
  }
  
  function testBuy100() public {
    gamm.buy(100e18, type(uint256).max);
  }
  
  function testBuy500() public {
    gamm.buy(500e18, type(uint256).max);
  }
  
  function testBuy1000() public {
    gamm.buy(1000e18, type(uint256).max);
  }
  
  function testFlashLoanExploit() public {
    address blackhat = vm.addr(1);
    uint256 flashLoanAmount = 10000000e18;
    deal(address(honey), blackhat, flashLoanAmount);
    vm.prank(blackhat);
    honey.approve(address(gamm), type(uint256).max);
    vm.prank(blackhat);
    gamm.buy(1000e18, type(uint256).max);
    vm.prank(blackhat);
    gamm.sell(1000e18, 0);
    assert(honey.balanceOf(blackhat) < flashLoanAmount);
  }

}