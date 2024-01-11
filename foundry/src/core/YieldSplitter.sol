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
// ======================================= YieldSplitter ========================================
// ==============================================================================================


import { FixedPointMathLib } from "../../lib/solady/src/utils/FixedPointMathLib.sol";
import { SafeTransferLib } from "../../lib/solady/src/utils/SafeTransferLib.sol";
// import { IERC20 } from "../../lib/solady/src/tokens/IERC20.sol";
import { OT } from "./OT.sol";
import { YT } from "./YT.sol";


/// @title YieldSplitter
/// @notice Splits yield bearing tokens in yield and principal tokens
/// @author ampnoob
/// @author geeb
contract YieldSplitter {

  OT ot;
  YT yt;
  uint256 startDate;
  uint256 endDate;
  uint256 concludeTime;
  uint256 finalYield;
  address treasury;
  address honey;
  address ibgt;
  bool concluded = false;

  error InsufficientTime();
  error NotExpired();
  error AlreadyConcluded();

  constructor(
    address _ot, 
    address _yt,
    address _treasury,
    address _honey,
    address _ibgt
  ) {
    ot = OT(_ot);
    yt = YT(_yt);
    treasury = _treasury;
    honey = _honey;
    ibgt = _ibgt;
  }

  /// @notice Deposits $HONEY into vault to receive ownership and yield tokens
  /// @param amount Amount of tokens to deposit
  function deposit(uint256 amount) external {
    uint256 remainingTime = endDate - block.timestamp;
    if(remainingTime < 30 days) revert InsufficientTime();
    uint256 timeshare = remainingTime / 365 days;
    _claim();
    SafeTransferLib.safeTransferFrom(honey, msg.sender, address(this), amount);
    ot.mint(msg.sender, amount);
    yt.mint(msg.sender, amount * timeshare);
  }

  function conclude() external {
    if(block.timestamp < endDate) revert NotExpired();
    if(concluded) revert AlreadyConcluded();
    concluded = true;
    concludeTime = block.timestamp;
    // uint256 finalYield = (IERC20(ibgt).balanceOf(address(this)) / 100) * 98;
    // IERC20(ibgt).transfer(treasury, IERC20(ibgt).balanceOf(address(this)) / 100) * 2;
    //code to unstake all honey from the vault (and, if not done automatically, claim outstanding yield and convert it to IBGT)
    //code to unstake all the contract's IBGT (and send any outstanding IBGT staking rewards to treasury)
  }

  function _claim() internal {
    //code for claiming BGT yield from vaults
    //code for using BGT to mint IBGT and stake it
    //code for claiming IBGT staking rewards and sending them to the treasury
  }
}