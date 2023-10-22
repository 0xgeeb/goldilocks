//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Reader {

  address public writer;
  uint256 x;

  constructor(address _writer) {
    writer = _writer;
  }

  function set(uint256 _x) external {
    require(msg.sender == writer, "not writer");
    x = _x;
  }
}