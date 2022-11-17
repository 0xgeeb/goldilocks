//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./Locks.sol";

contract AMM {

  IERC20 stable;
  Locks locks;
  uint256 public targetRatio = 3e17;
  uint256 public fsl = 1600000e18;
  uint256 public psl = 400000e18;
  uint256 public supply = 1000e18;
  uint256 public lastFloorRaise;
  uint256 public lastFloorDecrease;
  address public adminAddress;
  uint256 public stableDecimals = 1e12;

  constructor(address _locksAddress, address _adminAddress) {
    locks = Locks(_locksAddress);
    adminAddress = _adminAddress;
    stable = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    lastFloorRaise = block.timestamp;
  }

  modifier onlyAdmin() {
    require(msg.sender == adminAddress, "not admin");
    _;
  }

  modifier onlyLocks() {
    require(msg.sender == address(locks), "not locks");
    _;
  }

  function floorPrice() public view returns (uint256) {
    return (fsl*(1e18)) / locks.totalSupply();
  }

  function initialize() public onlyLocks {
    fsl = 1600000e18;
    psl = 400000e18;
  }
  
  function buy(uint256 _amount) public returns (uint256) {
    uint256 _supply = supply;
    require(_amount <= _supply / 20, "price impact too large");
    uint256 _leftover = _amount;
    uint256 _fsl = fsl;
    uint256 _psl = psl;
    uint256 _purchasePrice;
    uint256 _market;
    uint256 _floor;
    while(_leftover >= 1e18) {
      _market = _marketPrice(_fsl, _psl, _supply);
      _floor = _floorPrice(_fsl, _supply);
      _purchasePrice += _market;
      _supply += 1e18;
      if (_psl * 2 > _fsl) {
        _fsl += _market;
      }
      else {
        _psl += _market - _floor;
        _fsl += _floor;
      }
      _leftover -= 1e18;
    }
    if (_leftover > 0) {
      _market = _marketPrice(_fsl, _psl, _supply);
      _floor = _floorPrice(_fsl, _supply);
      _purchasePrice += (_market * _leftover) / 1e18;
      _supply += _leftover;
      if ( _psl * 2 > _fsl) {
        _fsl += (_market * _leftover) / 1e18;
      }
      else {
        _psl += ((_market - _floor) * _leftover) / 1e18;
        _fsl += (_floor * _leftover) / 1e18;
      }
    }
    uint256 _tax = (_purchasePrice / 1000) * 3;
    stable.transferFrom(msg.sender, address(this), (_purchasePrice + _tax) / stableDecimals);
    fsl = _fsl + _tax;
    psl = _psl;
    locks.ammMint(msg.sender, _amount);
    _floorRaise();
    return _marketPrice(_fsl + _tax, _psl, _supply);
  }

  function sell(uint256 _amount) public returns (uint256) {
    uint256 _supply = locks.totalSupply();
    require(_amount < _supply / 20, "price impact too large");
    require(locks.balanceOf(msg.sender) >= _amount, "insufficient locks balance");
    uint256 _leftover = _amount;
    uint256 _fsl = fsl;
    uint256 _psl = psl;
    uint256 _saleAmount;
    uint256 _market;
    uint256 _floor;
    while(_leftover >= 1e18) {
      _market = _marketPrice(_fsl, _psl, _supply);
      _floor = _floorPrice(_fsl, _supply);
      _saleAmount += _market;
      _psl -= _market - _floor;
      _fsl -= _floor;
      _supply -= 1e18;
      _leftover -= 1e18;
    }
    if (_leftover > 0) {
      _market = _marketPrice(_fsl, _psl, _supply);
      _floor = _floorPrice(_fsl, _supply);
      _saleAmount += (_market * _leftover) / 1e18;
      _psl -= ((_market - _floor) * _leftover) / 1e18;
      _fsl -= (_floor * _leftover) / 1e18; 
    }
    uint256 _tax = (_saleAmount / 1000) * 53;
    stable.transfer(msg.sender, (_saleAmount + _tax) / stableDecimals);
    locks.burn(msg.sender, _amount);
    supply = _supply;
    psl = _psl;
    fsl = _fsl += _tax;
    return _marketPrice(_fsl + _tax, _psl, _supply);
  }

  function redeem(uint256 _amount) public {
    require(_amount > 0, "cannot redeem zero");
    require(locks.balanceOf(msg.sender) >= _amount, "insufficient balance");
    uint256 _rawTotal = _amount * floorPrice();
    locks.burn(msg.sender, _amount);
    stable.transfer(msg.sender, (_rawTotal) / stableDecimals);
    _floorRaise();
  }

  function _floorPrice(uint256 _fsl, uint256 _supply) private pure returns (uint256) {
    return (_fsl*(1e18)) / _supply;
  }

  function _marketPrice(uint256 _fsl, uint256 _psl, uint256 _supply) public pure returns (uint256) {
   uint256 factor1 = _psl * 1e10 / _supply;
   uint256 factor2 = ((_psl + _fsl) * 1e5) / _fsl;
   uint256 exponential = factor2**5;
   uint256 _floorPriceVariable = _fsl * 1e18 /_supply;
   return _floorPriceVariable + ((factor1 * exponential) / (1e17));
  }
 
  function _floorRaise() private {
    if((psl * (1e18)) / fsl >= targetRatio) {
      uint256 _raiseAmount = (((psl*10**18)/fsl)*32*psl)/(10**21);
      psl -= _raiseAmount;
      fsl += _raiseAmount;
      targetRatio += targetRatio / 50;
      lastFloorRaise = block.timestamp;
    }
  }

  function _lowerThreshold() private {
    uint256 _elapsedRaise = block.timestamp - lastFloorRaise;
    uint256 _elapsedDrop = block.timestamp - lastFloorDecrease;
    if (_elapsedRaise >= 86400 && _elapsedDrop >= 86400) {
      uint256 _decreaseFactor = _elapsedRaise / 86400;
      targetRatio -= (targetRatio * _decreaseFactor);
      lastFloorDecrease = block.timestamp;
    }
  }

  function updateStable(address _stableAddress, uint256 _stableDecimals) public onlyAdmin {
    stable = IERC20(_stableAddress);
    stableDecimals = _stableDecimals;
  }

}