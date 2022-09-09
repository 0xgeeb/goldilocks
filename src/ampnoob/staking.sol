//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./setup.sol";
import "./RWDtoken.sol";

//Contract for staking HLM
contract Staking is RWDToken {

    constructor(){}

    //points to the HLM token
    IERC20 hlm = IERC20(0x6DD708FCD926977FF3Da4c8a56d2F192A36faEE4);

     //Track RWD balances
    mapping(address => uint) RWDBalances;
    //Tracks (unlocked) staked HLM balances 
    mapping(address => uint) staked;
    //Tracks staking times
    mapping(address => uint) stakeStartTime;

    //event tracking staking
    event Stake(address indexed user, uint indexed amountStaked);
    //event tracking unstaking
    event Unstake(address indexed user, uint indexed amountUnstaked);
    //event tracking unstaking
    event YieldWithdraw(address indexed user, uint indexed amountClaimed);

    //function for calculating how long as user has been staking
    function calculateYieldTime(address user) public view returns(uint256) {
        //gets current time
        uint end = block.timestamp;
        //compares current time to time they started taking to get time staked since last yield claim
        uint totalTime = end - stakeStartTime[user];
        return totalTime;
    }

       //function for calculating outstanding staking yield
    function calculateYieldTotal(address user) public view returns(uint256) {
        //gets users staking time
        uint time = calculateYieldTime(user);
        //want stakers to get 1 RWD per day for every 100 HLM staked (86400 seconds in a day)
        uint rawYield = ((time*staked[user])/100)/86400;
        return rawYield;
    }

    //Function for staking HLM balance
    function stake(uint amount) public {
        //take decimals into account
        uint _amount = amount*(10**18);
        //in case of msg.sender variation from calling external functions
        address user = msg.sender;
        //check that unstaked balance is sufficient
        require(hlm.balanceOf(user) >= _amount, "Insufficient Balance");
        //check that amount staked is non-zero
        require(_amount > 0, "Can't stake zero");
        //checks if they are already staking and returns them their outstanding yield if they are
        if(staked[user] > 0){
            uint256 toTransfer = calculateYieldTotal(user);
            RWDmint(user, toTransfer);
            RWDBalances[user] += toTransfer;
        }
        //transfers HLM from whoever called the stake function to the staking contract
        hlm.transferFrom(user, address(this), amount);
        //updates user's staked balance
        staked[user] += _amount;
        //resets the user's staking timer
        stakeStartTime[user] = block.timestamp;
        //records staking event
        emit Stake(user, amount);
    }

    //function for unstaking HLM tokens
    function unstake(uint256 amount) public {
        //in case of msg.sender variation from calling external functions
        address user = msg.sender;
        //check that staked balance is sufficient
        require(staked[user] >= amount, "Insufficient Staked Balance");
        //check that amount unstaked is non-zero
        require(amount > 0, "Can't unstake zero");
        //calculates user's outstanding yield
        uint256 yieldTransfer = calculateYieldTotal(user);
        //reset's user's staking time
        stakeStartTime[user] = block.timestamp;
        //This is to prevent reentry attacks -- learn more and double check it
        uint256 balanceTransfer = amount;
        amount = 0;
        //updates user's staking balance
        staked[user] -= balanceTransfer;
        //transfers HLM to whoever called the unstake function from the farm contract and updates their balance
        hlm.transferFrom(address(this), user, balanceTransfer);
        //pay them their yield
        RWDBalances[user] += yieldTransfer;
        RWDmint(user, yieldTransfer);
        //records unstaking event
        emit Unstake(user, balanceTransfer);
    }

    //function for claiming yield
    function withdrawYield() public {
        //in case of msg.sender variation from calling external functions
        address user = msg.sender;
        //calculate outstanding yield
        uint256 toTransfer = calculateYieldTotal(user);
        //check that there's yield to claim
        require(toTransfer > 0, "nothing to withdraw");
        //resets user's staking time
        stakeStartTime[user] = block.timestamp;
        //mints tokens to pay the user and updates balance
        RWDmint(user, toTransfer);
        RWDBalances[user] += toTransfer;
        //records yield claiming event
        emit YieldWithdraw(user, toTransfer);
    }

}