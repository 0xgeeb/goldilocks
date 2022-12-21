
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { ERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-contracts/utils/math/Math.sol";

contract lendingPool {

  
  struct Loan {
    ERC721[] collateralTokens;
    uint256 borrowedAmount;
    uint256 interest;
    uint256 startDate;
    address userAddress;
    uint256 duration;
    uint256 loanId;
  }

  //struct that represents Bera locks
  struct Lock {
  // (i) the amount locked
  uint256 lockAmount;
  // (ii) the start date of the lock
  uint256 startDate;
  // (iii) the user's address
  address userAddress;
  // (iv) the duration of the lock
  uint256 duration;
  // (iv) Lock id
  uint256 lockId;
}

  //struct that represents auctions of liquidated collateral
  struct Auction {
  // (i) the start date of the auction
  uint256 startDate;
  // (ii) the start date of the auction
  uint256 endDate;
  // (iii) the ERC721 tokens that are being sold at the auction
  ERC721[] tokens;
  // (iv) starting price of the tokens (equal to the remaining balance of the liquidated loan)
  uint256 startPrice;
  //(v) id of the auction
  uint256 auctionId;
  //(vi) highest bid
  uint256 highestBid;
  //(vii) highest bidder
  address highestBidder;
  //(viii) interest due on the liquidated loan that generated the auction
  address interest;
}
  
  //bera token
  IERC20 bera;
  //tracks the protocol's assigned fair values of the Bear NFT's, stored as fractions of the core pool size
  mapping (bytes32 => uint) public fairValue;
  //tracks the amount of rewards claimable by lockers
  mapping (address => uint) public claimable;
  //tracks liquidated loans
  mapping (uint => bool) public liquidated;
  //List of collection ID's
  bytes32[] collectionIDs;
  //tracks active loans 
  Loan[] public loans;
  //tracks inactive (repaid or liquidated) loans 
  Loan[] public inactiveLoans;
  //tracks active Bera locks
  Lock[] public locks;
  //tracks expired Bera locks
  Lock[] public expiredLocks;
  //tracks active auctions
  Auction[] public auctions;
  //tracks expired auctions
  Auction[] public expiredAuctions;
  //size of the protocol owned core lending pool
  uint256 corepoolSize;
  //the multiple of corepoolsize that represents that protocol's implicit valuation of the bear NFT's
  uint256 corepoolMultiple;
  //counter for assigning loan id's
  uint256 loanIdTracker = 0;
  //counter for assigning lock id's
  uint256 lockIdTracker = 0;
  //counter for assigning auction id's
  uint256 auctionIdTracker = 0;
  //tracks the amount of rewards due to be paid to lockers and the protocol
  uint256 pendingRewards = 0;
  //tracks bad unpaid debt accumulatd by the protocol
  uint256 badDebt = 0;
  //address of Goldilocks treasury
  address treasuryAddress;

  constructor(uint256 _startingSize, address _beraAddress, bytes32[] _collectionIDs) {
    bera = IERC20(_beraAddress);
    corepoolSize = _startingSize;
    collectionIDs = _collectionIDs;
  }

  //function for checking that an address belongs to a Bear NFT
  function isBear(ERC721 token, bytes32 collectionId) public view returns (bool) {
    // Get the metadata for the given token
    bytes32 tokenMetadata = token.getTokenMetadata(token.tokenOfOwnerByIndex(msg.sender, 0));
    // Parse the metadata to extract the collection ID
    bytes32 tokenCollectionId = parseTokenMetadata(tokenMetadata);
    // Check if the collection ID matches the given collection ID
    return tokenCollectionId == collectionId;
  }

  //function for parsing metadata to get the collection ids
  function parseTokenMetadata(bytes32 tokenMetadata) internal pure returns (bytes32) {
    // This function assumes that the token metadata is encoded as follows:
    // bytes 0-31: the collection ID
    // bytes 32-: other metadata (e.g. name, description, image URI, etc.)
    // Extract the collection ID from the first 32 bytes of the metadata
    return tokenMetadata[0:32];
  }

  // A function to remove a specific loan from the array
  function removeLoan(uint loanId) public {
    // Find the index of the loan to remove
    uint index;
    for (uint i = 0; i < loans.length; i++) {
      if (loans[i].loanId == loanId) {
        index = i;
        break;
      }
    }
    // Remove the loan from the array
    loans.splice(index, 1);
  }

  //function for locking BERA
  function lockFunction(uint256 _lockAmount, uint256 _duration) public{
    //checks they have anough BERA to lock and that they are locking more than 0 tokens to an appropriate duration
    require(_lockAmount > 0, "can't lock zero tokens");
    require(_duration >= 14 * 1 days && _duration <= 365 * 1 days, "duration must be between 2 weeks and 1 year");
    require (bera.balanceOf(msg.sender) >= _lockAmount);
    lockIdTracker += 1;
    //creates a lock struct representing the loan and adds it to the locks mapping 
    Lock memory _lock = Lock({
    lockAmount: _lockAmount,
    startDate: block.timestamp,
    userAddress: msg.sender,
    duration: _duration,
    lockId: lockIdTracker
    });
  }

  //main borrow function -- users can borrow against multiple NFT's at once -- requires that user inputs the collection ID's of the bears they're borrowing against
  //duration variable will just be an integer in [1, 365]
   function borrow(uint256 _borrowAmount, ERC721[] _collateral, uint256 _duration, bytes32[] _collectionIDs) public {
      //checks that the user is borrowing a non-zero amount and number of days is appropriate
      require(_borrowAmount >= 0, "can't borrow zero");
      require(_duration >= 1 && _duration <= 365, "invalid loan duration");
      //parses the duration
      uint256 preciseDuration = _duration * 1 days;
      //calculates the amount of capital that's available to borrow for the specified duration, and the total amount that's currently being borrowed, including size of current loan (used in calculating interest rate)
      uint256 _availableCapital = corepoolSize;
      uint256 _borrowed = _borrowAmount;
      for (uint256 i=0; i < locks.length; i++) {
        if (locks[i].startDate + locks[i].duration >= block.timestamp + preciseDuration){
          _availableCapital += locks[i].lockAmount;
        }
      }
      for (uint256 i=0; i < loans.length; i++) {
        uint256 increment = loans[i].borrowedAmount; 
        _availableCapital -= increment;
        _borrowed += increment;
      }
      //tracks total fair value of the collateral
      uint256 _fairValue = 0;
      for(uint256 i=0; i < _collateral.length; i++){
        //checks that the user owns the relevant collateral (and that it belongs to the collection specified by the user)
        require(isBear(_collateral[i], _collectionIds[i]) == true && ownerOf(_collateral[i]) == msg.sender, "insufficiently dank collateral");
        //calculates total fair value of collateral by adding fair values of each nft in the _collateral array
        _fairValue += (fairValue[_collectionIDs[i]]*corepoolSize*corepoolMultiple)/100;
        }
      //checks that they aren't borrowing more than the fair value of their collateral or the total amount of available capital
      require(_borrowAmount <= _fairValue && _borrowAmount <= _availableCapital, "borrow limit exceeded");
      //transfers the collateral to the contract
      for(uint256 i=0; i < _collateral.length; i++){
        collateral[i].transfer(msg.sender, address(this)); 
      //calculates ratio of total amount borrowed to core pool size, capped at 2
      uint256 _ratio = Math.max((_borrowed*10**18)/corepoolSize, 2*10**18);
      //calculates the interest rate of the loan -- apr = flat 14% rate plus 25DX/365 (where D is loan duration in days and X is ratio calculated above)
      uint256 _interestRate = (14*10**18) + (25*_duration*ratio/365);
      //calculates the total interest due at repayment
      uint256 _interest = (_interestRate*borrowedAmount*_duration)/(365*10**20);
      //increments the idTracker to assign a new loand id
      idTracker += 1;
      //creates a Loan struct representing the loan and adds it to the loans mapping 
      Loan memory _loan = Loan({
      collateralTokens: _collateral,
      borrowedAmount: _borrowAmount + _interest,
      interest: _interest,
      startDate: block.timestamp,
      userAddress: msg.sender,
      duration: preciseDuration,
      loanId: idTracker
    });
      loans.push(_loan);
      //transfers the desired loan amount to the user
      bera.transferFrom(address(this), msg.sender, _borrowAmount);
      }
    }

  //main repay function
   function repay(uint256 _repayAmount, uint256 _loanId) public {
     //locate loan
      for (uint256 i=0; i < loans.length; i++) {
        Loan loan = loans[i];
        if (loan.loanId == _loanId){
          //checks loan hasn't already been liquidated
          require(block.timestamp <= loan.startDate + loan.duration);
          //checks that the user is repaying a non-zero amount
          require(_repayAmount >= 0, "can't repay zero");
          //checks that the user is not repaying too much
          require(loan.borrowedAmount >= _repayAmount, "repaying too much");
          //transfers the desired repay amount to the contract
          bera.transferFrom(msg.sender, address(this), _repayAmount);
          //calculates fraction of remaining loan being repaid
          uint256 _fraction = (_repayAmount*10**18)/loan.borrowedAmount;
          //updates the pending rewards
          pendingRewards += (loan.interest*_fraction)/10**18;
          //updates their loan with new balance
          loan.borrowedAmount -= _repayAmount;
          //returns the user's collateral and moves the loan to inactive loans array if they have fully repaid the loan
          if(loan.borrowedAmount == 0){
            for(uint256 i=0; i < _collateral.length; i++){
              collateral[i].transfer(address(this), msg.sender);
              }
            removeLoan(_loanId);
            inactiveloans.push(_loan);
        }
        }
        break;
      }
      distribute(treasuryAddress);
    }

    //function that ensures loan is fully repaid
   function fullRepay(uint256 _loanId) public {
     //locate loan
      for (uint256 i=0; i < loans.length; i++) {
        Loan loan = loans[i];
        if (loan.loanId == _loanId){
          repay(loan.borrowedAmount, _loanId);
        }
        break;
      } 
    }

  //function to distribute rewards, gets called at the end of repay
  function distribute(address _treasuryAddress) public {
    uint256 _pendingRewards = pendingRewards;
    //7.5% of pending rewards go to treasury
    bera.transferFrom(address(this), _treasuryAddress, (_pendingRewards*75)/1000);
    //7.5% of pending rewards go to increasing size of core lending pool
    uint256 _coreshare = (_pendingRewards*75)/1000;
    corepoolSize += coreshare;
    //remaining rewards
    uint256 _remainingRewards = (_pendingRewards*85)/100;
    //calculate what share of remaining rewards each locker is entiteld to
    //track the total amount locked multiplied by remaining duration of lock -- initialises with size of core pool and maximum multiple
    uint256 _totalWeight = corepoolSize*3;
    //mapping for tracking reward shares of lockers
    mapping (address => uint) rewardShares;
    //index tracks place in locks array
    uint256 index = 0;
    //tracks addresses to receive rewards
    address[] rewardees;
    for (uint256 i=0; i < locks.length; i++) {
      Lock _lock = locks[i];
      //goes through active locks and calculates what share of th pending rewards they are entitled to
      if (_lock.startDate + _lock.duration <= block.timestamp){
        //calculates the lock length rewards multiplier (2*D/365 + 1, where D is remaining duration of lock (in days))
        uint256 _multiplier = (((2*10**18)/365*1 days)*(_lock.startDate + _lock.duration - block.timestamp)/10**18) + 1;
        //calculates locker's share of rewards
        uint256 _rewardShare = _multiplier*_lock.lockAmount;
        //tracks the total reward share, so we can calculate ratios
        _totalWeight += _rewardShare;
        rewardShares[_lock.userAddress] += _rewardShare;
        rewardees.push(_lock.userAddress);
      }
      for(uint256 i=0; i<= length(rewardees); i++){
        rewardShares[rewardess[i]] = _rewardShare/_totalWeight;
        claimable[rewardess[i]] += rewardShares[rewardess[i]];
      }
    //pays the core pool its share of the interest 
    corepoolSize += _pendingRewards*(corepoolSize*3/_totalWeight);
    }
  }

  //function for claiming locking rewards
  function claimRewards() public {
    //checks they have claimable rewards
    require(claimable[msg.sender] > 0, "no rewards to claim");
    //checks the contract has enough bera
    require(bera.balanceOf(address(this)) >= claimable[msg.sender], "insufficient funds in contract");
    //send them their rewards and update claimabl mapping
    bera.transferFrom(address(this), msg.sender, claimable[msg.sender]);
    claimable[msg.sender] = 0;
  }

  //function to liquidate overdue loans
  function liquidator() public {
    //go through active loans and liquidate all those that are more than a day past due
    for (uint256 i=0; i < loans.length; i++) {
      _loan = loans[i];
      if (block.timestamp > _loan.startDate + _loan.duration + 1 days && _loan.borrowedAmount > 0){
        liquidated[_loan.loanId] = true;
        auction(_loan.loanId, _loan.borrowedAmount, _loan.collateralTokens);
      }
    }
  }

  //function to auction off collateral from liquidated loans
  function auction(uint256 _loanId, uint256 _borrowedAmount, ERC721[] _collateral) public {
    //checks input loan has been liquidated
    require(liquidated[_loanId] == true, "this loan hasn't been liquidated");
    //creates an auction struct representing the auction and saves it to memory
    Auction memory _auction = Auction({
    startDate: block.timestamp,
    endDate: startDate + 3 days,
    tokens: loans[i].collateralTokens, 
    startPrice: loans[i].borrowedAmount, 
    auctionId: _loanId,
    highestBid: 0,
    highestBidder: treasuryAddress
      });
  }

  //function to bid on auctions
  function bid(uint256 _bidAmount, uint256 _auctionId) public {
    //find the auction corresponding to the id
    for (uint256 i=0; i < auctions.length; i++) {
      if (auctions[i].auctionId == _auctionId){
        //once we've found the loan, check bidder is beating current winning bid and has enough balance
        Auction _auction = auctions[i];
        require(_bidAmount > _auction.highestBid, "doesn't beat current highest bid");
        require(bera.balanceOf(msg.sender) >= _bidAmount, "insufficient balance");
        //take the bid into custody and return the previous winning bid to corresponding bidder
        bera.transferFrom(msg.sender, address(this), _bidAmount);
        bera.transferFrom(address(this), _auction.highestBidder, _auction.highestBid);
        //update highest bid and highest bidder
        auctions[i].highestBid = _bidAmount;
        auctions[i].highestBidder = msg.sender;
      }
    }
  }

  //function for auction winner to claim the NFT's
  function auctionClaim(uint256 _auctionId) public {
    //find the auction corresponding to the id
    for (uint256 i=0; i < auctions.length; i++) {
      if (auctions[i].auctionId == _auctionId){
        //once we've found the loan, check that the user is the auction winner and the auction has expired
        Auction _auction = auctions[i];
        require(_auction.highestBidder == msg.sender, "you didn't win the auction");
        require(block.timestamp >= _auction.endDate, "auction not yet finished");
        //if the auction was unsuccessful, update bad debt variable 
        if(_auction.startPrice == _auction.highestBid && _auction.highestBidder == treasuryAddress){
          badDebt += _auction.startPrice;
        }
        //move the auction from the active auctions list to the expired auctions list
        auctions.splice(i, 1);
        expiredAuctions.push(_auction);
        //transfer the items to the winner
        for(uint256 i=0; i < _auction.tokens.length; i++){
              _auction.tokens[i].transfer(address(this), msg.sender);
              }
        //push the interest from the loan to pending rewards
        pendingRewards += _auction.interest;
      }
    }
  }

  //function for claiming expired locks
  function lockClaim(uint256 _lockid) public {
    for (uint256 i=0; i < auctions.length; i++) {
      if (locks[i].lockId == _lockid){
        //once we've found the lock, check that it's expired and there's enough funds to repay the locker
        Lock _lock = locks[i];
        require(_lock.startDate + _lock.duration <= block.timestamp, "lock still active");
        require(bera.balanceOf(address(this)) - corepoolSize >= _lock.lockAmount, "insufficient bera in contract");
        bera.transferFrom(address(this), _lock.userAddress, _lock.lockAmount);
        //moves lock to expired list
        locks.splice(i, 1);
        expiredLocks.push(_lock);
      }
      break;
    }
    //claims rewards for user
    claimRewards();
  }

  //function for adding tokens to existing lock
  function lockAdd(uint256 _lockid, uint256 _addAmount) public {
    for (uint256 i=0; i < auctions.length; i++) {
      if (locks[i].lockId == _lockid){
        //once we've found the lock, check that it's not expired and user has the tokens to add
        Lock _lock = locks[i];
        require(_lock.startDate + _lock.duration >= block.timestamp, "lock expired");
        require(bera.balanceOf(msg.sender) >= _addAmount, "insufficient bera balance");
        bera.transferFrom(msg.sender, address(this), _addAmount);
        //update lock amount
        _lock.lockAmount += _addAmount;
      }
      break;
    }
    //claims rewards for user
    claimRewards();
  }

}