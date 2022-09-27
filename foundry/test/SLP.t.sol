//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Test.sol";
import "../src/SLP.sol";
import "../src/LocksToken.sol";

contract SLPTest is Test {

  SLP slp;
  LocksToken locks;

  function setUp() public {
    locks = new LocksToken();
    slp = new SLP(address(locks));
  }

  function testPurchaseTen() public {
    uint256 result = slp.purchase(10);
    console.log(result);
  }

  function testmPurchaseTen() public {
    uint256 mresult = slp.mpurchase(10);
    console.log(mresult);
  }

  function testFloorPrice() public {
    uint256 fpresult = slp.floorPrice(75e18, 110e18);
    console.log(fpresult);
  }


}