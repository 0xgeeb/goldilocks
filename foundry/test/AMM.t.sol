//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../lib/forge-std/src/Test.sol";
import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { AMM } from "../src/AMM.sol";
import { Porridge } from "../src/Porridge.sol";
import { Borrow } from "../src/Borrow.sol";
import { Honey } from "../src/test/Honey.sol";

contract AMMTest is Test {

  AMM amm;
  Honey honey;
  Porridge porridge;
  Borrow borrow;

  function setUp() public {
    honey = new Honey();
    amm = new AMM(address(this));
    borrow = new Borrow(address(amm), address(this));
    porridge = new Porridge(address(amm), address(borrow), address(this));
    deal(address(honey), address(this), 10000000000000000e18, true);
    deal(address(honey), address(amm), 100000000000000000000000000000000e18, true);
    amm.setHoneyAddress(address(honey));
    amm.setPorridgeAddress(address(porridge));
    honey.approve(address(amm), type(uint256).max);
  }

  function testMarketPrice() public {
    vm.store(address(amm), bytes32(uint256(2)), bytes32(uint256(243457e18)));
    vm.store(address(amm), bytes32(uint256(3)), bytes32(uint256(4645e18)));
    vm.store(address(amm), bytes32(uint256(5)), bytes32(uint256(668e18)));
    uint256 regularResult = amm.marketPrice();
    uint256 soladyResult = amm.soladyMarketPrice(243457e18, 4645e18, 668e18);
    console.log(regularResult);
    console.log(soladyResult);
  }

  function testBuyStarbucks() public {
    (uint256 market, uint256 floor) = amm.buy(5000e18, type(uint256).max);
  }

}