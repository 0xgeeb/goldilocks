//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./AMM.sol";
import "./LocksToken.sol";
import "./Borrow.sol";

// need to add onlyAdmin() modifier

contract PorridgeToken is ERC20("Porridge Token", "PRG") {

  IERC20 usdc;
  LocksToken locks;
  AMM amm;
  Borrow borrow;

  mapping(address => uint256) public staked;
  mapping(address => uint256) public stakeStartTime;

  uint32 public constant DAYS_SECONDS = 86400;
  uint8 public constant DAILY_EMISSISIONS = 200;

  constructor(address _ammAddress, address _locksAddress, address _borrowAddress) {
    amm = AMM(_ammAddress);
    locks = LocksToken(_locksAddress);
    borrow = Borrow(_borrowAddress);
    usdc = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
  }

  function mint(address _to, uint256 _amount) public {
    _mint(_to, _amount);
  }

  function burn(address _from, uint256 _amount) public {
    _burn(_from, _amount);
  }

  function getStaked(address _user) public view returns (uint256) {
    return staked[_user];
  }

  function timeStaked(address _user) public view returns (uint256) {
    return block.timestamp - stakeStartTime[_user];
  }

  function calculateYield(address _user) public view returns (uint256) {
    uint256 _time = timeStaked(_user);
    uint256 _yieldPortion = staked[_user] / DAILY_EMISSISIONS;
    uint256 _yield = _yieldPortion * (_time / DAYS_SECONDS);
    return _yield;
  }

  function stake(uint256 _amount) public {
    require(_amount > 0, "cannot stake zero");
    require(locks.balanceOf(msg.sender) >= _amount, "insufficient locks balance");
    if(staked[msg.sender] > 0) {
      _distributeYield(msg.sender);
    }
    stakeStartTime[msg.sender] = block.timestamp;
    staked[msg.sender] += _amount;
    locks.transferFrom(msg.sender, address(this), _amount);
  }

  function unstake(uint256 _amount) public {
    require(_amount > 0, "cannot unstake zero");
    require(staked[msg.sender] >= _amount, "insufficient staked balance");
    require(_amount <= staked[msg.sender] - borrow.getLocked(msg.sender), "you are currently borrowing against your locks");
    _distributeYield(msg.sender);
    staked[msg.sender] -= _amount;
    locks.transfer(msg.sender, _amount);
  }

  function claim() public {
    _distributeYield(msg.sender);
  }

  function realize(uint256 _amount) public {
    require(_amount > 0, "cannot realize 0");
    require(balanceOf(msg.sender) >= _amount, "insufficient balance");
    uint256 floorPrice = amm.fsl() / locks.totalSupply();
    require(usdc.balanceOf(msg.sender) >= (_amount*(10**6) * floorPrice) && usdc.allowance(msg.sender, address(this)) >= (_amount*(10**6) * floorPrice), "insufficient funds/allowance");
    _burn(msg.sender, _amount);
    usdc.transferFrom(msg.sender, address(amm), (_amount*(10**6)) * floorPrice);
    locks.mint(msg.sender, _amount);
  }

  function _distributeYield(address _user) internal {
    uint256 _yield = calculateYield(_user);
    require(_yield > 0, "nothing to distribute");
    stakeStartTime[_user] = block.timestamp;
    _mint(_user, _yield);
  }

}