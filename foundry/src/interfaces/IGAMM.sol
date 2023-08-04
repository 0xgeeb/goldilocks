//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IGAMM {

  function floorPrice() external view returns (uint256);
  function marketPrice() external view returns (uint256);
  
  function buy(uint256 amount, uint256 maxAmount) external;
  function sell(uint256 amount, uint256 minAmount) external;
  function redeem(uint256 amount) external;

  function borrowTransfer(address to, uint256 amount, uint256 fee) external;
  function porridgeMint(address to, uint256 amount) external;
}