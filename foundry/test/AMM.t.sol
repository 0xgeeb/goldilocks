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
    locks = new Locks();
    amm = new AMM(address(locks));
    usdc = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    deal(address(usdc), address(this), 1000000e6, true);
    deal(address(locks), address(this), 100e18, true);
  }

  function testBuy() public {
    usdc.approve(address(amm), 10000000e6);
    uint256 result = amm.buy(50);
    console.log(result);
  }

  function testPriceImpact() public {
    usdc.approve(address(amm), 10000000e6);
    vm.expectRevert(bytes("price impact too large"));
    amm.buy(500);
  }

}