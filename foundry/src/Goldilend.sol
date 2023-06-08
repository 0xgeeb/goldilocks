//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.4.0/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-contracts/utils/math/Math.sol";
import "GBERA.sol";

contract Goldilend {

  struct Loan {
    ERC721[] collateralTokens;
    uint256 borrowedAmount;
    uint256 interest;
    uint256 startDate;
    address userAddress;
    uint256 duration;
    uint256 loanId;
  }

  struct Auction {
    uint256 startDate;
    uint256 endDate;
    ERC721[] tokens;
    uint256 startPrice;
    uint256 auctionId;
    uint256 highestBid;
    address highestBidder;
    address interest;
    bool claimed;
  }

  struct StakedPosition {
    uint256 startDate;
    uint256 lastClaim;
    uint256 stakedBalance;
    address stakeAddress;
    uint256 interestVote;
    uint256 valueVote;
    uint256 lastVote;
  }
    
  IERC20 bera;
  mapping (bytes32 => uint) public fairValue;
  mapping(uint256 => Loan) public loanLookup;
  mapping(uint256 => Auction) public auctionLookup;
  mapping(address => stakedPosition) public stakeLookup;
  mapping(uint256 => bool) public liquidated;
  mapping(uint256 => bool) public auctioned;
  mapping(address => bool) public staked;
  bytes32[] public collectionIDs;
  Loan[] public loans;
  address[] public stakers;
  uint256 totalValuation;
  uint256 valuationMultiple = 5;
  uint256 poolSize;
  uint256 gberaRatio;
  uint256 totalStaked;
  uint256 loanIdTracker = 0;
  uint256 debt = 0;
  uint256 interestRate = 10;
  uint256 porridgeMultiple;
  uint256 emissionsStart;
  // uint256 sixMonths = 180*days;
  address treasuryAddress;
  
  constructor(uint256 _startingSize, address _beraAddress, address _gberaAddress, bytes32[] _collectionIDs) {
    bera = IERC20(_beraAddress);
    gbera = IERC20(_gberaAddress);
    poolSize = _startingSize;
    collectionIDs = _collectionIDs;
    emissionsStart = block.timestamp;
  }

  function isBear(ERC721 token, bytes32 collectionId) public view returns (bool) {
    bytes32 tokenMetadata = token.getTokenMetadata(token.tokenOfOwnerByIndex(msg.sender, 0));
    bytes32 tokenCollectionId = parseTokenMetadata(tokenMetadata);
    return tokenCollectionId == collectionId;
  }

  function parseTokenMetadata(bytes32 tokenMetadata) internal pure returns (bytes32) {
    return tokenMetadata[0:32];
  }

    //function for locking BERA and minting GBERA
    function lock(uint256 _lockAmount) public{
        //checks they have anough BERA to lock and that they are locking more than 0 tokens
        require(_lockAmount > 0, "can't lock zero tokens");
        require (bera.balanceOf(msg.sender) >= _lockAmount, "insufficient balance");
        //Code for transferring and staking the deposited bera in the consensus vaults (on behalf of the contract) and adding existing consensus vault rewards to lending pool
        //mint them GBERA tokens according to current ratio -- depositing x% of current poolsize gives minter x% of gbera supply
        gbera.mint(msg.sender, gberaRatio*_lockAmount/10**18);
        //update poolsize
        poolSize += _lockAmount;       
    }

    //function for staking GBERA
    function stake(uint256 _stakeAmount) public{
        //checks they have anough GBERA to stake and that they are staking more than 0 tokens
        require(_stakeAmount > 0, "can't stake zero tokens");
        require (gbera.balanceOf(msg.sender) >= _stakeAmount, "insufficient balance");
        //checks whether the user has already staked, then creates a staked position if they haven't
        if(staked[msg.sender] == false){
          //creates staked position
          StakedPosition memory _stake = StakedPosition({
          startDate: block.timestamp,
          lastClaim: block.timestamp,
          stakedBalance: _stakeAmount,
          stakeAddress: msg.sender,
          interestVote: interestRate,
          valueVote: totalValuation;
          lastVote = block.timestamp;
    });
        //records that they've staked, adds their address to list of stakers and stores position in staking lookup
        staked[msg.sender] = true;
        stakers.push(msg.sender);
        stakeLookup[msg.sender] = _stake;
        }
        //if they've already staked, then update balance in staking lookup and claim existing rewards
        else{
          stakeLookup[msg.sender].stakedBalance += _stakeAmount;
          claim();
        }
        //update total staked
        totalStaked += _stakeAmount;
    }

    //function for unstaking GBERA
    function unstake(uint256 _unstakeAmount) public{
        //local copy of staking balance 
        uint256 _balance = stakeLookup[msg.sender].stakedBalance;
        //checks they have anough GBERA to unstake and that they are unstaking more than 0 tokens
        require(_unstakeAmount > 0, "can't unstake zero tokens");
        require (_balance >= _stakeAmount, "insufficient staked balance");
        //if position is fully unstaked, remove address from stakers list and update staked tracker
        if(_balance - _unstakeAmount == 0){
          staked[msg.sender] = false;
          stakers.pop(msg.sender);
        }
        //update staking balance
        stakeLookup[msg.sender].stakedBalance -= _stakeAmount;
        //update total staked
        totalStaked -= _unstakeAmount;
        //claim existing rewards
        claim();
    }

    //function for claiming GBERA staking rewards
    function claim() public{
        //check they are staked
        require(staked[msg.sender] == true, "you're not staked!");
        //local variable for staked position
        StakedPosition _stake = stakeLookup[msg.sender];
        //if emissions haven't ended, calculate porridge emissions for staker
        if(block.timestamp < emissionsStart + 6 months){
          //works out time staked since last claim
          uint256 _timestaked = block.timestamp - _stake.lastClaim;
          //works out the average of the time since emissions start of their staking period
          uint256 _average = ((block.timestamp - emissionsStart) + (_stake.lastClaim - emissionsStart))/2;
          //works out the average emission rate over their staking period -- emissions function is N - Nt/180, where N is number of porridge earned per bera per second (as a fraction of 100) -- note that we're calculating N - Nt/180 where t is the midpoint of the time staked
          uint256 _rate = porridgeMultiple - (porridgeMultiple*_average/2*sixMonths);
          //works out amount of porridge earned
          uint256 _porridgeEarned = (_timestaked * _rate * _stake.stakedBalance)/100;
          //pay the staker their emissions
          porridge.mint(msg.sender, _porridgeEarned);
        }
        //update the last claimed field
        stakeLookup[msg.sender].lastClaim = block.timestamp;
    }

    //main borrow function -- users can borrow against multiple NFT's at once -- requires that user inputs the collection ID's of the bears they're borrowing against
    //duration variable will just be an integer in [1, 365]
   function borrow(uint256 _borrowAmount, ERC721[] _collateral, uint256 _duration, bytes32[] _collectionIDs) public {
      //checks that the user is borrowing a non-zero amount and number of days is appropriate
      require(_borrowAmount >= 0, "can't borrow zero");
      require(_duration >= 1 && _duration <= 365, "invalid loan duration");
      //check that the loan doesn't take up more than 10% of the total lending pool
      require(_borrowAmount <= poolSize/10);
      //parses the duration
      uint256 preciseDuration = _duration * 1 days;
      //calculates the amount of capital that's available to borrow
      uint256 _availableCapital = poolSize - debt;
      //total amount borrowed including new loan
      uint256 _borrowed = debt + _borrowamount;
      //tracks total fair value of the collateral
      uint256 _fairValue = 0;
      for(uint256 i=0; i < _collateral.length; i++){
        //checks that the user owns the relevant collateral (and that it belongs to the collection specified by the user)
        require(isBear(_collateral[i], _collectionIds[i]) == true && ownerOf(_collateral[i]) == msg.sender, "insufficiently dank collateral");
        //calculates total fair value of collateral by adding fair values of each nft in the _collateral array
        _fairValue += (fairValue[_collectionIDs[i]]*totalValuation)/10000;
        }
      //checks that they aren't borrowing more than the fair value of their collateral or the total amount of available capital
      require(_borrowAmount <= _fairValue && _borrowamount <= _availableCapital, "borrow limit exceeded");
      //transfers the collateral to the contract
      for(uint256 i=0; i < _collateral.length; i++){
        collateral[i].transfer(msg.sender, address(this));
        } 
      //calculates utilisation ratio + 1/2
      uint256 _ratio = ((2*10**18*_borrowed)/poolsize + 1)/2;
      //calculates the interest rate of the loan -- apr = flat rate R plus 10RDX/365 (where D is loan duration in days and X is ratio calculated above)
      uint256 _interestRate = (interestRate*10**18) + (10*interestRate*_duration*ratio/365);
      //calculates the total interest due at repayment
      uint256 _interest = (_interestRate*borrowedAmount*_duration)/(365*10**20);
      //increments the idTracker to assign a new loand id
      loanIdTracker += 1;
      //update debt
      debt = _borrowed;
      //creates a Loan struct representing the loan and adds it to the loans mapping 
      Loan memory _loan = Loan({
      collateralTokens: _collateral,
      borrowedAmount: _borrowAmount + _interest,
      interest: _interest,
      startDate: block.timestamp,
      userAddress: msg.sender,
      duration: preciseDuration,
      loanId: loanIdTracker
    });
      //update mappings and arrays
      loans.push(_loan);
      auctioned[_loan.loanId] = false;
      liquidated[_loan.loanId] = false;
      resolved[_loan.loanId] = false;
      //insert code to unstake bera from the consensus vaults so it can be sent to borrower. Also need code to add consensus vault rewards to pending rewards for gbera stakers
      //transfers the desired loan amount to the user
      bera.transferFrom(address(this), msg.sender, _borrowAmount);
      }
    }

    //main repay function
   function repay(uint256 _repayAmount, uint256 _loanId) public {
        Loan _loan = loans[_loanId];
        //checks loan hasn't already expired
        require(block.timestamp <= _loan.startDate + _loan.duration);
        //checks that the user is repaying a non-zero amount
        require(_repayAmount >= 0, "can't repay zero");
        //checks that the user is not repaying too much
        require(_loan.borrowedAmount >= _repayAmount, "repaying too much");
        //transfers the desired repay amount to the contract
        bera.transferFrom(msg.sender, address(this), _repayAmount);
        //insert code to stake repaid bera in the consensus vaults and add existing consensus vault rewards to pending rewards for gbera stakers
        //calculate what fraction of loan is interest
        uint256 _ratio = loan.interest*10**18/loan.borrowedAmount;
        uint256 _interest = (_repayAmount*_ratio)/10**18
        //updates debt variable
        debt -= (_repayAmount - _interest);
        //updates their loan (interest and total)
        loan.borrowedAmount -= _repayAmount;
        loan.interest -= _interest;
        //increases valuation
        totalValuation += (_interest*valuationMultiple)/10;
        //returns the user's collateral and increasses valuation multiple if they have fully repaid the loan
        if(loan.borrowedAmount == 0){
            for(uint256 i=0; i < loan.collateral.length; i++){
              loan.collateral[i].transfer(address(this), msg.sender);
              }
            if (valuationMultiple <= 25){
              valuationMultiple += 1;
            }  
        }
        //add 95% of the repaid interest to the lending pool
        poolsize += _interest*95/100; 
        //send 5% of the repaid interest to the treasury
        bera.transferFrom(address(this), treasuryAddress, _interest*5/100);
        //update the gbera ratio
        gberaRatio =  gbera.supply()/poolSize;
    }

    //function to liquidate overdue loans and burn GBERA to purchase collateral
    function resolve(uint256 _loanId) public {
        Loan _loan = loans[_loanId];
        //check that the borrower has deaulted
        require(block.timestamp > _loan.startDate + _loan.duration && _loan.borrowedAmount > 0, "borrower has not defaulted");
        //check that the resolver has enough gbera to claim the collateral
        uint256 _normalisedCost = gberaRatio*_loan.borrowedAmount)/10**18;
        require(gbera.balanceOf(msg.sender) >= _normalisedCost);
        //burn the gbera paid for collateral
        gbera.burn(msg.sender,_normalisedCost);
        //update poolsize
        poolsize -= _loan.borrowedAmount - _loan.interest;
        //liquidate
        liquidated[_loanId] = true;
        //resolve
        resolved[_loanId] = true;
        //update gbera rato
        gberaRatio = gbera.supply()/poolsize;
        //update amount of loan remaining and debt variable
        debt -= (_loan.borrowedAmount - _loan.interest);
        _loan.borrowedAmount = 0;
        //transfer collateral to resolver
        for(uint256 i=0; i < _loan.collateralTokens.length; i++){
              _loan.collateralTokens[i].transfer(address(this), msg.sender);
              }
    }

    //function to liquidate overdue loans that haven't already been resolved and initiate auction
    function liquidator() public {
        //go through active loans, liquidate all those that are more than a day past due and haven't been resolved already and send them to auction
        for (uint256 i=0; i < loans.length; i++) {
        _loan = loans[i];
        //check they are expired
        if (block.timestamp > _loan.startDate + _loan.duration + 1 days && _loan.borrowedAmount > 0){
            //liquidate loan
            liquidated[_loan.loanId] = true;
            //initiate auction
            auction(_loan.loanId);
        }
        }
    }

        //function to auction off collateral from liquidated loans (buyers pay gbera)
    function auction(uint256 _loanId) public {
        //checks input loan has been liquidated and hasn't been resolved or auctioned
        require(liquidated[_loanId] == true && resolved[_loanId] == false && auctioned[_loanId] == false, "this loan hasn't been liquidated or has already been resolved or auctioned");
        //update auctioned mapping 
        auctioned[_loanId] = true;
        //local variable designating loan
        Loan _loan = loans[_loanId];
        //creates an auction struct representing the auction and saves it to memory
        Auction memory _auction = Auction({
        startDate: block.timestamp,
        endDate: startDate + 3 days,
        tokens: _loan.collateralTokens, 
        startPrice: ((_loan.borrowedAmount - _loan.interest)*gberaRatio)/10**18, 
        auctionId: _loanId,
        highestBid: 0,
        highestBidder: treasuryAddress,
        claimed: false
        });
    }

    //function to bid on auctions
  function bid(uint256 _bidAmount, uint256 _auctionId) public {
        Auction _auction = auctionLookup[_auctionId];
        //check bidder is beating current winning bid and has enough balance, and that auction isn't expired
        require(_bidAmount > _auction.highestBid, "doesn't beat current highest bid");
        require(gbera.balanceOf(msg.sender) >= _bidAmount, "insufficient balance");
        require(block.timestamp < _auction.endDate, "auction already ended");
        //take the bid into custody and return the previous winning bid to corresponding bidder
        gbera.transferFrom(msg.sender, address(this), _bidAmount);
        if (_auction.highestBid > 0){
          gbera.transferFrom(address(this), _auction.highestBidder, _auction.highestBid);
        }
        //update highest bid and highest bidder
        auctions[i].highestBid = _bidAmount;
        auctions[i].highestBidder = msg.sender;
    }

  //function for auction winner to claim the NFT's
  function auctionClaim(uint256 _auctionId) public {
        //find the auction corresponding to the id
        Auction _auction = auctionLookup[_auctionId];
        //once we've found the auction, check that the user is the auction winner and the auction has expired
        require(_auction.highestBidder == msg.sender, "you didn't win the auction");
        require(_auction.claimed == false, "auction already claimed");
        require(block.timestamp >= _auction.endDate, "auction not yet finished");    
        //register that auction has been claimed
        _auction.claimed = true;    
        //reduce poolsize and debt variables
        poolSize -= _auction.startPrice;
        debt -= _auction.startPrice;
        //if the auction was successful, burn the gbera contributed by the highest bidder and transfer collateral 
        if(_auction.startPrice < _auction.highestBid){
          gbera.burn(address(this), _auction.highestBid);
          //transfer the items to the winner
          for(uint256 i=0; i < _auction.tokens.length; i++){
            _auction.tokens[i].transfer(address(this), msg.sender);
          }
        }
        //if the auction was unsuccessful, send the unclaimed collateral to treasury and reduce the current valuation by 90% (stakers can simply vote to increase it again)
        else{
          for(uint256 i=0; i < _auction.tokens.length; i++){
            _auction.tokens[i].transferFrom(address(this), treasuryAddress);
        }
        totalValuation = totalValuation/10;
      }
        gberaRatio = gbera.supply()*10**18/poolSize;
  }

  //function for gberastakers to vote on interest rates and valuations
  function Vote(uint256 _rate, uint256 _value) public {
    //local variable representing voter's staked position
    stakedPosition _stake = stakeLookup[msg.sender];
    //check the voter has been staked for at least two weeks (to prevent flash loans being used to manipulate vaulations), and that they haven't voted for at least a week
    require(staked[msg.sender] == true && block.timestamp - _stake.startDate > 2 weeks && block.timestamp - _stake.lastVote > 1 weeks);
    //check they have staked bera
    require(_stake.stakedBalance > 0, "you have no voting power");
    //update their votes
    _stake.interestVote = _rate;
    _stake.valueVote = _value;
    //update the interest rate and total valuation to reflect their votes by taking an average of all votes weighted by staked balance
    uint256 _averageRate = 0;
    uint256 _averageValuation = 0;
    for(uint256 i=0; i < stakers.length; i++){
      _averageRate += stakeLookup[msg.sender].stakeVote*stakeLookup[msg.sender].stakedBalance;
      _averageValuation += stakeLookup[msg.sender].valueVote*stakeLookup[msg.sender].stakedBalance;
      }
    _averageRate = _averageRate/totalStaked;
    _averageValuation = _averageValuation/totalStaked;
    //prevent any single vote from increasing the valuation by more than 5%
    require(_averageValuation <= totalValuation*105/100); 
    //update interest rate and total valuation
    interestRate = _averageRate;
    totalValuation = _averageValuation
  }

//TODO: think about function security (all public right now), implement honeycomb/beradrome nft utility, integrate porridge token contract