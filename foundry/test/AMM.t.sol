//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../lib/forge-std/src/Test.sol";
import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { AMM } from "../src/AMM.sol";
import { Locks } from "../src/Locks.sol";
import { Honey } from "../src/Honey.sol";

contract AMMTest is Test {

  AMM amm;
  Locks locks;
  Honey honey;

  function setUp() public {
    locks = new Locks(address(this));
    amm = new AMM(address(locks), address(this));
    honey = new Honey();
    deal(address(honey), address(this), 10000000000000000e18, true);
    deal(address(locks), address(this), 1000000e18, true);
    deal(address(honey), address(locks), 100000000000000000000000000000000e18, true);
    locks.setAmmAddress(address(amm));
    locks.setHoneyAddress(address(honey));
    amm.setHoneyAddress(address(honey));
    honey.approve(address(amm), type(uint256).max);
    locks.transferToAMM(1600000e18, 400000e18);
  }

  function testMarketPrice() public {
    vm.store(address(amm), bytes32(uint256(2)), bytes32(uint256(10e18)));
    vm.store(address(amm), bytes32(uint256(3)), bytes32(uint256(5e18)));
    vm.store(address(amm), bytes32(uint256(5)), bytes32(uint256(4e18)));
    // uint256 regularResult = amm.marketPrice();
    uint256 soladyResult = amm.soladyMarketPrice();
    // console.log(regularResult);
    console.log(soladyResult);
  }

}