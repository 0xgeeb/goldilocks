//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract testAMM {

  uint256 public targetRatio = 260e15;
  uint256 public fsl = 1600000e18;
  uint256 public psl = 400000e18;
  uint256 public supply = 1000e18;
  uint256 public something = 69;

  function changeSomething(uint256 _something) public {
    something = _something;
  }

}