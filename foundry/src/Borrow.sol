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
  IERC20 stable;
  address public adminAddress;

  mapping(address => uint256) public lockedLocks;
  mapping(address => uint256) public borrowedStables;

  uint256 public stableDecimals = 1e12;

  constructor(address _ammAddress, address _locksAddress, address _adminAddress) {
    amm = AMM(_ammAddress);
    locks = Locks(_locksAddress);
    adminAddress = _adminAddress;
    stable = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
  }

  modifier onlyAdmin() {
    require(msg.sender == adminAddress, "not admin");
    _;
  }

  function getLocked(address _user) public view returns (uint256) {
    return lockedLocks[_user];
  }

  function getBorrowed(address _user) public view returns (uint256) {
    return borrowedStables[_user];
  }

  function borrow(uint256 _amount) public returns (uint256) {
    require(_amount > 0, "cannot borrow zero");
    uint256 _floorPrice = amm.floorPrice();
    uint256 _stakedLocks = porridge.getStaked(msg.sender);
    require((_floorPrice * _stakedLocks) / (1e18) >= _amount, "insufficient borrow limit");
    lockedLocks[msg.sender] += (_amount * (1e18)) / _floorPrice;
    borrowedStables[msg.sender] += _amount / stableDecimals;
    uint256 _fee = (_amount / 100) * 3;
    locks.transferFrom(address(porridge), address(this), (_amount * (1e18)) / _floorPrice);
    stable.transferFrom(address(amm), msg.sender, (_amount - _fee) / stableDecimals);
    stable.transferFrom(address(amm), adminAddress, _fee / stableDecimals);
    return (_amount - _fee) / stableDecimals;
  }

  function repay(uint256 _amount) public {
    require(_amount > 0, "cannot repay zero");
    require(borrowedStables[msg.sender] >= _amount / stableDecimals, "repaying too much");
    uint256 _repaidLocks = (_amount / (borrowedStables[msg.sender] * stableDecimals)) * lockedLocks[msg.sender];
    uint256 _repaidStables = _amount / stableDecimals;
    lockedLocks[msg.sender] -= _repaidLocks;
    borrowedStables[msg.sender] -= _repaidStables;
    stable.transferFrom(msg.sender, address(amm), _repaidStables);
    locks.transfer(address(porridge), _repaidLocks);
  }

  function setPorridge(address _porridgeAddress) public {
    porridge = Porridge(_porridgeAddress);
  }

  function updateStable(address _stableAddress, uint256 _stableDecimals) public onlyAdmin {
    stable = IERC20(_stableAddress);
    stableDecimals = _stableDecimals;
  }

}