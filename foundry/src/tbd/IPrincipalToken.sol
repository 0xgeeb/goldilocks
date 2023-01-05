//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IPrincipalToken {

  function totalSupply() external view returns (uint256);
  function balanceOf(address account) external view returns (uint256);
  function mint(address _to, uint256 _amount) external;
  function burn(address _to, uint256 _amount) external;

}