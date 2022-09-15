//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./AMM.sol";
import "./LocksToken.sol";

// need to change onlyAdmin() modifier
// updateStake can be exploited, need to change

contract PorridgeToken is ERC20("Porridge Token", "PRG") {

  IERC20 usdc;
  LocksToken locks;
  AMM amm;

  mapping(address => uint256) public staked;
  mapping(address => uint256) public stakeStartTime;

  constructor(address _ammAddress, address _locksAddress) {
    amm = AMM(_ammAddress);
    locks = LocksToken(_locksAddress);
    usdc = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
  }

  event Realise(address indexed user, uint256 indexed amountRealised);

  modifier onlyAdmin() {
    require(msg.sender == address(amm), "not authorized");
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

  function timeStaked(address _user) public view returns (uint256) {
    return block.timestamp - stakeStartTime[_user];
  }

  function calculateYield(address _user) public view returns (uint256) {
    uint256 _time = timeStaked(_user);
    uint256 rawYield = (_time * staked[_user]/100)/86400;
    return rawYield;
  }

  function stake(uint256 _amount) public {
    require(locks.balanceOf(msg.sender) >= _amount, "insufficient balance");
    require(_amount > 0, "cannot stake zero");
    if(staked[msg.sender] > 0) {
      uint256 _yield = calculateYield(msg.sender);
      _mint(msg.sender, _yield);
    }
    locks.transferFrom(msg.sender, address(this), _amount);
    staked[msg.sender] += _amount;
    stakeStartTime[msg.sender] = block.timestamp;
  }

  function unstake(uint256 _amount) public {
    require(staked[msg.sender] >= _amount, "insufficient staked balance");
    require(_amount > 0, "cannot unstake zero");
    uint256 _yield = calculateYield(msg.sender);
    stakeStartTime[msg.sender] = block.timestamp;
    staked[msg.sender] -= _amount;
    locks.transfer(msg.sender, _amount);
    _mint(msg.sender, _yield);
  }

  function claim() public {
    uint256 _yield = calculateYield(msg.sender);
    require(_yield >= 0, "nothing to withdraw");
    stakeStartTime[msg.sender] = block.timestamp;
    _mint(msg.sender, _yield);
  }

  function realize(uint256 _amount) public {
    require(balanceOf(msg.sender) >= _amount, "insufficient balance");
    require(_amount > 0, "cannot realize 0");
    uint256 floorPrice = amm.fsl() / locks.totalSupply();
    _burn(msg.sender, _amount);
    usdc.transferFrom(msg.sender, address(amm), _amount * floorPrice);
    locks.mint(msg.sender, _amount);
    emit Realise(msg.sender, _amount);
  }

}