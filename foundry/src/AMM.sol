//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./LocksToken.sol";
import "./PorridgeToken.sol";
import "./Borrow.sol";

contract AMM {

  IERC20 usdc;
  LocksToken locks;
  PorridgeToken prg;
  Borrow borrow;
  address public adminAddress;
  uint256 public targetRatio = 3*(10**18) / 2*(10**18);
  uint256 public fsl;
  uint256 public psl;


  constructor(address _locksAddress, address _prgAddress, address _borrowAddress, address _adminAddress) {
    locks = LocksToken(_locksAddress);
    prg = PorridgeToken(_prgAddress);
    borrow = Borrow(_borrowAddress);
    usdc = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    adminAddress = _adminAddress;
  }

  modifier onlyAdmin() {
    require(msg.sender == adminAddress, "not authorized");
    _;
  }

  function updateFSL() public {
    fsl = (AMMBalance()*92783) / 100000;
  }

  function updatePSL() public {
    psl = AMMBalance() - fsl;
  }

  function updateApproval(uint256 _amount) public onlyAdmin() {
    usdc.approve(address(borrow), _amount);
  }

  function AMMBalance() public view returns (uint256) {
    return usdc.balanceOf(address(this));
  }

  function floorPrice(uint256 _fsl, uint256 _supply) public pure returns (uint256) {
    return _fsl / _supply;
  }

  function marketPrice(uint256 _fsl, uint256 _psl, uint256 _supply) public pure returns (uint256) {
    return ((_fsl+_psl) / _supply) * ((_fsl+_psl) / _fsl);
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

  function purchase(uint256 _amount) public {
    uint256 _fsl = fsl;
    uint256 _psl = psl;
    uint256 _supply = locks.totalSupply();
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
      _supply += 1;
      _fsl += _floorPrice;
      _psl += currentPrice - _floorPrice;
      _floorPrice = _fsl / _supply;
      _index += 1;
    }
    require(usdc.balanceOf(msg.sender) >= _cumulativePrice*(10**6), "insufficient usdc balance");
    usdc.transferFrom(msg.sender, address(this), _cumulativePrice);
    locks.mint(msg.sender, _amount);
    fsl += _cumulativeFloorPrice;
    psl += _cumulativePremium;
    floorRaise();
  }

  function sale(uint256 _amount) public {
    require(locks.balanceOf(msg.sender) >= _amount, "insufficient locks balance");
    uint256 _fsl = fsl;
    uint256 _psl = psl;
    uint256 _supply = locks.totalSupply();
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
      _supply -= 1;
      _fsl -= _floorPrice;
      _psl -= currentPrice - _floorPrice;
      _floorPrice = _fsl / _supply;
      _index += 1;
    }
    uint256 tax = _cumulativePrice / 20;
    usdc.transfer(msg.sender, _cumulativePrice - tax);
    locks.burn(msg.sender, _amount);
    uint256 floorLoss = _cumulativeFloorPrice - tax;
    fsl -= floorLoss;
    psl -= _cumulativePremium;
    floorRaise();
  }

  function redeem(uint256 _amount) public {
    require(locks.balanceOf(msg.sender) >= _amount, "insufficient balance");
    require(_amount > 0, "cannot stake zero");
    uint256 _floorPrice = fsl / locks.totalSupply();
    prg.burn(msg.sender, _amount);
    uint256 _rawTotal = _amount * _floorPrice;
    uint256 _tax = (_rawTotal * 3) / 100;
    locks.burn(msg.sender, _amount);
    usdc.transfer(msg.sender, _rawTotal - _tax);
    fsl -= _rawTotal - _tax;
  }
}