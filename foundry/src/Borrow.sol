//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./AMM.sol";
import "./LocksToken.sol";
import "./PorridgeToken.sol";

// updateStake can be exploited, need to change
// bug with staked tokens not earning yield

contract Borrow {

  AMM amm;
  LocksToken locks;
  PorridgeToken prg;
  IERC20 usdc;
  address public dev;

  mapping(address => uint256) public locked;
  mapping(address => uint256) public borrowed;

  constructor(address _ammAddress, address _locksAddress, address _prgAddress, address _devAddress) {
    usdc = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    amm = AMM(_ammAddress);
    locks = LocksToken(_locksAddress);
    prg = PorridgeToken(_prgAddress);
    dev = _devAddress;
  }

  function borrow(uint256 _amount) public {
    uint256 floorPrice = amm.fsl() / locks.totalSupply();
    require(floorPrice * prg.getStake(msg.sender) >= _amount, "insufficient borrow limit");
    require(_amount > 0, "cannot borrow zero");
    require(usdc.balanceOf(msg.sender) >= _amount && usdc.allowance(msg.sender, address(this)) >= _amount*(10**6), "insufficient funds/allowance");
    locked[msg.sender] += _amount;
    borrowed[msg.sender] += _amount;
    prg.updateStake(msg.sender, _amount, false);
    uint256 _fee = (_amount / 100) * 3;
    usdc.transferFrom(address(amm), msg.sender, _amount - _fee);
    usdc.transferFrom(address(amm), dev, _fee);
  }

  function repay(uint256 _amount) public {
    uint256 floorPrice = amm.fsl() / locks.totalSupply();
    require(_amount <= borrowed[msg.sender], "repaying too much");
    require(_amount > 0, "cannot repay zero");
    locked[msg.sender] -= (_amount / floorPrice);
    borrowed[msg.sender] -= _amount;
    prg.updateStake(msg.sender, (_amount / floorPrice), true);
    usdc.transferFrom(msg.sender, address(amm), _amount*(10**6));
  }

}