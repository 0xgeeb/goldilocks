//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./AMM.sol";
import "./HLMToken.sol";

// do not think tokenDecimals is correct way to do that, need to change
// need to change onlyAdmin() modifier
// updateStake can be exploited, need to change

contract RWDToken is ERC20("Reward", "RWD") {

  address public ammAddress;
  address public redemptionAddress;
  uint256 public tokenDecimals = 10**18;
  IERC20 usdc;
  HLMToken hlm;
  AMM amm;

  mapping(address => uint256) public staked;
  mapping(address => uint256) public stakeStartTime;

  constructor(address _ammAddress, address _redemptionAddress, address _hlmAddress) {
    ammAddress = _ammAddress;
    redemptionAddress = _redemptionAddress;
    usdc = IERC20(0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8);
    hlm = HLMToken(_hlmAddress);
    amm = AMM(_ammAddress);
  }

  modifier onlyAdmin() {
    require(msg.sender == ammAddress || msg.sender == redemptionAddress, "not authorized");
    _;
  }

  function mint(address _to, uint256 _amount) public onlyAdmin() {
    _mint(_to, _amount);
  }

  function burn(address _from, uint256 _amount) public onlyAdmin() {
    _burn(_from, _amount);
  }

  function getStake(address _user) public view returns (uint256) {
    return staked[_user];
  }

  function updateStake(address _user, uint256 _amount, bool add) public {
    if (add) {
      staked[_user] = _amount;
    }
    else {
      staked[_user] -= _amount;
    }
  }

  function calculateYieldTime(address _user) public view returns (uint256) {
    return block.timestamp - stakeStartTime[_user];
  }

  function calculateYieldTotal(address _user) public view returns (uint256) {
    uint256 _time = calculateYieldTime(_user);
    uint256 rawYield = (_time * staked[_user]/100)/86400;
    return rawYield;
  }

  function stake(uint256 _amount) public {
    uint256 amount = _amount * tokenDecimals;
    require(hlm.balanceOf(msg.sender) >= _amount, "insufficient balance");
    require(_amount > 0, "cannot stake zero");
    if(staked[msg.sender] > 0) {
      uint256 toTransfer = calculateYieldTotal(msg.sender);
      _mint(msg.sender, toTransfer);
    }
    hlm.transferFrom(msg.sender, address(this), amount);
    staked[msg.sender] += _amount;
    stakeStartTime[msg.sender] = block.timestamp;
  }

  function unstake(uint256 _amount) public {
    require(staked[msg.sender] >= _amount, "insufficient staked balance");
    require(_amount > 0, "cannot unstake zero");
    uint256 toTransfer = calculateYieldTotal(msg.sender);
    stakeStartTime[msg.sender] = block.timestamp;
    staked[msg.sender] -= _amount;
    hlm.transfer(msg.sender, _amount);
    _mint(msg.sender, toTransfer);
  }

  function withdrawYield() public {
    uint256 toTransfer = calculateYieldTotal(msg.sender);
    require(toTransfer >= 0, "nothing to withdraw");
    stakeStartTime[msg.sender] = block.timestamp;
    _mint(msg.sender, toTransfer);
  }

  function realize(uint256 _amount) public {
    uint256 amount = _amount * tokenDecimals;
    require(balanceOf(msg.sender) >= amount, "insufficient balance");
    require(amount > 0, "cannot realize 0");
    uint256 floorPrice = amm.fsl() / hlm.totalSupply();
    _burn(msg.sender, amount);
    usdc.transferFrom(msg.sender, address(amm), amount * floorPrice);
    hlm.mint(msg.sender, amount);
  }

}