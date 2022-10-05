//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Test.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "../src/AMM.sol";
import "../src/LocksToken.sol";

contract AMMTest is Test {

  AMM amm;
  LocksToken locks;
  IERC20 usdc;

  function setUp() public {
    locks = new LocksToken();
    amm = new AMM(address(locks));
    usdc = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
  }

  function testFloorRaise() public {
    uint256 pslfsl = amm.floorRaise();
    console.log(pslfsl);
  }




}