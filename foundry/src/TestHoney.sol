//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { ERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract TestHoney is ERC20("Test Honey", "THONEY") {

  function mint(address _to, uint256 _amount) external {
    _mint(_to, _amount);
  }

}