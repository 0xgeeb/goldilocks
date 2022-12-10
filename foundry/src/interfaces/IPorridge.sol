//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IPorridge {
  
  function getStaked(address _user) external view returns (uint256);
  function stake(uint256 _amount) external;
  function unstake(uint256 _amount) external returns (uint256 _yield);
  function claim() external returns (uint256 _yield);
  function realize(uint256 _amount) external;

}