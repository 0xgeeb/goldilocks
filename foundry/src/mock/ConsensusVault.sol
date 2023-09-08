//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { SafeTransferLib } from "../../lib/solady/src/utils/SafeTransferLib.sol";

contract ConsensusVault {

  address beraAddress;

  mapping(address => uint256) public staked;

  constructor(address _beraAddress) {
    beraAddress = _beraAddress;
  }

  function deposit(uint256 amount) external returns (uint256) {
    uint256 rewards = 5e18;
    staked[msg.sender] += amount;
    SafeTransferLib.safeTransferFrom(beraAddress, msg.sender, address(this), amount);
    SafeTransferLib.safeTransfer(beraAddress, msg.sender, rewards);
    return rewards;
  }

}