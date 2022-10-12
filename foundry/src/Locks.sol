//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

// need to change allocations mappings to merkle tree hash system
// need to add onlyAdmin() modifier

contract Locks is ERC20("Locks Token", "LOCKS") {

  uint256 public startTime;
  uint256 public totalContribution;
  uint256 public hardCap = 1000000e18;
  IERC20 usdc;

  mapping(address => uint256) public allocations;

  constructor() {
    usdc = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
  }

  function getHardCap() public view returns (uint256) {
    return hardCap;
  }

  function mint(address _to, uint256 _amount) public {
    _mint(_to, _amount*(10**18));
  }

  function burn(address _from, uint256 _amount) public {
    _burn(_from, _amount*(10**18));
  }

  function setup() public {
    startTime = block.timestamp;
  }

  function contribute(uint256 _amount) public {
    require(_amount <= allocations[msg.sender],"insufficient allocations");
    require(totalContribution + _amount <= hardCap, "hardcap hit");
    require(usdc.balanceOf(msg.sender) >= _amount*(10**6), "insufficient funds");
    require(block.timestamp - startTime < 24 hours, "presale has already concluded");
    allocations[msg.sender] -= _amount;
    totalContribution += _amount;
    usdc.transferFrom(msg.sender, address(this), _amount*(10**6));
    _mint(msg.sender, _amount*9/10);
  }

}