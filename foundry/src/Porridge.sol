//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./Locks.sol";
import "./AMM.sol";
import "./Borrow.sol";

contract Porridge is ERC20("Porridge Token", "PRG") {

  IERC20 stable;
  Locks locks;
  AMM amm;
  Borrow borrow;

  mapping(address => uint256) public staked;
  mapping(address => uint256) public stakeStartTime;

  uint256 public constant DAYS_SECONDS = 86400e18;
  uint8 public constant DAILY_EMISSISIONS = 200;
  uint256 public stableDecimals = 1e12;
  address public adminAddress;

  constructor(address _ammAddress, address _locksAddress, address _borrowAddress, address _adminAddress) {
    locks = Locks(_locksAddress);
    amm = AMM(_ammAddress);
    borrow = Borrow(_borrowAddress);
    adminAddress = _adminAddress;
    stable = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
  }

  modifier onlyAdmin() {
    require(msg.sender == adminAddress, "not admin");
    _;
  }

  function getStaked(address _user) public view returns (uint256) {
    return staked[_user];
  }

  function timeStaked(address _user) public view returns (uint256) {
    return block.timestamp - stakeStartTime[_user];
  }

  function stake(uint256 _amount) public {
    require(_amount > 0, "cannot stake zero");
    if(staked[msg.sender] > 0) {
      _distributeYield(msg.sender);
    }
    stakeStartTime[msg.sender] = block.timestamp;
    staked[msg.sender] += _amount;
    locks.transferFrom(msg.sender, address(this), _amount);
  }

  function unstake(uint256 _amount) public returns (uint256 _yield) {
    require(_amount > 0, "cannot unstake zero");
    require(staked[msg.sender] >= _amount, "insufficient staked balance");
    require(_amount <= staked[msg.sender] - borrow.getLocked(msg.sender), "you are currently borrowing against your locks");
    _yield = _distributeYield(msg.sender);
    staked[msg.sender] -= _amount;
    locks.transfer(msg.sender, _amount);
  }

  function claim() public returns (uint256 _yield){
    _yield = _distributeYield(msg.sender);
  }

  function realize(uint256 _amount) public {
    require(_amount > 0, "cannot realize 0");
    require(balanceOf(msg.sender) >= _amount, "insufficient balance");
    uint256 floorPrice = amm.floorPrice();    
    _burn(msg.sender, _amount);
    stable.transferFrom(msg.sender, address(amm), ((_amount * floorPrice) / 1e18) / stableDecimals);
    locks.porridgeMint(msg.sender, _amount);
  }

  function _distributeYield(address _user) private returns (uint256 _yield) {
    _yield = _calculateYield(_user);
    require(_yield > 0, "nothing to distribute");
    stakeStartTime[_user] = block.timestamp;
    _mint(_user, _yield);
  }

  function _calculateYield(address _user) private view returns (uint256) {
    uint256 _time = timeStaked(_user);
    uint256 _yieldPortion = staked[_user] / DAILY_EMISSISIONS;
    uint256 _yield = (_yieldPortion * ((_time * 1e18 * 1e18) / DAYS_SECONDS)) / 1e18;
    return _yield;
  }

}