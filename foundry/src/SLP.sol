//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./LocksToken.sol";
import "./PorridgeToken.sol";

// need to add onlyAdmin() modifier

contract SLP {

  uint256 fsl = 75e18;
  uint256 psl = 25e18;
  uint256 supply = 110e18;

  uint256 mfsl = 75e18;
  uint256 mpsl = 25e18;
  uint256 msupply = 110e18;

  IERC20 usdc;
  LocksToken locks;
  uint256 public lastFloorRaise;

  constructor(address _locksAddress) {
    locks = LocksToken(_locksAddress);
    usdc = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    lastFloorRaise = block.timestamp;
  }

  function floorPrice(uint256 _fsl, uint256 _supply) public pure returns (uint256) {
    return (_fsl*(10**18)) / _supply;
  }

  function marketPrice(uint256 _fsl, uint256 _psl, uint256 _supply) public pure returns (uint256) {
    return floorPrice(_fsl, _supply) + (((_psl*(10**18) / _supply) * (((_psl + _fsl)*(10**18)) / _fsl))/(10**18));
  }

  function purchase(uint256 _amount) public returns (uint256) {
    uint256 _cumulativePrice;
    uint256 _cumulativeFloorPrice;
    uint256 _cumulativePremium;
    for(uint256 i; i < _amount; i++) {
      _cumulativePrice += marketPrice(fsl, psl, supply);
      _cumulativeFloorPrice += floorPrice(fsl, supply);
      _cumulativePremium += marketPrice(fsl, psl, supply) - floorPrice(fsl, supply);
      supply += 1e18;
      fsl += floorPrice(fsl, supply);
      psl += marketPrice(fsl, psl, supply) - floorPrice(fsl, supply);
    }
    locks.mint(msg.sender, _amount);
    return marketPrice(fsl, psl, supply);
  }

  function mpurchase(uint256 _amount) public returns (uint256) {
    uint256 _mfsl = mfsl;
    uint256 _mpsl = mpsl;
    uint256 _msupply = msupply;
    uint256 _purchasePrice;
    for(uint256 i; i < _amount; i++) {
      _purchasePrice += marketPrice(_mfsl, _mpsl, _msupply);
      _msupply += 1e18;
      _mfsl += floorPrice(_mfsl, _msupply);
      _mpsl += marketPrice(_mfsl, _mpsl, _msupply) - floorPrice(_mfsl, _msupply);
    }
    mfsl = _mfsl;
    mpsl = _mpsl;
    msupply = _msupply;
    usdc.transferFrom(msg.sender, address(this), _purchasePrice);
    locks.mint(msg.sender, _amount);
    return marketPrice(mfsl, mpsl, msupply);
  }
}