//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./AMM.sol";
import "./RWDToken.sol";
import "./HLMToken.sol";

// do not think tokenDecimals is correct way to do that, need to change
// updateStake can be exploited, need to change

contract Borrow {

  AMM amm;
  HLMToken hlm;
  RWDToken rwd;
  IERC20 usdc;
  uint256 public tokenDecimals = 10**18;
  address public dev;

  mapping(address => uint256) public locked;
  mapping(address => uint256) public borrowed;

  constructor(address _ammAddress, address _hlmAddress, address _rwdAddress, address _devAddress) {
    usdc = IERC20(0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8);
    amm = AMM(_ammAddress);
    hlm = HLMToken(_hlmAddress);
    rwd = RWDToken(_rwdAddress);
    dev = _devAddress;
  }

  function borrow(uint256 _amount) public {
    uint256 amount = _amount * tokenDecimals;
    uint256 floorPrice = amm.fsl() / hlm.totalSupply();
    require(floorPrice * rwd.getStake(msg.sender) >= amount, "insufficient borrow limit");
    require(_amount > 0, "cannot borrow zero");
    locked[msg.sender] += _amount;
    rwd.updateStake(msg.sender, _amount, false);
    uint256 _fee = (amount / 100) * 3;
    usdc.transferFrom(address(amm), msg.sender, _amount - _fee);
    usdc.transferFrom(address(amm), dev, _fee);
    borrowed[msg.sender] += amount;
  }

  function repay(uint256 _amount) public {
    uint256 amount = _amount * tokenDecimals;
    uint256 floorPrice = amm.fsl() / hlm.totalSupply();
    require(amount <= borrowed[msg.sender], "repaying too much");
    require(amount > 0, "cannot repay zero");
    usdc.transferFrom(msg.sender, address(amm), amount);
    locked[msg.sender] -= (amount / floorPrice);
    rwd.updateStake(msg.sender, (amount / floorPrice), true);
    borrowed[msg.sender] -= amount;
  }

}