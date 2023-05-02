//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../lib/forge-std/src/Test.sol";
import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract DevnetTest is Test {

  IERC20 ooga;
  address user;

  function setUp() public {
    ooga = IERC20(0x34eC325ddC7dAeF8FdF07FdAF807C31f660cDD18);
    user = 0xAfD3A6AD0967f0dD590ABC5d4518A2920e642EEe;
  }
  
  function testBalance() public {
    uint256 balance = ooga.balanceOf(user);
    console.log(balance);
  }

}