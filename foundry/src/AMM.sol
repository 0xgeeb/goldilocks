//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./Locks.sol";

contract AMM {

  IERC20 usdc;
  Locks locks;
  uint256 public targetRatio = 3e17;
  uint256 public fsl;
  uint256 public psl;
  uint256 public supply = 100000e18;
  uint256 public lastFloorRaise;

  constructor(address _locksAddress) {
    locks = Locks(_locksAddress);
    usdc = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    lastFloorRaise = block.timestamp;
  }

  modifier onlyLocks() {
    require(msg.sender == address(locks), "not locks");
    _;
  }

  function floorPrice() public view returns (uint256) {
    return (fsl*(10**18)) / locks.totalSupply();
  }

  // use temporary variables to compartimentalize the formula to make the exponent possible
  function marketPrice() public view returns (uint256) {
    return floorPrice() + (((psl*(10**18) / locks.totalSupply()) * (((psl + fsl)*(10**18)) / fsl))/(10**18));
  }

  function initialize() public onlyLocks {
    fsl = 800000e18;
    psl = 200000e18;
  }

  function buy(uint256 _amount) public returns (uint256) {
    uint256 _supply = locks.totalSupply();
    require(_amount < _supply / 20, "price impact too large");
    uint256 _leftover = _amount;
    uint256 _fsl = fsl;
    uint256 _psl = psl;
    uint256 _purchasePrice;
    uint256 _market;
    uint256 _floor;
    for(uint256 i; i < _amount; i++) {
      _market = _marketPrice(_fsl, _psl, _supply);
      _floor = _floorPrice(_fsl, _supply);
      _purchasePrice += _market;
      _psl += _market - _floor;
      _fsl += _floor;
      _supply += 1e18;
      _leftover -= 1e18;
    }
    _market = _marketPrice(_fsl, _psl, _supply);
    _floor = _floorPrice(_fsl, _supply);
    _purchasePrice += (_market * _leftover) / 1e18;
    _psl += ((_market - _floor) * _leftover) / 1e18;
    _fsl += _floor / 1e18;
    uint256 _tax = (_amount / 1000) * 3;
    fsl = _fsl + _tax;
    psl = _psl;
    usdc.transferFrom(msg.sender, address(this), (_purchasePrice - _tax) / (10**12));
    locks.mint(msg.sender, _amount);
    _floorRaise();
    return _marketPrice(fsl, psl, _supply);
  }

  function sell(uint256 _amount) public returns (uint256) {
    require(locks.balanceOf(msg.sender) >= _amount, "insufficient locks balance");
    uint256 _leftover = _amount;
    uint256 _fsl = fsl;
    uint256 _psl = psl;
    uint256 _supply = locks.totalSupply();
    uint256 _saleAmount;
    uint256 _market;
    uint256 _floor;
    for(uint256 i; i < _amount; i++) {
      _market = _marketPrice(_fsl, _psl, _supply);
      _floor = _floorPrice(_fsl, _supply);
      _saleAmount += _market;
      _psl -= _market - _floor;
      _fsl -= _floor;
      _supply -= 1e18;
      _leftover -= 1e18;
    }
    _market = _marketPrice(_fsl, _psl, _supply);
    _floor = _floorPrice(_fsl, _supply);
    _saleAmount += (_market * _leftover) / 1e18;
    _psl -= ((_market - _floor) * _leftover) / 1e18;
    _fsl -= (_floor * _leftover) / 1e18; 
    uint256 _tax = (_saleAmount / 1000) * 53;
    fsl = _fsl + _tax;
    psl = _psl;
    usdc.transfer(msg.sender, (_saleAmount - _tax) / (10**12));
    locks.burn(msg.sender, _amount);
    return _marketPrice(fsl, psl, _supply);
  }

  function redeem(uint256 _amount) public {
    require(_amount > 0, "cannot redeem zero");
    require(locks.balanceOf(msg.sender) >= _amount, "insufficient balance");
    uint256 _rawTotal = _amount * floorPrice();
    locks.burn(msg.sender, _amount);
    usdc.transfer(msg.sender, (_rawTotal) / (10**12));
    _floorRaise();
  }

  function _floorPrice(uint256 _fsl, uint256 _supply) private pure returns (uint256) {
    return (_fsl*(10**18)) / _supply;
  }

  function _marketPrice(uint256 _fsl, uint256 _psl, uint256 _supply) private pure returns (uint256) {
    return _floorPrice(_fsl, _supply) + (((_psl*(10**18) / _supply) * (((_psl + _fsl)*(10**18)) / _fsl))/(10**18));
  }

  function _newMarketPrice(uint256 _fsl, uint256 _psl, uint256 _supply) private pure returns (uint256) {
    uint256 factor_1 =  (_psl*10**9)/_supply;
    uint256 factor_2 = ((_psl+_fsl)*10**3)/_fsl;
    // uint256 exponential = factor_2**3;
    return _floorPrice(_fsl, _supply) + ((factor_1*factor_2));
  }

  function _floorRaise() private {
    if((psl *(10**18)) / fsl >= targetRatio) {
      uint256 _raiseAmount = ((((psl*(10**18)) / fsl)*(10**18)) / 34e16) / 100;
      psl -= _raiseAmount;
      fsl += _raiseAmount;
      targetRatio += targetRatio / 50;
      lastFloorRaise = block.timestamp;
    }
  }

}