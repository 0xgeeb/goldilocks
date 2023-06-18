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

  address public honeyAddress;
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
  constructor(address _gammAddress, address _honeyAddress, address _adminAddress) {
    igamm = IGAMM(_gammAddress);
    adminAddress = _adminAddress;
    gammAddress = _gammAddress;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           ERRORS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  error NotAdmin();
  error ExcessiveRepay();
  error InsufficientBorrowLimit();


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           EVENTS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  // todo: add these


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                         MODIFIERS                          */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  modifier onlyAdmin() {
    if(msg.sender != adminAddress) revert NotAdmin();
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


  /// @notice Using staked $LOCKS as collateral, lends $HONEY
  /// @param amount Amount of $HONEY to borrow
  function borrow(uint256 amount) external {
    uint256 floorPrice = igamm.floorPrice();
    if(floorPrice * (iporridge.getStaked(msg.sender) - lockedLocks[msg.sender]) < amount) revert InsufficientBorrowLimit();
    lockedLocks[msg.sender] += (amount * (1e18)) / floorPrice;
    borrowedHoney[msg.sender] += amount;
    uint256 fee = (amount / 100) * 3;
    igamm.borrowTransfer(msg.sender, amount, fee);
  }

  /// @notice Repays $HONEY loans
  /// @param amount Amount of $HONEY to repay
  function repay(uint256 amount) external {
    if(borrowedHoney[msg.sender] < amount) revert ExcessiveRepay();
    uint256 repaidLocks = _getRepayingLocks(amount);
    lockedLocks[msg.sender] -= repaidLocks;
    borrowedHoney[msg.sender] -= amount;
    SafeTransferLib.safeTransferFrom(honeyAddress, msg.sender, gammAddress, amount);
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      INTERNAL FUNCTIONS                    */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  function _getRepayingLocks(uint256 amount) internal returns (uint256 repaidLocks) {
    repaidLocks = (((amount * 1e18) / borrowedHoney[msg.sender]) * lockedLocks[msg.sender]) / 1e18;
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

}