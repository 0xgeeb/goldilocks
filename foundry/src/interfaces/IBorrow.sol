//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IBorrow {

  function getLocked(address _user) external view returns (uint256);
  function getBorrowed(address _user) external view returns (uint256);
  function borrow(uint256 _amount) external returns (uint256);
  function repay(uint256 _amount) external;
  
}