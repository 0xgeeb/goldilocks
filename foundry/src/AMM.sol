//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./Locks.sol";

contract AMM {

  IERC20 stable;
  Locks locks;
  uint256 public targetRatio = 260e15;
  uint256 public fsl;
  uint256 public psl;
  uint256 public supply = 2364e18;
  uint256 public lastFloorRaise;
  uint256 public lastFloorDecrease;
  address public adminAddress;
  uint256 public stableDecimals = 1e12;
  uint256 public treasuryValue;
  address public treasuryAddress;

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
    return (fsl*(1e18)) / supply;
  }

  function initialize(uint256 _fsl, uint256 _psl) public onlyLocks {
    fsl = _fsl;
    psl = _psl;
  }
  
  function buy(uint256 _amount) public returns (uint256, uint256) {
    uint256 _supply = supply;
    uint256 _treasuryValue = treasuryValue;
    uint256 _leftover = _amount;
    uint256 _fsl = fsl;
    uint256 _psl = psl;
    uint256 _market;
    uint256 _floor;
    uint256 _purchasePrice;
    if (_treasuryValue >= 500000e18) {
      // require(_amount <= _supply / 20, "price impact too large");
      while(_leftover >= 1e18) {
        _market = _marketPrice(_fsl, _psl, _supply);
        _floor = _floorPrice(_fsl, _supply);
        _purchasePrice += _market;
        _supply += 1e18;
        if (100*_psl >= 36*_fsl) {
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
        if (100*_psl >= 36*_fsl) {
          _fsl += (_market * _leftover) / 1e18;
        }
        else {
          _psl += ((_market - _floor) * _leftover) / 1e18;
          _fsl += (_floor * _leftover) / 1e18;
        }
      }
      uint256 _tax = (_purchasePrice / 1000) * 3;
      // stable.transferFrom(msg.sender, address(this), (_purchasePrice + _tax) / stableDecimals);
      fsl = _fsl + _tax;
      psl = _psl;
      supply = _supply;
    }
    else {
      if (_supply >= 1000e18) {
        // require(_amount < _supply /10, "price impact too large");
      }
      while(_leftover >= 1e18) {
        _market = _marketPrice(_fsl, _psl, _supply);
        _floor = _floorPrice(_fsl, _supply);
        _purchasePrice += _market;
        _supply += 1e18;
        if (100*_psl >= 36*_fsl) {
          _fsl += (75*_market)/100;
          _treasuryValue += (25*_market)/100;
        } else {
          _treasuryValue += 18*(_market - _floor)/100;
          _psl += 82*(_market - _floor)/100;
          _fsl += _floor;
        }
        _leftover -= 1e18;
      }
      if(_leftover > 0) {
        _market = _marketPrice(_fsl, _psl, _supply);
        _floor = _floorPrice(_fsl, _supply);
        _purchasePrice += (_market * _leftover) / 1e18;
        _supply += _leftover;
        if (100*_psl >= 36*_fsl) {
          _fsl += (75*_market * _leftover) / 100e18;
          _treasuryValue += (25*_market * _leftover) / 100e18;
        } else {
          _treasuryValue += (18*(_market - _floor) * _leftover) / 100e18;
          _psl += (82*(_market - _floor) * _leftover) / 100e18;
          _fsl += (_floor * _leftover) / 1e18;
        }
      }
      uint256 _tax = (_purchasePrice / 1000) * 3;
      // stable.transferFrom(msg.sender, address(this), (_purchasePrice - _treasuryValue + _tax) / stableDecimals);
      fsl = _fsl + _tax;
      psl = _psl;
      supply = _supply;
      treasuryValue = _treasuryValue;
    }
      // locks.ammMint(msg.sender, _amount);
    _floorRaise();
    return (_marketPrice(fsl, psl, supply), _floorPrice(fsl, supply));
  }

  function sell(uint256 _amount) public returns (uint256, uint256) {
    uint256 _supply = supply;
    require(_amount <= _supply / 20, "price impact too large");
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
      _supply -= _leftover;
    }
    uint256 _tax = (_saleAmount / 1000) * 53;
    // stable.transfer(msg.sender, (_saleAmount + _tax) / stableDecimals);
    // locks.burn(msg.sender, _amount);
    fsl = _fsl + _tax;
    psl = _psl;
    supply = _supply;
    return (_marketPrice(fsl, psl, supply), _floorPrice(fsl, supply));
  }

  function redeem(uint256 _amount) public {
    require(_amount > 0, "cannot redeem zero");
    require(locks.balanceOf(msg.sender) >= _amount, "insufficient balance");
    uint256 _rawTotal = (_amount * ((fsl * 1e18) / supply)) / 1e18;
    // locks.burn(msg.sender, _amount);
    // stable.transfer(msg.sender, (_rawTotal) / stableDecimals);
    supply -= _amount;
    fsl -= _rawTotal;
    _floorRaise();
  }

  function _floorPrice(uint256 _fsl, uint256 _supply) public pure returns (uint256) {
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
      uint256 _raiseAmount = (((psl * 1e18) / fsl) * (psl / 32)) / (1e18);
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

  function withdrawTreasury() public onlyAdmin {
    stable.transfer(treasuryAddress, treasuryValue);
  }




  // just for testing
  function updateSupply(uint256 _newSupply) public {
    supply = _newSupply;
  }

}