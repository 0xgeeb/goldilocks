//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


// |============================================================================================|
// |    ______      _____    __      _____    __   __       _____     _____   __  __   ______   |
// |   /_/\___\    ) ___ (  /\_\    /\ __/\  /\_\ /\_\     ) ___ (   /\ __/\ /\_\\  /\/ ____/\  |
// |   ) ) ___/   / /\_/\ \( ( (    ) )  \ \ \/_/( ( (    / /\_/\ \  ) )__\/( ( (/ / /) ) __\/  |
// |  /_/ /  ___ / /_/ (_\ \\ \_\  / / /\ \ \ /\_\\ \_\  / /_/ (_\ \/ / /    \ \_ / /  \ \ \    |
// |  \ \ \_/\__\\ \ )_/ / // / /__\ \ \/ / // / // / /__\ \ )_/ / /\ \ \_   / /  \ \  _\ \ \   |
// |   )_)  \/ _/ \ \/_\/ /( (_____() )__/ /( (_(( (_____(\ \/_\/ /  ) )__/\( (_(\ \ \)____) )  |
// |   \_\____/    )_____(  \/_____/\/___\/  \/_/ \/_____/ )_____(   \/___\/ \/_//__\/\____\/   |
// |                                                                                            |
// |============================================================================================|
// ==============================================================================================
// ========================================== Borrow ============================================
// ==============================================================================================


import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { IGAMM } from "./interfaces/IGAMM.sol";
import { IPorridge } from "./interfaces/IPorridge.sol";

/// @title Borrow
/// @notice Borrowing $HONEY against staked $LOCKS tokens
/// @author geeb
/// @author ampnoob
contract Borrow {


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      STATE VARIABLES                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  IGAMM igamm;
  IPorridge iporridge;
  IERC20 honey;
  address public adminAddress;
  address public gammAddress;
  address public porridgeAddress;
  mapping(address => uint256) public lockedLocks;
  mapping(address => uint256) public borrowedHoney;


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                          CONSTRUCTOR                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Constructor of this contract
  /// @param _gammAddress Address of the GAMM
  /// @param _adminAddress Address of the GoldilocksDAO multisig
  constructor(address _gammAddress, address _adminAddress) {
    igamm = IGAMM(_gammAddress);
    adminAddress = _adminAddress;
    gammAddress = _gammAddress;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           ERRORS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  error NotAdmin();


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           EVENTS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  // todo: add these


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                         MODIFIERS                          */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  modifier onlyAdmin() {
    if(msg.sender == adminAddress) revert NotAdmin();
    _;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                       VIEW FUNCTIONS                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice View locked $LOCKS tokens of a user
  /// @param _user Address of user
  /// @return locked $LOCKS of user
  function getLocked(address _user) external view returns (uint256) {
    return lockedLocks[_user];
  }

  /// @notice View borrowed $HONEY of a user
  /// @param _user Address of user
  /// @return borrowed $HONEY of user
  function getBorrowed(address _user) external view returns (uint256) {
    return borrowedHoney[_user];
  }

  // todo: clean these up
  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                    EXTERNAL FUNCTIONS                      */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @dev using staked $LOCKS as collateral, lends $HONEY
  function borrow(uint256 _amount) external returns (uint256) {
    uint256 _floorPrice = igamm.floorPrice();
    uint256 _stakedLocks = iporridge.getStaked(msg.sender);
    require(_floorPrice * (_stakedLocks - lockedLocks[msg.sender]) / (1e18) >= _amount, "insufficient borrow limit");
    lockedLocks[msg.sender] += (_amount * (1e18)) / _floorPrice;
    borrowedHoney[msg.sender] += _amount;
    uint256 _fee = (_amount / 100) * 3;
    IERC20(gammAddress).transferFrom(porridgeAddress, address(this), (_amount * (1e18)) / _floorPrice);
    honey.transferFrom(gammAddress, msg.sender, _amount - _fee);
    honey.transferFrom(gammAddress, adminAddress, _fee);
    return _amount - _fee;
  }

  /// @dev repays loan in $HONEY
  function repay(uint256 _amount) external {
    require(_amount > 0, "cannot repay zero");
    require(borrowedHoney[msg.sender] >= _amount, "repaying too much");
    uint256 _repaidLocks = (((_amount * 1e18) / borrowedHoney[msg.sender]) * lockedLocks[msg.sender]) / 1e18;
    lockedLocks[msg.sender] -= _repaidLocks;
    borrowedHoney[msg.sender] -= _amount;
    honey.transferFrom(msg.sender, gammAddress, _amount);
    IERC20(gammAddress).transfer(porridgeAddress, _repaidLocks);
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                       ADMIN FUNCTIONS                      */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Set address of Porridge contract
  /// @param _porridgeAddress Address of Porridge contract
  function setPorridge(address _porridgeAddress) public onlyAdmin {
    iporridge = IPorridge(_porridgeAddress);
    porridgeAddress = _porridgeAddress;
  }

  /// @notice Set address of $HONEY
  /// @param _honeyAddress Address of $HONEY
  function setHoneyAddress(address _honeyAddress) public onlyAdmin {
    honey = IERC20(_honeyAddress);
  }

}