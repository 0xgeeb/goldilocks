//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./staking.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./AMM.sol";

//Contract for `realising' reward tokens, i.e. using them to buy HLM at floor price
contract Realise is Staking {

    //points to the RWD token -- call it this way to get access to the burn function
    RWDToken rwd = RWDToken(0x6DD708FCD926977FF3Da4c8a56d2F192A36faEE4);
    //points to the HLM token -- call it this way to get access to the mint function
    HLMToken HLM = HLMToken(0x6DD708FCD926977FF3Da4c8a56d2F192A36faEE4);
    //usdc token
    IERC20 usdcToken = IERC20(0x6A9865aDE2B6207dAAC49f8bCba9705dEB0B0e6D);

    //address of the AMM
    address AMMAddress = 0x17F6AD8Ef982297579C203069C1DbfFE4348c372;
    //instantiate AMM contract
    AMM amm = AMM(AMMAddress);

    //event tracking reward realisations
    event Realised(address indexed user, uint indexed amountRealised);

    //gets balance of RWD token
    function rewardBalance() public view returns(uint) {
        uint balance = rwd.balanceOf(msg.sender);
        return balance;
    }

    //main function for realising RWD tokens
    function realise(uint amount) public {
         //taking decimals into account
        uint _amount = amount*(10**18);
        //making sure we point to the sender of the transaction rather than the contract
        address user = msg.sender;
        //check that reward balance is sufficient
        require(rwd.balanceOf(user) >= _amount, "Insufficient Balance");
        //check that amount realised is non-zero
        require(_amount > 0, "Can't stake zero");
        //gets floor price
        uint _floor_price = amm.fsl()/hlm.totalSupply();
        //user burns reward tokens
        RWDBurn(user, _amount);
        //user pays floor price for the hlm tokens
        usdcToken.transferFrom(user, AMMAddress, _amount*_floor_price);
        //pay out the hlm tokens to the user
        HLM.mint(user, _amount);
        //record realisation event
        emit Realised(user, amount);
    }
}