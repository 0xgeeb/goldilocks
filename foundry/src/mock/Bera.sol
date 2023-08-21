//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { ERC20 } from "../../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract Bera is ERC20("Bera", "BERA") {

  function mint(address _to, uint256 _amount) external {
    _mint(_to, _amount);
  }

  function burn(address _to, uint256 _amount) external {
    _burn(_to, _amount);
  }

}