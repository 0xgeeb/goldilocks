//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./staking.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./AMM.sol";

//Contract for borrowing backing of locked tokens and repaying loans
contract Borrow is Staking {

    //designates developer wallet for claiming origination fees
    address dev_wallet = 0x17F6AD8Ef982297579C203069C1DbfFE4348c372;
    //address of the AMM
    address AMMAddress = 0x17F6AD8Ef982297579C203069C1DbfFE4348c372;
    //instantiate AMM contract
    AMM amm = AMM(AMMAddress);

    //usdc token
    IERC20 usdcToken = IERC20(0x6A9865aDE2B6207dAAC49f8bCba9705dEB0B0e6D);

     //Track HLM locked balances
    mapping(address => uint) locked;
    //Track amount borrowed
    mapping(address => uint) borrowed;
    //event tracking user loans
    event Borrowed(address indexed user, uint indexed amountBorrowed);
    //event tracking loan repayments
    event Repay(address indexed user, uint indexed amountRepaid);

    function AMMBalance() public view returns(uint) {
        uint balance = usdcToken.balanceOf(AMMAddress);
        return(balance);
    }

        //function for borrowing floor price against staked HLM
    function borrow(uint amount) public {
         //taking decimals into account
        uint _amount = amount*(10**18);
        //making sure we point to the sender of the transaction rather than the contract
        address user = msg.sender;
        //get floor price
        uint floor_price = amm.fsl()/hlm.totalSupply();
        // get total balance
        uint  staked_balance = staked[user];
         //require that the backing of their unlocked staked balance is at least as great as the amount they are trying to borrow
        require((floor_price * staked_balance) >= _amount, "Insufficient borrow limit");
        // require that the borrow amount is non-zero
        require(amount > 0, "Can't borrow zero");
        //update their locked balance
        locked[user] += amount;
        //update their staked balance
        staked[user] -= amount;
        //work out the origination fee
        uint fee = (_amount/100)*3;
        // pays out loan
        usdcToken.transferFrom(AMMAddress, user, amount-fee);
        //pays origination fee to devs -- need to create an approval mechanism for the dev wallets
        usdcToken.transferFrom(AMMAddress, dev_wallet, fee);
        //updates their loan record
        borrowed[user] += _amount;
        //records loan event
        emit Borrowed(user, amount);
    }

    //function for repaying loans
    function repay(uint amount) public {
          //taking decimals into account
        uint _amount = amount*(10**18);
        //making sure we point to the sender of the transaction rather than the contract
        address user = msg.sender;
        //get floor price
        uint floor_price = amm.fsl()/hlm.totalSupply();
        //checks they aren't overpaying on their loan
        require(_amount <= borrowed[user], "Repaying too much");
        //checks they are repaying more than zero
        require(_amount > 0, "Can't repay zero");
        //repays loan
        usdcToken.transferFrom(user, AMMAddress, _amount);
        //unlocks the number of tokens for which they repaid the floor price
        locked[user] -= (_amount/floor_price);
        //updates staking balance
        staked[user] += (_amount/floor_price);
        //upates loan record
        borrowed[user] -= _amount;
        //records repay event
        emit Repay(user, amount);
    }

}