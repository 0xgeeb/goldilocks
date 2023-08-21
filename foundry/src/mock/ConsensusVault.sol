//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { SafeTransferLib } from "../../lib/solady/src/utils/SafeTransferLib.sol";


contract ConsensusVault {

  address beraAddress;

  mapping(address => uint256) public staked;
  mapping(address => uint256) public rewards;

  error InvalidWithdraw();

  constructor(address _beraAddress) {
    beraAddress = _beraAddress;
  }

  function deposit(uint256 amount) external {
    staked[msg.sender] += amount;
    SafeTransferLib.safeTransferFrom(beraAddress, msg.sender, address(this), amount);
  }

  function withdraw(uint256 amount) external {
    if(amount > staked[msg.sender]) revert InvalidWithdraw();
    staked[msg.sender] -= amount;
    SafeTransferLib.safeTransfer(beraAddress, msg.sender, amount);
  }

  function claim() external {
    _claim();
  }

  function _claim() internal {

  }


}