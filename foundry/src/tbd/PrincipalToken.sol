//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { ERC20 } from "../../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract PrincipalToken is ERC20("Principal Token", "PT") {

  address public yieldSplitterAddress;

  constructor(address _yieldSplitterAddress) {
    yieldSplitterAddress = _yieldSplitterAddress;
  }

  modifier onlyYieldSplitter() {
    require(msg.sender == yieldSplitterAddress, "not the yieldSplitter");
    _;
  }

  function mint(address _to, uint256 _amount) external onlyYieldSplitter {
    _mint(_to, _amount);
  }

  function burn(address _to, uint256 _amount) external onlyYieldSplitter {
    _burn(_to, _amount);
  }

}