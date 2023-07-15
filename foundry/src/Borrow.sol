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


import { SafeTransferLib } from "../lib/solady/src/utils/SafeTransferLib.sol";
import { FixedPointMathLib } from "../lib/solady/src/utils/FixedPointMathLib.sol";
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


  mapping(address => uint256) public lockedLocks;
  mapping(address => uint256) public borrowedHoney;

  address public honeyAddress;
  address public adminAddress;
  address public gammAddress;
  address public porridgeAddress;


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                          CONSTRUCTOR                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Constructor of this contract
  /// @param _gammAddress Address of the GAMM
  /// @param _honeyAddress Address of the HONEY contract
  /// @param _adminAddress Address of the GoldilocksDAO multisig
  constructor(address _gammAddress, address _honeyAddress, address _adminAddress) {
    gammAddress = _gammAddress;
    honeyAddress = _honeyAddress;
    adminAddress = _adminAddress;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           ERRORS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  error NotAdmin();
  error InsufficientBorrowLimit();
  error ExcessiveRepay();


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           EVENTS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  event Borrowed(address indexed user, uint256 amount);
  event Repaid(address indexed user, uint256 amount);


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                         MODIFIERS                          */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Ensures msg.sender is the admin address
  modifier onlyAdmin() {
    if(msg.sender != adminAddress) revert NotAdmin();
    _;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                       VIEW FUNCTIONS                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice View locked $LOCKS tokens of a user
  /// @param user Address of user
  /// @return locked $LOCKS of user
  function getLocked(address user) external view returns (uint256) {
    return lockedLocks[user];
  }

  /// @notice View borrowed $HONEY of a user
  /// @param user Address of user
  /// @return borrowed $HONEY of user
  function getBorrowed(address user) external view returns (uint256) {
    return borrowedHoney[user];
  }

  /// @notice View borrow limit of a user
  /// @param user Address of user
  /// @return limit Limit of user
  function borrowLimit(address user) external view returns (uint256) {
    uint256 floorPrice = IGAMM(gammAddress).floorPrice();
    return _borrowLimit(user, floorPrice);
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                    EXTERNAL FUNCTIONS                      */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Using staked $LOCKS as collateral, lends $HONEY
  /// @param amount Amount of $HONEY to borrow
  function borrow(uint256 amount) external {
    uint256 floorPrice = IGAMM(gammAddress).floorPrice();
    if(!_borrowLimitCheck(amount, floorPrice)) revert InsufficientBorrowLimit();
    lockedLocks[msg.sender] += amount / floorPrice;
    borrowedHoney[msg.sender] += amount;
    uint256 fee = _calcFee(amount);
    IGAMM(gammAddress).borrowTransfer(msg.sender, amount, fee);
    emit Borrowed(msg.sender, amount);
  }

  /// @notice Repays $HONEY loans
  /// @param amount Amount of $HONEY to repay
  function repay(uint256 amount) external {
    if(borrowedHoney[msg.sender] < amount) revert ExcessiveRepay();
    uint256 repaidLocks = _calcRepayingLocks(amount);
    lockedLocks[msg.sender] -= repaidLocks;
    borrowedHoney[msg.sender] -= amount;
    SafeTransferLib.safeTransferFrom(honeyAddress, msg.sender, gammAddress, amount);
    emit Repaid(msg.sender, amount);
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      INTERNAL FUNCTIONS                    */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Calculates the amount of $LOCKS to return to users
  /// @param amount Amount of $HONEY user is repaying with
  /// @return repaidLocks Amount of $LOCKS that is returned to user
  function _calcRepayingLocks(uint256 amount) internal view returns (uint256 repaidLocks) {
    repaidLocks = (amount / borrowedHoney[msg.sender]) * lockedLocks[msg.sender];
  }

  /// @notice Checks if the user has enough borrowing power
  /// @param amount Amount of $HONEY the user is requesting to borrow
  /// @param floorPrice Current floor price of $LOCKS
  /// @return check Returns true if the user has enough borrowing power
  function _borrowLimitCheck(uint256 amount, uint256 floorPrice) internal view returns (bool check) {
    uint256 limit = _borrowLimit(msg.sender, floorPrice);
    check = limit <= amount;
  }

  /// @notice Checks if the user has enough borrowing power
  /// @param user Address of user
  /// @param floorPrice Current floor price of $LOCKS
  /// @return limit Returns the borrowing power of the user
  function _borrowLimit(address user, uint256 floorPrice) internal view returns (uint256 limit) {
    uint256 staked = IPorridge(porridgeAddress).getStaked(user);
    uint256 locked = lockedLocks[user];
    limit = FixedPointMathLib.mulWad(floorPrice, staked - locked);
  }

  /// @notice Calculates the fee for borrowing
  /// @param amount Amount of $HONEY the user is requesting to borrow
  /// @return fee Fee that user pays for borrowing
  function _calcFee(uint256 amount) internal pure returns (uint256 fee) {
    return (amount / 100) * 3;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                       ADMIN FUNCTIONS                      */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Set address of Porridge contract
  /// @param _porridgeAddress Address of Porridge contract
  function setPorridgeAddress(address _porridgeAddress) external onlyAdmin {
    porridgeAddress = _porridgeAddress;
  }

}