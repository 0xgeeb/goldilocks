// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

contract GoldiFaucet {

  uint256 public dailyDrip = 0.1 ether;
  mapping(address => uint256) public lastDrip;

  modifier canDrip() {
    require(block.timestamp >= lastDrip[msg.sender] + 1 days, "cant drip");
    _;
  }

  function drip() external canDrip {
    lastDrip[msg.sender] = block.timestamp;
    payable(msg.sender).transfer(dailyDrip);
  }

}