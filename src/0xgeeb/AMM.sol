//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./HLMToken.sol";
import "./RWDToken.sol";

contract AMM {

  IERC20 usdc;
  HLMToken hlm;
  RWDToken rwd;
  uint256 public tokenDecimals = 10**18;
  uint256 public targetRatio = (tokenDecimals*3)/2;
  uint256 public fsl = (AMMBalance()*92783) / 100000;
  uint256 public psl = AMMBalance() - fsl;


  constructor(address _hlmAddress) {
    usdc = IERC20(0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8);
    hlm = HLMToken(_hlmAddress);
  }

  function AMMBalance() public view returns (uint256) {
    return usdc.balanceOf(address(this));
  }

  function floorPrice(uint256 _fsl, uint256 _supply) public pure returns (uint256) {
    return _fsl / _supply;
  }

  function marketPrice(uint256 _fsl, uint256 _psl, uint256 _supply) public pure returns (uint256) {
    return ((_fsl+_psl)/_supply)*((_fsl+_psl)/_fsl);
  }

  function floorRaise() public {
    uint256 currentRatio = (psl + fsl) / fsl;
    if(currentRatio >= targetRatio) {
      uint256 raiseAmount = psl / 10;
      psl -= raiseAmount;
      fsl += raiseAmount;
      uint256 ratioIncrease = targetRatio / 10;
      targetRatio += ratioIncrease;
    } 
  }

  function purchase(uint256 amount) public {
    uint256 _amount = amount * tokenDecimals;
    uint256 _fsl = fsl;
    uint256 _psl = psl;
    uint256 _supply = hlm.totalSupply();
    uint256 _floorPrice = floorPrice(_fsl, _supply);
    uint256 _index;
    uint256 _cumulativePrice;
    uint256 _cumulativeFloorPrice;
    uint256 _cumulativePremium;
    while(_index <= _amount) {
      uint256 currentPrice = marketPrice(_fsl, _psl, _supply);
      _cumulativePrice += currentPrice;
      _cumulativeFloorPrice += _floorPrice;
      _cumulativePremium += currentPrice - _floorPrice;
      _supply += tokenDecimals;
      _fsl += _floorPrice;
      _psl += currentPrice - _floorPrice;
      _floorPrice = _fsl / _supply;
      _index += tokenDecimals;
    }
    require(usdc.balanceOf(msg.sender) >= _cumulativePrice, "insufficient usdc balance");
    usdc.transferFrom(msg.sender, address(this), _cumulativePrice);
    hlm.mint(msg.sender, _amount);
    fsl += _cumulativeFloorPrice;
    psl += _cumulativePremium;
    floorRaise();    
  }

  function sale(uint256 amount) public {
    uint256 _amount = amount * tokenDecimals;
    require(hlm.balanceOf(msg.sender) >= amount, "insufficient HLM balance");
    uint256 _fsl = fsl;
    uint256 _psl = psl;
    uint256 _supply = hlm.totalSupply();
    uint256 _floorPrice = floorPrice(_fsl, _supply);
    uint256 _index;
    uint256 _cumulativePrice;
    uint256 _cumulativeFloorPrice;
    uint256 _cumulativePremium;
    while(_index <= _amount) {
      uint256 currentPrice = marketPrice(_fsl, _psl, _supply);
      _cumulativePrice += currentPrice;
      _cumulativeFloorPrice += _floorPrice;
      _cumulativePremium += currentPrice - _floorPrice;
      _supply -= tokenDecimals;
      _fsl -= _floorPrice;
      _psl -= currentPrice - _floorPrice;
      _floorPrice = _fsl / _supply;
      _index += tokenDecimals;
    }
    uint256 tax = _cumulativePrice / 20;
    usdc.transfer(msg.sender, _cumulativePrice - tax);
    hlm.burn(msg.sender, _amount);
    uint256 floorLoss = _cumulativeFloorPrice + tax;
    fsl -= floorLoss;
    psl -= _cumulativePremium;
    floorRaise();
  }

  function redeem(uint256 amount) public {
    uint256 _amount = amount * tokenDecimals;
    require(hlm.balanceOf(msg.sender) >= _amount, "insufficient balance");
    require(_amount > 0, "cannot stake zero");
    uint256 _floorPrice = fsl / hlm.totalSupply();
    rwd.burn(msg.sender, _amount);
    uint256 _rawTotal = _amount * _floorPrice;
    uint256 _tax = (_rawTotal * 3) / 100;
    hlm.burn(msg.sender, _amount);
    usdc.transfer(msg.sender, _rawTotal - _tax);
    fsl -= _rawTotal - _tax;
  }
}