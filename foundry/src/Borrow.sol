//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./AMM.sol";
import "./Locks.sol";
import "./Porridge.sol";

contract Borrow {

  AMM amm;
  Locks locks;
  Porridge porridge;
  IERC20 usdc;
  address public dev;

  mapping(address => uint256) public lockedLocks;
  mapping(address => uint256) public borrowedUsdc;

  uint256 public stableDecimals = 10e12;

  constructor(address _ammAddress, address _locksAddress, address _porridgeAddress, address _devAddress) {
    amm = AMM(_ammAddress);
    locks = Locks(_locksAddress);
    porridge = Porridge(_porridgeAddress);
    dev = _devAddress;
    usdc = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
  }

  function getLocked(address _user) public view returns (uint256) {
    return lockedLocks[_user];
  }

  function getBorrowed(address _user) public view returns (uint256) {
    return borrowedUsdc[_user];
  }

  function borrow(uint256 _amount) public {
    require(_amount > 0, "cannot borrow zero");
    uint256 _floorPrice = amm.fsl() / locks.totalSupply();
    uint256 _stakedLocks = porridge.getStaked(msg.sender);
    
    // this could be an issue with decimals adding together on multiplication and always being higher than amount and approving
    require(_floorPrice * _stakedLocks >= _amount, "insufficient borrow limit");

    lockedLocks[msg.sender] += _amount / _floorPrice;
    borrowedUsdc[msg.sender] += _amount;
    uint256 _fee = (_amount / 100) * 3;
    locks.transferFrom(address(porridge), address(this), _amount / _floorPrice);
    usdc.transferFrom(address(amm), msg.sender, (_amount - _fee) / stableDecimals);
    usdc.transferFrom(address(amm), dev, _fee / stableDecimals);
  }

  function repay(uint256 _amount) public {
    require(_amount > 0, "cannot repay zero");
    require(borrowedUsdc[msg.sender] >= _amount, "repaying too much");
    require(usdc.balanceOf(msg.sender) >= _amount / stableDecimals, "insufficient funds");
    lockedLocks[msg.sender] -= (_amount / borrowedUsdc[msg.sender]) * lockedLocks[msg.sender];
    borrowedUsdc[msg.sender] -= _amount;
    usdc.transferFrom(msg.sender, address(amm), _amount / stableDecimals);
    locks.transferFrom(address(this), address(porridge), (_amount / borrowedUsdc[msg.sender]) * lockedLocks[msg.sender]);
  }

}