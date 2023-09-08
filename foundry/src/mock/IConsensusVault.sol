//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IConsensusVault {

  function deposit(uint256 amount) external returns (uint256);
}