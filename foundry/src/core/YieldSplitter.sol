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
import { ERC20 } from "../../lib/solady/src/tokens/ERC20.sol";
import { OT } from "./OT.sol";
import { YT } from "./YT.sol";


/// @title YieldSplitter
/// @notice Splits yield bearing tokens in yield and principal tokens
/// @author ampnoob
/// @author geeb
contract YieldSplitter {

  OT ot;
  YT yt;
  uint256 startTime;
  uint256 endTime;
  uint256 concludeTime;
  uint256 finalYield;
  address treasury;
  address honey;
  address ibgt;
  bool concluded = false;

  error InsufficientTime();
  error NotExpired();
  error NotConcluded();
  error AlreadyConcluded();
  error ExcessiveRedeem();

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
    uint256 remainingTime = endTime - block.timestamp;
    if(remainingTime < 30 days) revert InsufficientTime();
    uint256 timeshare = remainingTime / 365 days;
    _claim();
    SafeTransferLib.safeTransferFrom(honey, msg.sender, address(this), amount);
    ot.mint(msg.sender, amount);
    yt.mint(msg.sender, amount * timeshare);
  }

  /// @notice Concludes the vault at expiry
  function conclude() external {
    if(block.timestamp < endTime) revert NotExpired();
    if(concluded) revert AlreadyConcluded();
    concluded = true;
    concludeTime = block.timestamp;
    uint256 finalYield = (ERC20(ibgt).balanceOf(address(this)) / 100) * 98;
    SafeTransferLib.safeTransfer(ibgt, treasury, (ERC20(ibgt).balanceOf(address(this)) / 100) * 2);
    //code to unstake all honey from the vault (and, if not done automatically, claim outstanding yield and convert it to IBGT)
    //code to unstake all the contract's IBGT (and send any outstanding IBGT staking rewards to treasury)
  }

  /// @notice Redeems yield tokens for share of yield accrued to vault
  /// @param amount Amount of tokens to redeem
  function redeemYield(uint256 amount) external {
    if(block.timestamp < concludeTime + 36 hours || !concluded) revert NotConcluded();
    uint256 yieldShare = FixedPointMathLib.mulWad(amount, ERC20(yt).totalSupply());
    //todo: ask
    uint256 rawYield = 0;
    uint256 claimable = FixedPointMathLib.divWad(rawYield, yieldShare);
    YT(yt).burn(msg.sender, amount);

    SafeTransferLib.safeTransferFrom(ibgt, address(this), msg.sender, claimable);
  }

  /// @notice Withdraws assets from the vault 
  /// @param amount Amount of tokens to redeem
  function redeemOwnership(uint256 amount) external {
    uint256 remainingTime = block.timestamp > endTime ? 0 : endTime - block.timestamp;
    uint256 totalTimeDurationRatio = FixedPointMathLib.divWad(remainingTime, endTime - startTime);
    if(ERC20(yt).balanceOf(msg.sender) < FixedPointMathLib.mulWad(amount, totalTimeDurationRatio)) revert ExcessiveRedeem();
    OT(ot).burn(msg.sender, amount);
    YT(yt).burn(msg.sender, FixedPointMathLib.divWad(amount, totalTimeDurationRatio));
    if(remainingTime == 0) {
      SafeTransferLib.safeTransferFrom(honey, address(this), msg.sender, (amount / 100) * 98);
      SafeTransferLib.safeTransferFrom(honey, address(this), treasury, (amount / 100) * 2);
    }
    else {
      SafeTransferLib.safeTransferFrom(honey, address(this), msg.sender, amount);
    }
  }

  /// @notice Renews a concluded vault after users have chance to claim
  //todo: ask about amount
  function renew() external {
    if(block.timestamp < concludeTime + 2 weeks || !concluded) revert NotConcluded();
    startTime = block.timestamp;
    endTime = startTime + 365 days;
    concluded = false;
  }

  function _claim() internal {
    //code for claiming BGT yield from vaults
    //code for using BGT to mint IBGT and stake it
    //code for claiming IBGT staking rewards and sending them to the treasury
  }
}