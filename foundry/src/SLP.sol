//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./LocksToken.sol";
import "./PorridgeToken.sol";

// need to add onlyAdmin() modifier

contract SLP {

  IERC20 usdc;
  LocksToken locks;
  uint256 public lastFloorRaise;

  struct Info {
    uint256 fsl;
    uint256 psl;
    uint256 supply;
    uint8 exponent;
    uint8 target;
  }

  constructor(address _locksAddress) {
    locks = LocksToken(_locksAddress);
    usdc = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    lastFloorRaise = block.timestamp;
  }

  function floorPrice(uint256 _fsl, uint256 _supply) public pure returns (uint256) {
    return _fsl / _supply;
  }

  function marketPrice(uint256 _fsl, uint256 _psl, uint256 _supply, uint8 _exponent) public pure returns (uint256) {
    return floorPrice(_fsl, _supply) + ((_psl / _supply) * ((_psl + _fsl) / _fsl)**_exponent);
  }

  function purchase(uint256 _amount, Info memory _info) public {
    require(_amount <= usdc.balanceOf(msg.sender), "insufficient funds");
    uint256 _cumulativeFsl = _info.fsl;
    uint256 _cumulativePsl = _info.psl;
    for(uint256 i; i < _amount; i++) {
      _info.supply += 1;
      _info.fsl += floorPrice(_info.fsl, _info.supply);
      _info.psl += marketPrice(_info.fsl, _info.psl, _info.supply, _info.exponent) - floorPrice(_info.fsl, _info.supply);
      if(_info.psl / _info.fsl >_info.target) {
        _info.psl -= _info.psl / 20;
        _info.fsl += _info.psl / 20;
        _info.target += _info.target / 16;
        lastFloorRaise = block.timestamp;
      }
    }
    require(usdc.balanceOf(msg.sender) >= _cumulativeFsl + _cumulativePsl, "insufficient usdc balance");
    usdc.transferFrom(msg.sender, address(this), _cumulativeFsl + _cumulativePsl);
    locks.mint(msg.sender, _amount);

  }

}