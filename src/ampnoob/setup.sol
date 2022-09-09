//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

//Importing ERC20 template
import "./token.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


//Contract for constructing the price supporting liquidity and floor supporting liquidity pools, collecting initial funds through presale and minting initial supply
contract Setup is HLMToken {  

    //Track start time of presale
    uint startTime = block.timestamp;

    //usdc token
    IERC20 usdcToken = IERC20(0x6A9865aDE2B6207dAAC49f8bCba9705dEB0B0e6D);

    //variable that will designate target instance of HLMToken
    HLMToken hlm;

    //Tracks how much has been contributed to presale in total
    uint totalContribution = 0;
    //Hard cap for presale
    uint hardCap = 1000000*10**18;
    //Soft cap for presale
    uint softCap = hardCap/10;

    //Track HLM balances
    mapping(address => uint) public balances;
    //Track presale allocations -- will need a way to input the actual presale allowance list somewhere
    mapping(address => uint) public allocations;

    //initialises the HLMtoken
    constructor(){
        //identifies the desired instance of the HLM contract for testing -- not sure if this is the right way to do this
        hlm = HLMToken(0x6DD708FCD926977FF3Da4c8a56d2F192A36faEE4);
        //just for testing, allows us to test the contribution function
        allocations[msg.sender] = hardCap;
    }

    //event tracking user presale contributions
    event Contribution(address indexed user, uint indexed amountPaid, uint indexed amountRecieved);
    //event tracking RWD realisations
    event Realise(address indexed user, uint indexed amountRealised);

    //function for checking HLM supply
    function getSupply() public view returns(uint) {
        return hlm.totalSupply();
    }

    //function for checking USDC balance
    function usdcBalance(address user) public view returns(uint) {
        return usdcToken.balanceOf(user);
    }

    //function for checking HLM balance
    function HLMBalance(address user) public view returns(uint) {
        return hlm.balanceOf(user);
    }

    //function for checking USDC allowance
    function USDCAllowance(address user) public view returns(uint) {
        return usdcToken.allowance(user, address(this));
    }
    
    //function to contribute to presale
    function contribute(uint amount) public {
        //worried that msg.sender will refer to this contract when calling the mint function from the parent contracts below. try to fix this with a user address variable. 
        address user = msg.sender;
        //taking decimals into account, but allows us to parse small integers as arguments
        uint _amount = amount*(10**18);
        //prevents the user from contributing more than their allocation (updates allocation below to avoid going over through multiple contributions)
        require(_amount <= allocations[user] &&
        totalContribution + _amount <= hardCap, "insufficient presale allocation or hardcap hit");
        //Checks they have enough approved USDC
        require(usdcBalance(user) >= _amount && USDCAllowance(user) >= _amount, "insufficient funds");
        //checks that presale isn't finished
        require(block.timestamp - startTime < 24 hours, "presale has already concluded"); 
        //updates user allocation
        allocations[user] -= _amount;
        //contract takes payment from user
        usdcToken.transferFrom(user, address(this), _amount);
        // calculates amount of HLM to be recieved. Assumes that 90% of contributions go to psl, 10% go to fsl 
        uint HLMamount = (_amount*9)/10;
        //mint HLM tokens and send them to the user
        mint(user, HLMamount);
        //updates user HLM balance
        balances[user] += HLMamount;
        //updates totalContribution
        totalContribution += _amount;
        //emit event to record user contribution
        emit Contribution(user, amount, HLMamount);
    }
}