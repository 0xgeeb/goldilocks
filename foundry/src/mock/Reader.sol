//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Reader {

  address public writer;
  address public random;
  uint256 x;

  constructor(address _writer, address _random) {
    writer = _writer;
    random = _random;
  }

  function set(uint256 _x) external {
    require(msg.sender == writer, "not writer");
    x = _x;
  }
}