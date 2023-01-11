//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { ERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { ILocks } from "./interfaces/ILocks.sol";
import { IBorrow } from "./interfaces/IBorrow.sol";
import { IAMM } from "./interfaces/IAMM.sol";

contract Porridge is ERC20("Porridge Token", "PRG") {

  IERC20 honey;
  ILocks ilocks;
  IAMM iamm;
  IBorrow iborrow;

  mapping(address => uint256) public staked;
  mapping(address => uint256) public stakeStartTime;

  uint256 public constant DAYS_SECONDS = 86400e18;
  uint8 public constant DAILY_EMISSISIONS = 200;
  address public adminAddress;
  address public ammAddress;
  address public locksAddress;

  constructor(address _ammAddress, address _locksAddress, address _borrowAddress, address _adminAddress) {
    iamm = IAMM(_ammAddress);
    ilocks = ILocks(_locksAddress);
    iborrow = IBorrow(_borrowAddress);
    adminAddress = _adminAddress;
    ammAddress = _ammAddress;
  }

  modifier onlyAdmin() {
    require(msg.sender == adminAddress, "not admin");
    _;
  }

  function getStaked(address _user) external view returns (uint256) {
    return staked[_user];
  }

  function stake(uint256 _amount) external {
    require(_amount > 0, "cannot stake zero");
    if(staked[msg.sender] > 0) {
      _distributeYield(msg.sender);
    }
    stakeStartTime[msg.sender] = block.timestamp;
    staked[msg.sender] += _amount;
    IERC20(locksAddress).transferFrom(msg.sender, address(this), _amount);
  }

  function unstake(uint256 _amount) external returns (uint256 _yield) {
    require(_amount > 0, "cannot unstake zero");
    require(staked[msg.sender] >= _amount, "insufficient staked balance");
    require(_amount <= staked[msg.sender] - iborrow.getLocked(msg.sender), "you are currently borrowing against your locks");
    _yield = _distributeYield(msg.sender);
    staked[msg.sender] -= _amount;
    IERC20(locksAddress).transfer(msg.sender, _amount);
  }

  function claim() external returns (uint256 _yield){
    _yield = _distributeYield(msg.sender);
  }

  function realize(uint256 _amount) external {
    require(_amount > 0, "cannot realize 0");
    uint256 floorPrice = iamm.floorPrice();    
    _burn(msg.sender, _amount);
    honey.transferFrom(msg.sender, ammAddress, (_amount * floorPrice) / 1e18);
    ilocks.porridgeMint(msg.sender, _amount);
  }

  function _distributeYield(address _user) private returns (uint256 _yield) {
    _yield = _calculateYield(_user);
    require(_yield > 0, "nothing to distribute");
    stakeStartTime[_user] = block.timestamp;
    _mint(_user, _yield);
  }

  function _calculateYield(address _user) public view returns (uint256) {
    uint256 _time = _timeStaked(_user);
    uint256 _yieldPortion = staked[_user] / DAILY_EMISSISIONS;
    uint256 _yield = (_yieldPortion * ((_time * 1e18 * 1e18) / DAYS_SECONDS)) / 1e18;
    return _yield;
  }

  function _timeStaked(address _user) private view returns (uint256) {
    return block.timestamp - stakeStartTime[_user];
  }

  function setLocksAddress(address _locksAddress) public onlyAdmin {
    locksAddress = _locksAddress;
  }

  function setHoneyAddress(address _honeyAddress) public onlyAdmin {
    honey = IERC20(_honeyAddress);
  }

}