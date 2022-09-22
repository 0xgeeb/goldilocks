//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./LocksToken.sol";
import "./PorridgeToken.sol";

// need to add onlyAdmin() modifier

contract AMM {

  IERC20 usdc;
  LocksToken locks;
  uint256 public targetRatio = 3*(10**18) / 2*(10**18);
  uint256 public fsl;
  uint256 public psl;
  uint256 public lastFloorRaise;

  constructor(address _locksAddress) {
    locks = LocksToken(_locksAddress);
    usdc = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    lastFloorRaise = block.timestamp;
  }

  function updatePools() public {
    fsl = ammBalance() * 92783 / 100000;
    psl = ammBalance() - fsl;
  }

  function ammBalance() public view returns (uint256) {
    return usdc.balanceOf(address(this));
  }

  function floorPrice() public view returns (uint256) {
    return fsl / locks.totalSupply();
  }

  function marketPrice() public view returns (uint256) {
    return ((fsl+psl) / locks.totalSupply()) * ((fsl+psl) / fsl);
  }

  function floorRaise() public {
    if((psl + fsl) / fsl >= targetRatio) {
      psl -= psl / 10;
      fsl += psl / 10;
      targetRatio += targetRatio / 10;
      lastFloorRaise = block.timestamp;
    } 
  }

  function oldFloorPrice(uint256 _fsl, uint256 _supply) public pure returns (uint256) {
    return _fsl/_supply;
  }

  function oldMarketPrice(uint256 _fsl, uint256 _psl, uint256 _supply) public pure returns (uint256) {
    return ((_fsl+_psl)/_supply) * ((_fsl+_psl)/_fsl);
  }

  function purchase(uint256 _amount) public {
    updatePools();
    uint256 _fsl = fsl;
    uint256 _psl = psl;
    uint256 _supply = locks.totalSupply();
    uint256 _floorPrice = oldFloorPrice(_fsl, _supply);
    uint256 _index;
    uint256 _cumulativePrice;
    uint256 _cumulativeFloorPrice;
    uint256 _cumulativePremium;
    while(_index < _amount) {
      uint256 currentPrice = oldMarketPrice(_fsl, _psl, _supply);
      _cumulativePrice += currentPrice;
      _cumulativeFloorPrice += _floorPrice;
      _cumulativePremium += currentPrice - _floorPrice;
      _supply += 1;
      _fsl += _floorPrice;
      _psl += currentPrice - _floorPrice;
      _floorPrice = _fsl / _supply;
      _index += 1;
    }
    require(usdc.balanceOf(msg.sender) >= _cumulativePrice, "insufficient usdc balance");
    usdc.transferFrom(msg.sender, address(this), _cumulativePrice);
    locks.mint(msg.sender, _amount);
    fsl += _cumulativeFloorPrice;
    psl += _cumulativePremium;
    floorRaise();
  }

  function sale(uint256 _amount) public {
    updatePools();
    require(locks.balanceOf(msg.sender) >= _amount, "insufficient locks balance");
    uint256 _fsl = fsl;
    uint256 _psl = psl;
    uint256 _supply = locks.totalSupply();
    uint256 _floorPrice = oldFloorPrice(_fsl, _supply);
    uint256 _index;
    uint256 _cumulativePrice;
    uint256 _cumulativeFloorPrice;
    uint256 _cumulativePremium;
    while(_index <= _amount) {
      uint256 currentPrice = oldMarketPrice(_fsl, _psl, _supply);
      _cumulativePrice += currentPrice;
      _cumulativeFloorPrice += _floorPrice;
      _cumulativePremium += currentPrice - _floorPrice;
      _supply -= 1;
      _fsl -= _floorPrice;
      _psl -= currentPrice - _floorPrice;
      _floorPrice = _fsl / _supply;
      _index += 1;
    }
    uint256 _tax = _cumulativePrice / 20;
    usdc.transfer(msg.sender, (_cumulativePrice - _tax));
    locks.burn(msg.sender, _amount);
    fsl -= _cumulativeFloorPrice - _tax;
    psl -= _cumulativePremium;
    floorRaise();
  }

  function purchase1(uint256 _amount) public {
    updatePools();
    require(_amount > 0, "cannot purchase zero");
    uint256 _price = _amount * marketPrice();
    require(usdc.balanceOf(msg.sender) >= _price && usdc.allowance(msg.sender, address(this)) >= _price, "insufficient funds/allowance");
    usdc.transferFrom(msg.sender, address(this), _price);
    locks.mint(msg.sender, _amount);
    floorRaise();
  }

  function sale1(uint256 _amount) public {
    updatePools();
    require(_amount > 0, "cannot purchase zero");
    uint256 _price = _amount * marketPrice();
    require(locks.balanceOf(msg.sender) >= _amount && locks.allowance(msg.sender, address(this)) >= _amount, "insufficient funds/allowance");
    uint256 _tax = _price / 20;
    usdc.transfer(msg.sender, (_price - _tax));
    locks.burn(msg.sender, _amount);
    floorRaise();
  }

  function redeem(uint256 _amount) public {
    updatePools();
    require(_amount > 0, "cannot redeem zero");
    require(locks.balanceOf(msg.sender) >= _amount, "insufficient balance");
    uint256 _rawTotal = _amount * floorPrice();
    uint256 _tax = _rawTotal / 100 * 3;
    locks.burn(msg.sender, _amount);
    usdc.transfer(msg.sender, (_rawTotal - _tax)*(10**6));
    fsl -= _rawTotal - _tax;
    floorRaise();
  }
}