//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IAMM {

  function floorPrice() external view returns (uint256);
  function initialize(uint256 _fsl, uint256 _psl) external;
  function porridgeMint(address _to, uint256 _amount) external;

}