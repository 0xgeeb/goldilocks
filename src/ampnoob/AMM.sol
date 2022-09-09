//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./token.sol";

//Contract for buying and selling HLM,
contract AMM is HLMToken{

    //usdc token
    IERC20 usdcToken = IERC20(0x6A9865aDE2B6207dAAC49f8bCba9705dEB0B0e6D);
    
    //variable that will designate target instance of HLMToken
    HLMToken hlm;

    //initialises the HLMtoken
    constructor(){
        //identifies the desired instance of the HLM contract for testing -- not sure if this is the right way to do this
        hlm = HLMToken(0x6DD708FCD926977FF3Da4c8a56d2F192A36faEE4);
    }

    //need to double check how to deal with the ratio maths here. target ratio describes the psl+fsl/fsl ratio at which the floor will raise, initalised at 3/2.
    uint public target_ratio = ((10**18)*3)/2;
    //floor supporting liquidity, initialised at 92.783% of the AMM balance (90% of the presale contribution)
    uint public fsl = (AMMBalance()*92783)/100000;
    //price supporting liquidity
    uint public psl = AMMBalance() - fsl;
    
     //event tracking user purchases
    event Purchase(address indexed user, uint indexed amountPaid, uint indexed amountRecieved);
    //event tracking user sales
    event Sale(address indexed user, uint indexed amountSold, uint indexed priceRecieved);

    //get AMM USDC balance -- assuming that we've transferred the presale contributions to the AMM already, need to think about the order of things a bit more
    function AMMBalance() public view returns(uint) {
        return usdcToken.balanceOf(address(this));
    }

    //define floor price
    function floorPrice(uint _fsl, uint _supply) public pure returns(uint) {
        uint floor_price = _fsl/_supply;
        return floor_price;
    }

    //define market price
    function marketPrice(uint _fsl, uint _psl, uint _supply) public pure returns(uint) {
        uint _marketPrice = ((_fsl+_psl)/_supply)*((_fsl+_psl)/_fsl);
        return _marketPrice;
    }

    //checks floor raise conditions and executes floor raise if conditions met
    function floor_raise() public {
        //gets current ratio of psl+fsl to fsl
        uint current_ratio = psl+fsl/fsl;
        //checks whether the ratio is at least as great as the target ratio
        if(current_ratio >= target_ratio){
            //calculates amount to add to fsl (10% of psl)
            uint raise_amount = psl/10;
            //takes it away from psl
            psl -= raise_amount;
            //adds it to fsl
            fsl += raise_amount;
            //increases target ratio by 10%
            uint ratio_increase = target_ratio/10;
            target_ratio += ratio_increase;
        }
    }

    //purchase function
    function purchase(uint amount) public {
        //taking decimals into account
        uint _amount = amount*(10**18);
        //making sure we point to the sender of the transaction rather than the contract
        address user = msg.sender;
        //Making local duplicates of these variables to avoid unecessary state variable alterations
        uint _fsl = fsl;
        uint _psl = psl;
        uint _supply = hlm.totalSupply();
        uint _floor_price = floorPrice(_fsl, _supply);
        //index to loop through the token buys -- can't do all the buys at once because price curve isn't commutative (buying x then selling x doesn't get you back to the same price)
        uint _index = 0;
        //Needs to calculate the price of each token individually and then pay the cumulative price in one transaction
        uint cumulative_price = 0;
        //cumulative floor and premium prices to work out how much to send to fsl and psl when they finally pay
        uint cumulative_floor_price = 0;
        uint cumulative_premium = 0;
        // Need to think about the whole token decimals thing here 
        uint _increment = 10**18;
        while(_index <= _amount) {
            //gets price of current token
            uint current_price = marketPrice(_fsl, _psl, _supply);
            //adds that price to the total price of the purchase
            cumulative_price += current_price;
            //adds current floor price to total amount contributed to the floor
            cumulative_floor_price += _floor_price;
            //adds current premium price to cumulative premium paid
            cumulative_premium += current_price - _floor_price;
            //increases supply 
            _supply+= _increment;
            //updates fsl by adding floor price for the purchased token
            _fsl += _floor_price;
            //updates psl by adding the reamainder of the the current token price
            _psl += current_price - _floor_price;
            //updates floor_price with new fsl and supply values
            _floor_price = _fsl/_supply;
            //increments index
            _index += _increment;    
        }
        //checks they have enough usdc for the purchase (they have to already pay gas to get to this stage -- seems like a problem)
        require(usdcToken.balanceOf(user) >= cumulative_price, "Insufficient USDC balance");
        // takes payment from user
        usdcToken.transferFrom(user, address(this), cumulative_price);
        //mints tokens for user (AMM needs a minter role)
        mint(user, _amount);
        //update fsl value
        fsl += cumulative_floor_price;
        //update psl value
        psl += cumulative_premium;
        //check for floor raise
        floor_raise();
        //emit event recording purchase
        emit Purchase(msg.sender, cumulative_price, amount);
    }

    //Sale function
    function sale(uint amount) public {
        //taking decimals into account
        uint _amount = amount*(10**18);
        //making sure we point to the sender of the transaction rather than the contract
        address user = msg.sender;
        //Checks they have enough unlocked tokens to sell
        require(hlm.balanceOf(user) >= amount, "Insufficient HLM balance");
        //Making local duplicates of these variables to avoid unecessary state variable alterations
        uint _fsl = fsl;
        uint _psl = psl;
        uint _supply = hlm.totalSupply();
        uint _floor_price = floorPrice(_fsl, _supply);
        //index to loop through the token sells -- can't do all the buys at once because price curve isn't commutative (selling x then buying x doesn't get you back to the same price)
        uint _index = 0;
        //Needs to calculate the price of each token individually and then pay the cumulative price
        uint cumulative_price = 0;
        //cumulative floor and premium prices to work out how much to send to fsl and psl when they finally pay
        uint cumulative_floor_price = 0;
        uint cumulative_premium = 0;
        // Need to think about the whole token decimals thing here
        uint _increment = 10**18;
        while(_index <= _amount) {
            //gets price of current token
            uint current_price = marketPrice(_fsl, _psl, _supply);
            //adds that price to the total price of the purchase
            cumulative_price += current_price;
            //adds current floor price to total amount contributed to the floor
            cumulative_floor_price += _floor_price;
            //adds current premium price to cumulative premium paid
            cumulative_premium += current_price - _floor_price;
            //increases supply 
            _supply-= _increment;
            //updates fsl by adding floor price for the purchased token
            _fsl -= _floor_price;
            //updates psl by adding the reamainder of the the current token price
            _psl -= current_price - _floor_price;
            //updates floor_price with new fsl and supply values
            _floor_price = _fsl/_supply;
            //increments index
            _index += _increment;    
        }
        //work out sale tax
        uint tax = cumulative_price/20;
        //approves sale
        usdcToken.approve(user, cumulative_price - tax);
        // pays user
        usdcToken.transferFrom(address(this), user, cumulative_price - tax);
        // burns the user's tokens -- AMM needs burner role
        burn(user, amount);
        //update fsl value
        uint floor_loss = cumulative_floor_price+tax;
        fsl -= floor_loss;
        //update psl value
        psl -= cumulative_premium;
        //check for floor raise
        floor_raise();
        //emit event recording purchase
        emit Sale(msg.sender, cumulative_price - tax, amount);
    }
}