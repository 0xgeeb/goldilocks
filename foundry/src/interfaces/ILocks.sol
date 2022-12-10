//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface ILocks {

  function ammMint(address _to, uint256 _amount) external;
  function ammBurn(address _to, uint256 _amount) external;
  function porridgeMint(address _to, uint256 _amount) external;

}