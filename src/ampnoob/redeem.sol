//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./AMM.sol";

//Contract for redeeming HLM tokens for their floor value (minus 3% tax that gets redistributed to fsl)
contract Redeem is AMM {

    address AMMAddress = 0x17F6AD8Ef982297579C203069C1DbfFE4348c372;
    //instantiate AMM contract
    AMM amm = AMM(AMMAddress);

    //event tracking redemptions
    event Redeemed(address indexed user, uint indexed amountRedeemed);

    //main function for redeeming HLM tokens for floor price
    function redeem(uint amount) public {
         //taking decimals into account
        uint _amount = amount*(10**18);
        //making sure we point to the sender of the transaction rather than the contract
        address user = msg.sender;
        //check that unstaked balance is sufficient
        require(hlm.balanceOf(user) >= _amount, "Insufficient Balance");
        //check that amount redeemed is non-zero
        require(_amount > 0, "Can't stake zero");
        //gets floor price
        uint _floor_price = amm.fsl()/hlm.totalSupply();
        //user burns reward tokens
        hlm.burn(user, _amount);
        //gets floor value of tokens being redeemed
        uint raw_total = _amount*_floor_price;
        //gets tax value
        uint tax = (raw_total*3)/100;
        //user burns hlm tokens
        hlm.burn(user, _amount);
        //pay out the floor value to the user
        usdcToken.transferFrom(AMMAddress, user, raw_total - tax);
        //updates fsl
        fsl -= (raw_total - tax);
        //record realisation event
        emit Redeemed(user, amount);
    }
}