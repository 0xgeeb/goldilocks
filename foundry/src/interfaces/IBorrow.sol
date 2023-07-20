//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IBorrow {

  function getLocked(address user) external view returns (uint256);
  function getBorrowed(address user) external view returns (uint256);
  function borrowLimit(address user) external view returns (uint256);
  
  function borrow(uint256 amount) external;
  function repay(uint256 amount) external;
  
}