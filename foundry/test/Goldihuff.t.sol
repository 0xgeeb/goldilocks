// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/foundry-huff/src/HuffDeployer.sol";
import "../lib/forge-std/src/Test.sol";

contract GoldihuffTest is Test {

  Goldihuff goldihuff;

  function setUp() public {
    goldihuff = Goldihuff(HuffDeployer.deploy("Goldihuff"));
  }

}

interface Goldihuff {
  function floorPrice(uint256,uint256) external returns (uint256);
  function marketPrice(uint256,uint256,uint256) external returns (uint256);
}