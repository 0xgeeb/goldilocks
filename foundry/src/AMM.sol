//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./LocksToken.sol";
import "./PorridgeToken.sol";

// need to add onlyAdmin() modifier

contract AMM {

  IERC20 usdc;
  LocksToken locks;
  uint256 public targetRatio = 4e17;
  uint256 public fsl = 750e18;
  uint256 public psl = 250e18;
  uint256 public supply;
  uint256 public lastFloorRaise;

  constructor(address _locksAddress) {
    locks = LocksToken(_locksAddress);
    usdc = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    lastFloorRaise = block.timestamp;
  }

  function floorPrice() public view returns (uint256) {
    return (fsl*(10**18)) / locks.totalSupply();
  }

  function marketPrice() public view returns (uint256) {
    return floorPrice() + (((psl*(10**18) / locks.totalSupply()) * (((psl + fsl)*(10**18)) / fsl))/(10**18));
  }

  function buy(uint256 _amount) public returns (uint256) {
    uint256 _fsl = fsl;
    uint256 _psl = psl;
    uint256 _supply = supply;
    uint256 _purchasePrice;
    for(uint256 i; i < _amount; i++) {
      _purchasePrice += _marketPrice(_fsl, _psl, _supply);
      _supply += 1e18;
      _fsl += _floorPrice(_fsl, _supply);
      _psl += _marketPrice(_fsl, _psl, _supply) - _floorPrice(_fsl, _supply);
    }
    fsl = _fsl;
    psl = _psl;
    supply = _supply;
    uint256 _tax = (_amount / 1000) * 3;
    fsl += _tax;
    usdc.transferFrom(msg.sender, address(this), (_purchasePrice - _tax) / (10**12));
    locks.mint(msg.sender, _amount);
    _floorRaise();
    return _marketPrice(fsl, psl, supply);
  }

  function sell(uint256 _amount) public returns (uint256) {
    require(locks.balanceOf(msg.sender) >= _amount, "insufficient locks balance");
    uint256 _fsl = fsl;
    uint256 _psl = psl;
    uint256 _supply = supply;
    uint256 _saleAmount;
    for(uint256 i; i < _amount; i++) {
      _saleAmount += _marketPrice(_fsl, _psl, _supply);
      _supply -= 1e18;
      _fsl -= _floorPrice(_fsl, _supply);
      _psl -= _marketPrice(_fsl, _psl, _supply) - _floorPrice(_fsl, _supply);
    }
    // change tax
    uint256 _tax = _saleAmount / 20;
    usdc.transfer(msg.sender, _saleAmount - _tax);
    locks.burn(msg.sender, _amount);
    return _marketPrice(fsl, psl, supply);
  }

  function redeem(uint256 _amount) public {
    require(_amount > 0, "cannot redeem zero");
    require(locks.balanceOf(msg.sender) >= _amount, "insufficient balance");
    uint256 _rawTotal = _amount * floorPrice();
    locks.burn(msg.sender, _amount);
    usdc.transfer(msg.sender, (_rawTotal)*(10**6));
    _floorRaise();
  }

  function _floorPrice(uint256 _fsl, uint256 _supply) private pure returns (uint256) {
    return (_fsl*(10**18)) / _supply;
  }

  function _marketPrice(uint256 _fsl, uint256 _psl, uint256 _supply) private pure returns (uint256) {
    return _floorPrice(_fsl, _supply) + (((_psl*(10**18) / _supply) * (((_psl + _fsl)*(10**18)) / _fsl))/(10**18));
  }

  function _floorRaise() private {
    if(((psl + fsl)*(10**18)) / fsl >= targetRatio) {
      uint256 _raiseAmount = ((((psl*(10**18)) / fsl)*(10**18)) / 38e16) / 100;
      psl -= _raiseAmount;
      fsl += _raiseAmount;
      targetRatio += targetRatio / 50;
      lastFloorRaise = block.timestamp;
    }
  }

}