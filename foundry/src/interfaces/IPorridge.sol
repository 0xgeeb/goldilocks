//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IPorridge {
  
  function getStaked(address user) external view returns (uint256);
  function getStakeStartTime(address user) external view returns (uint256);
  function getClaimable(address user) external view returns (uint256);
  
  function stake(uint256 amount) external;
  function unstake(uint256 amount) external;
  function realize(uint256 amount) external;
  function claim() external;

}