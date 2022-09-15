//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

// need to change allocations mappings to merkle tree hash system

contract LocksToken is ERC20("Locks Token", "LOCKS") {

  address public ammAddress;
  address public porridgeAddress;
  uint256 public startTime;
  uint256 public totalContribution;
  uint256 hardCap = 1000000;
  uint256 softCap = hardCap / 10;
  IERC20 usdc;

  mapping(address => uint256) public allocations;

  constructor(address _ammAddress, address _porridgeAddress) {
    ammAddress = _ammAddress;
    porridgeAddress = _porridgeAddress;
    usdc = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
  }

  event Contribution(address indexed user, uint256 indexed amountPaid, uint256 indexed amountRecieved);

  modifier onlyAdmin() {
    require(msg.sender == ammAddress || msg.sender == porridgeAddress, "not authorized");
    _;
  }

  function getHardCap() public view returns (uint256) {
    return hardCap;
  }

  function mint(address _to, uint256 _amount) public {
    require(totalSupply() + _amount <= hardCap, "mint would exceed hard cap");
    _mint(_to, _amount);
  }

  function burn(address _from, uint256 _amount) public {
    _burn(_from, _amount);
  }

  function setup() public onlyAdmin() {
    startTime = block.timestamp;
  }

  function contribute(uint256 _amount) public {
    require(_amount <= allocations[msg.sender],"insufficient allocations");
    require(totalContribution + _amount <= hardCap, "hardcap hit");
    require(usdc.balanceOf(msg.sender) >= _amount*(10**6) && usdc.allowance(msg.sender, address(this)) >= _amount*(10**6), "insufficient funds/allowance");
    require(block.timestamp - startTime < 24 hours, "presale has already concluded");
    allocations[msg.sender] -= _amount;
    usdc.transferFrom(msg.sender, address(this), _amount*(10**6));
    _mint(msg.sender, _amount*9/10);
    totalContribution += _amount;
    emit Contribution(msg.sender, _amount, _amount);
  }

}