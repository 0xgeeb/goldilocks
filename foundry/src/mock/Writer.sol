//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Reader } from "./Reader.sol";

contract Writer {

  address public reader;

  constructor(address _reader) {
    reader = _reader;
  }

  function set(uint256 x) external {
    Reader(reader).set(x);
  }

}