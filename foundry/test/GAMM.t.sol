//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Test.sol";
import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { GAMM } from "../src/GAMM.sol";
import { Porridge } from "../src/Porridge.sol";
import { Borrow } from "../src/Borrow.sol";
import { Honey } from "../src/test/Honey.sol";

contract GAMMTest is Test {

  GAMM gamm;
  Honey honey;
  Porridge porridge;
  Borrow borrow;

  function setUp() public {
    honey = new Honey();
    gamm = new GAMM(address(this));
    borrow = new Borrow(address(gamm), address(this));
    porridge = new Porridge(address(gamm), address(borrow), address(this));
    deal(address(honey), address(this), 10000000000000000e18, true);
    deal(address(honey), address(gamm), 100000000000000000000000000000000e18, true);
    gamm.setHoneyAddress(address(honey));
    gamm.setPorridgeAddress(address(porridge));
    honey.approve(address(gamm), type(uint256).max);
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
  

}