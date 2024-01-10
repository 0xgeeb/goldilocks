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


/// @title YieldSplitter
/// @notice Splits yield bearing tokens in yield and principal tokens
/// @author ampnoob
/// @author geeb
contract YieldSplitter {

  uint256 startDate;
  uint256 endDate;
  uint256 concludeDate;
  uint256 finalYield;
  address treasury;
  bool concluded = false;

    // //specify addresses of the ownership and yield tokens, and the vault's start and end dates
    // constructor(address _YTAddress, address _OTAddress, uint256 _enddate, uint256 _startdate) {
    //     //placeholder for whatever assets will be deposited to the vault (honey/IBGT address is not the correct testnet address)
    //     honey = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    //     IBGT = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    //     OT = OwnershipToken(_OTAddress);
    //     YT = YieldToken(_YTAddress);
    //     endDate = _enddate;
    //     startDate = _startdate;
    // }

    // //function for depositing honey into the vault in exchange for ownership and yield tokens
    // function deposit(uint256 _amount) public {
    //     //check they have enough to deposit, take the deposit and mint them the corresponding number of ownership tokens
    //     require(honey.balanceOf(msg.sender) >= _amount);
    //     honey.transferFrom(msg.sender, address(this), _amount);
    //     //here, we want to insert code that takes the deposited honey and stakes it into the berps vault
    //     //also claim existing yield
    //     claim();
    //     //mint the ownership tokens equal to the size of the deposit
    //     OT.mint(msg.sender, _amount);
    //     //amount of time left
    //     _remaining = endDate - block.timestamp;
    //     //require remaining time be at least one month
    //     require(_remaining >= 1*months, "insufficent time remaining");
    //     //calculates what proportion of the vault's total duration is remaining
    //     uint256 timeshare = (_remaining)*10**18/(1*years); 
    //     //calculates how many yield tokens to give the buyer by multiplying their share of the vault by the percentage of the vault's duration that occurs after the buy
    //     uint yieldShare = (_amount*timeshare)/10**18;
    //     //mints them yield tokens in proportion to their yieldshare
    //     YT.mint(msg.sender, yieldShare);
    // }

    // //function for claiming the BGT yield from the vault to the contract
    // function claim() public {
    //     //code for claiming BGT yield from vaults
    //     //code for using BGT to mint IBGT and stake it
    //     //code for claiming IBGT staking rewards and sending them to the treasury
    // }


    // //function for concluding the vault at expiry
    // function conclude() public {
    //     //check vault has expired but has not yet concluded
    //     require(block.timestamp >= endDate && concluded == false);
    //     //record that vault has concluded
    //     concluded = true; 
    //     //record time of conclusion
    //     concludeDate = block.timestamp;
    //     //record final claimable yield amount (-2% cut for treasury)
    //     finalYield = IBGT.balanceOf(address(this))*98/100; 
    //     //send the 2% cut to the treasury
    //     IBGT.transferFrom(address(this), treasury, IBGT.balanceOf(address(this))*2/100);
    //     //code to unstake all honey from the vault (and, if not done automatically, claim outstanding yield and convert it to IBGT)
    //     //code to unstake all the contract's IBGT (and send any outstanding IBGT staking rewards to treasury)
    // }

    // //function for redeeming yield tokens for proportional share of the yield accrued by the vault after vault expiration
    // function redeemYield(uint256 _amount) public {
    //     //check vault has concluded -- note, we need +36 hours because of berps withdrawal delay
    //     require(block.timestamp >= concludeDate + 36*hours && concluded == true);
    //     //can only redeem fair share
    //     require(YT.balanceOf(msg.sender) >= _amount);
    //     //calculates their proportion of the vault's yield
    //     uint256 yieldShare = _amount*10**18/YT.totalSupply;
    //     //calculates their share of the total yield
    //     uint claimable = (rawYield*yieldShare)/10**18;
    //     //burns their yield tokens
    //     YT.burn(msg.sender, _amount);
    //     //pays them their share of the yield
    //     IBGT.transferFrom(address(this), msg.sender, claimable);
    // }

    // //function for withdrawing assets from the vault after expiration
    // function redeemOwnership(uint256 _amount) public {
    //     //check vault has concluded -- note, we need +36 hours because of berps withdrawal delay 
    //     require(block.timestamp >= concludeDate && concluded == true);
    //     //checks they have enough ownership tokens
    //     require(OT.balanceOf(msg.sender) >= _amount);
    //     //burns their ownership tokens
    //     OT.burn(msg.sender, _amount);
    //     //allows them to withdraw their owned assets
    //     honey.transferFrom(address(this), msg.sender, _amount);
    // }

    // //function for renewing a concluded vault after users have had a chance to claim
    // function renew(uint256 _amount) public {
    //     //require that the vault has been concluded for at least 2 weeks
    //     require(concluded == true && block.timestamp >= concludeDate + 2*weeks); 
    //     //reset start/end dates
    //     startDate = block.timestamp;
    //     endDate = startDate + 1*years; 
    //     //update concluded variable
    //     concluded = false;
    // }
// staking honey on berps
// staking honey on bend
// supplying btc on bend
// supplying eth on bend
}