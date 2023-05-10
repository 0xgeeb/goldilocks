//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { IAMM } from "./interfaces/IAMM.sol";
import { IPorridge } from "./interfaces/IPorridge.sol";

/// @title Borrow
/// @author @0xgeeb
/// @author @kingkongshearer
/// @dev Goldilocks Borrowing
contract Borrow {

  IAMM iamm;
  IPorridge iporridge;
  IERC20 honey;
  address public adminAddress;
  address public ammAddress;
  address public locksAddress;
  address public porridgeAddress;

  mapping(address => uint256) public lockedLocks;
  mapping(address => uint256) public borrowedHoney;


  constructor(address _ammAddress, address _locksAddress, address _adminAddress) {
    iamm = IAMM(_ammAddress);
    adminAddress = _adminAddress;
    locksAddress = _locksAddress;
    ammAddress = _ammAddress;
  }

  modifier onlyAdmin() {
    require(msg.sender == adminAddress, "not admin");
    _;
  }

  function getLocked(address _user) external view returns (uint256) {
    return lockedLocks[_user];
  }

  function getBorrowed(address _user) external view returns (uint256) {
    return borrowedHoney[_user];
  }

  /// @dev using staked $LOCKS as collateral, lends $HONEY
  function borrow(uint256 _amount) external returns (uint256) {
    require(_amount > 0, "cannot borrow zero");
    uint256 _floorPrice = iamm.floorPrice();
    uint256 _stakedLocks = iporridge.getStaked(msg.sender);
    require(_floorPrice * (_stakedLocks - lockedLocks[msg.sender]) / (1e18) >= _amount, "insufficient borrow limit");
    lockedLocks[msg.sender] += (_amount * (1e18)) / _floorPrice;
    borrowedHoney[msg.sender] += _amount;
    uint256 _fee = (_amount / 100) * 3;
    IERC20(locksAddress).transferFrom(porridgeAddress, address(this), (_amount * (1e18)) / _floorPrice);
    honey.transferFrom(ammAddress, msg.sender, _amount - _fee);
    honey.transferFrom(ammAddress, adminAddress, _fee);
    return _amount - _fee;
  }

  /// @dev repays loan in $HONEY
  function repay(uint256 _amount) external {
    require(_amount > 0, "cannot repay zero");
    require(borrowedHoney[msg.sender] >= _amount, "repaying too much");
    uint256 _repaidLocks = (((_amount * 1e18) / borrowedHoney[msg.sender]) * lockedLocks[msg.sender]) / 1e18;
    lockedLocks[msg.sender] -= _repaidLocks;
    borrowedHoney[msg.sender] -= _amount;
    honey.transferFrom(msg.sender, ammAddress, _amount);
    IERC20(locksAddress).transfer(porridgeAddress, _repaidLocks);
  }

  function setPorridge(address _porridgeAddress) public onlyAdmin {
    iporridge = IPorridge(_porridgeAddress);
    porridgeAddress = _porridgeAddress;
  }

  function setHoneyAddress(address _honeyAddress) public onlyAdmin {
    honey = IERC20(_honeyAddress);
  }

}