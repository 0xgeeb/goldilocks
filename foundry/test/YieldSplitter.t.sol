//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { Test } from "../lib/forge-std/src/Test.sol";
import { console } from "../lib/forge-std/src/console.sol";
import { YieldSplitter } from "../src/YieldSplitter.sol";
import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { IPrincipalToken } from "../src/interfaces/IPrincipalToken.sol";
import { IYieldToken } from "../src/interfaces/IYieldToken.sol";
import { PrincipalToken } from "../src/PrincipalToken.sol";
import { YieldToken } from "../src/YieldToken.sol";

contract YieldSplitterTest is Test {

  YieldSplitter yieldsplitter;
  PrincipalToken principaltoken;
  YieldToken yieldtoken;

  function setUp() public {
    yieldsplitter = new YieldSplitter(1638352800, 1638871200); // 2012-12-01 10:00:00, 2012-12-07 10:00:00
    principaltoken = new PrincipalToken(address(yieldsplitter));
    yieldtoken = new YieldToken(address(yieldsplitter));
    yieldsplitter.setUpTokens(address(principaltoken), address(yieldtoken));
    // deal(address(locks), address(this), 1000000e18, true);
  }

}