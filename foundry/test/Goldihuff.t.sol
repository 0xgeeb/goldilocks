// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/foundry-huff/src/HuffDeployer.sol";
import "../lib/forge-std/src/Test.sol";

contract GoldihuffTest is Test {

  Goldihuff goldihuff;

  function setUp() public {
    goldihuff = Goldihuff(HuffDeployer.deploy("Goldihuff"));
  }

  function testHuffDivide() public {
    uint256 result = goldihuff.floorPrice(15, 5);
    console.log(result);
  }

  function testNormalDivide() public {
    uint256 result = divide(15, 5);
    console.log(result);
  }

  function testHuffDivideGas() public {
    goldihuff.floorPrice(10, 5);
  }

  function testNormalDivideGas() public {
    divide(10, 5);
  }

  function divide(uint256 a, uint256 b) public returns (uint256) {
    return a / b;
  }

}

interface Goldihuff {
  function floorPrice(uint256,uint256) external returns (uint256);
  function marketPrice(uint256,uint256,uint256) external returns (uint256);
}