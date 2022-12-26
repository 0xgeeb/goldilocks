//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { ILocks } from "./interfaces/ILocks.sol";

contract AMM {

  IERC20 honey;
  ILocks ilocks;
  
  uint256 public targetRatio = 260e15;
  uint256 public fsl;
  uint256 public psl;
  uint256 public supply = 1;
  uint256 public lastFloorRaise;
  uint256 public lastFloorDecrease;
  address public adminAddress;
  address public locksAddress;

  constructor(address _locksAddress, address _adminAddress) {
    ilocks = ILocks(_locksAddress);
    adminAddress = _adminAddress;
    honey = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);
    locksAddress = _locksAddress;
    lastFloorRaise = block.timestamp;
  }

  event Buy(address indexed user, uint256 amount);
  event Sale(address indexed user, uint256 amount);
  event Redeem(address indexed user, uint256 amount);

  modifier onlyAdmin() {
    require(msg.sender == adminAddress, "not admin");
    _;
  }

  modifier onlyLocks() {
    require(msg.sender == locksAddress, "not locks");
    _;
  }

  function floorPrice() external view returns (uint256) {
    return (fsl*(1e18)) / supply;
  }

  function initialize(uint256 _fsl, uint256 _psl) external onlyLocks {
    fsl = _fsl;
    psl = _psl;
  }
  
  function buy(uint256 _amount, uint256 _maxAmount) public returns (uint256, uint256) {
    // require(_amount <= _supply / 20, "price impact too large");
    uint256 _supply = supply;
    uint256 _leftover = _amount;
    uint256 _fsl = fsl;
    uint256 _psl = psl;
    uint256 _market;
    uint256 _floor;
    uint256 _purchasePrice;
    while(_leftover >= 1e18) {
      _market = _marketPrice(_fsl, _psl, _supply);
      _floor = _floorPrice(_fsl, _supply);
      _purchasePrice += _market;
      _supply += 1e18;
      if (_psl * 100 >= _fsl * 36) {
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
      if (_psl * 100 >= _fsl * 36) {
        _fsl += (_market * _leftover) / 1e18;
      }
      else {
        _psl += ((_market - _floor) * _leftover) / 1e18;
        _fsl += (_floor * _leftover) / 1e18;
      }
    }
    uint256 _tax = (_purchasePrice / 1000) * 3;
    fsl = _fsl + _tax;
    psl = _psl;
    supply = _supply;
    require(_purchasePrice + _tax <= _maxAmount, "too much slippage");
    // honey.transferFrom(msg.sender, address(this), _purchasePrice + _tax);
    // ilocks.ammMint(msg.sender, _amount);
    _floorRaise();
    emit Buy(msg.sender, _amount);
    return (_marketPrice(fsl, psl, supply), _floorPrice(fsl, supply));
  }

  function sell(uint256 _amount, uint256 _minAmount) public returns (uint256, uint256) {
    uint256 _supply = supply;
    // require(_amount <= _supply / 20, "price impact too large");    
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
    require(_saleAmount + _tax >= _minAmount, "too much slippage");
    // honey.transfer(msg.sender, _saleAmount + _tax);
    // ilocks.ammBurn(msg.sender, _amount);
    fsl = _fsl + _tax;
    psl = _psl;
    supply = _supply;
    emit Sale(msg.sender, _amount);
    return (_marketPrice(fsl, psl, supply), _floorPrice(fsl, supply));
  }

  function redeem(uint256 _amount) public {
    require(_amount > 0, "cannot redeem zero");
    require(IERC20(locksAddress).balanceOf(msg.sender) >= _amount, "insufficient balance");
    uint256 _rawTotal = (_amount * ((fsl * 1e18) / supply)) / 1e18;
    // ilocks.ammBurn(msg.sender, _amount);
    // honey.transfer(msg.sender, _rawTotal);
    supply -= _amount;
    fsl -= _rawTotal;
    _floorRaise();
    emit Redeem(msg.sender, _amount);
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

}