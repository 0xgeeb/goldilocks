//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IAMM {

  function floorPrice() external view returns (uint256);
  function initialize(uint256 _fsl, uint256 _psl) external;

}