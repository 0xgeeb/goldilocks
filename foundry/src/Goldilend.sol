// //SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


// // |============================================================================================|
// // |    ______      _____    __      _____    __   __       _____     _____   __  __   ______   |
// // |   /_/\___\    ) ___ (  /\_\    /\ __/\  /\_\ /\_\     ) ___ (   /\ __/\ /\_\\  /\/ ____/\  |
// // |   ) ) ___/   / /\_/\ \( ( (    ) )  \ \ \/_/( ( (    / /\_/\ \  ) )__\/( ( (/ / /) ) __\/  |
// // |  /_/ /  ___ / /_/ (_\ \\ \_\  / / /\ \ \ /\_\\ \_\  / /_/ (_\ \/ / /    \ \_ / /  \ \ \    |
// // |  \ \ \_/\__\\ \ )_/ / // / /__\ \ \/ / // / // / /__\ \ )_/ / /\ \ \_   / /  \ \  _\ \ \   |
// // |   )_)  \/ _/ \ \/_\/ /( (_____() )__/ /( (_(( (_____(\ \/_\/ /  ) )__/\( (_(\ \ \)____) )  |
// // |   \_\____/    )_____(  \/_____/\/___\/  \/_/ \/_____/ )_____(   \/___\/ \/_//__\/\____\/   |
// // |                                                                                            |
// // |============================================================================================|
// // ==============================================================================================
// // ======================================== Goldilend ===========================================
// // ==============================================================================================


// import { ERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
// import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
// import { ERC721 } from "../lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";


// /// @title Goldilend
// /// @notice Berachain NFT Lending
// /// @author ampnoob
// /// @author geeb
// contract Goldilend {


//   /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
//   /*                          STRUCTS                           */
//   /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


//   struct Loan {
//     ERC721[] collateralTokens;
//     uint256 borrowedAmount;
//     uint256 interest;
//     uint256 startDate;
//     address userAddress;
//     uint256 duration;
//     uint256 loanId;
//   }

//   struct Auction {
//     uint256 startDate;
//     uint256 endDate;
//     ERC721[] tokens;
//     uint256 startPrice;
//     uint256 auctionId;
//     uint256 highestBid;
//     address highestBidder;
//     address interest;
//     bool claimed;
//   }

//   struct StakedPosition {
//     uint256 startDate;
//     uint256 lastClaim;
//     uint256 stakedBalance;
//     address stakeAddress;
//     uint256 interestVote;
//     uint256 valueVote;
//     uint256 lastVote;
//   }


//   /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
//   /*                      STATE VARIABLES                       */
//   /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/
    

//   IERC20 bera;
//   IERC20 gbera;
//   mapping (bytes32 => uint) public fairValue;
//   mapping(uint256 => Loan) public loanLookup;
//   mapping(uint256 => Auction) public auctionLookup;
//   mapping(address => StakedPosition) public stakeLookup;
//   mapping(uint256 => bool) public liquidated;
//   mapping(uint256 => bool) public auctioned;
//   mapping(address => bool) public staked;
//   bytes32[] public collectionIDs;
//   Loan[] public loans;
//   address[] public stakers;
//   uint256 totalValuation;
//   uint256 valuationMultiple = 5;
//   uint256 poolSize;
//   uint256 gberaRatio;
//   uint256 totalStaked;
//   uint256 loanIdTracker = 0;
//   uint256 debt = 0;
//   uint256 interestRate = 10;
//   uint256 porridgeMultiple;
//   uint256 emissionsStart;
//   // uint256 sixMonths = 180*days;
//   address treasuryAddress;


//   /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
//   /*                         CONSTRUCTOR                        */
//   /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/
  

//   constructor(uint256 _startingSize, address _beraAddress, address _gberaAddress, bytes32[] _collectionIDs) {
//     bera = IERC20(_beraAddress);
//     gbera = IERC20(_gberaAddress);
//     poolSize = _startingSize;
//     collectionIDs = _collectionIDs;
//     emissionsStart = block.timestamp;
//   }

//   function isBear(ERC721 token, bytes32 collectionId) public view returns (bool) {
//     bytes32 tokenMetadata = token.getTokenMetadata(token.tokenOfOwnerByIndex(msg.sender, 0));
//     bytes32 tokenCollectionId = parseTokenMetadata(tokenMetadata);
//     return tokenCollectionId == collectionId;
//   }

//   function parseTokenMetadata(bytes32 tokenMetadata) internal pure returns (bytes32) {
//     return tokenMetadata[0:32];
//   }
  
//   function lock(uint256 _lockAmount) public{
//     require(_lockAmount > 0, "can't lock zero tokens");
//     require (bera.balanceOf(msg.sender) >= _lockAmount, "insufficient balance");
//     //Code for transferring and staking the deposited bera in the consensus vaults (on behalf of the contract) and adding existing consensus vault rewards to lending pool
//     gbera.mint(msg.sender, gberaRatio*_lockAmount/10**18);
//     poolSize += _lockAmount;       
//   }

//   function stake(uint256 _stakeAmount) public{
//     require(_stakeAmount > 0, "can't stake zero tokens");
//     require (gbera.balanceOf(msg.sender) >= _stakeAmount, "insufficient balance");
//     if(staked[msg.sender] == false){
//       StakedPosition memory _stake = StakedPosition({
//         startDate: block.timestamp,
//         lastClaim: block.timestamp,
//         stakedBalance: _stakeAmount,
//         stakeAddress: msg.sender,
//         interestVote: interestRate,
//         valueVote: totalValuation,
//         lastVote: block.timestamp
//       });
//       staked[msg.sender] = true;
//       stakers.push(msg.sender);
//       stakeLookup[msg.sender] = _stake;
//     }
//     else{
//       stakeLookup[msg.sender].stakedBalance += _stakeAmount;
//       claim();
//     }
//     totalStaked += _stakeAmount;
//   }

//   function unstake(uint256 _unstakeAmount) public{
//     uint256 _balance = stakeLookup[msg.sender].stakedBalance;
//     require(_unstakeAmount > 0, "can't unstake zero tokens");
//     require (_balance >= _stakeAmount, "insufficient staked balance");
//     if(_balance - _unstakeAmount == 0){
//       staked[msg.sender] = false;
//       stakers.pop(msg.sender);
//     }
//     stakeLookup[msg.sender].stakedBalance -= _stakeAmount;
//     totalStaked -= _unstakeAmount;
//     claim();
//   }

//   function claim() public{
//     require(staked[msg.sender] == true, "you're not staked!");
//     StakedPosition _stake = stakeLookup[msg.sender];
//     // if(block.timestamp < emissionsStart + 6 months) {
//       uint256 _timestaked = block.timestamp - _stake.lastClaim;
//       uint256 _average = ((block.timestamp - emissionsStart) + (_stake.lastClaim - emissionsStart))/2;
//       uint256 _rate = porridgeMultiple - (porridgeMultiple*_average/2*sixMonths);
//       uint256 _porridgeEarned = (_timestaked * _rate * _stake.stakedBalance)/100;
//       porridge.mint(msg.sender, _porridgeEarned);
//     // }
//     stakeLookup[msg.sender].lastClaim = block.timestamp;
//   }

//   function borrow(uint256 _borrowAmount, ERC721[] _collateral, uint256 _duration, bytes32[] _collectionIDs) public {
//     require(_borrowAmount >= 0, "can't borrow zero");
//     require(_duration >= 1 && _duration <= 365, "invalid loan duration");
//     require(_borrowAmount <= poolSize/10);
//     uint256 preciseDuration = _duration * 1 days;
//     uint256 _availableCapital = poolSize - debt;
//     uint256 _borrowed = debt + _borrowamount;
//     uint256 _fairValue = 0;
//     for(uint256 i=0; i < _collateral.length; i++){
//       require(isBear(_collateral[i], _collectionIds[i]) == true && ownerOf(_collateral[i]) == msg.sender, "insufficiently dank collateral");
//       _fairValue += (fairValue[_collectionIDs[i]]*totalValuation)/10000;
//     }
//     require(_borrowAmount <= _fairValue && _borrowamount <= _availableCapital, "borrow limit exceeded");
//     for(uint256 i=0; i < _collateral.length; i++){
//       collateral[i].transfer(msg.sender, address(this));
//     } 
//     uint256 _ratio = ((2*10**18*_borrowed)/poolsize + 1)/2;
//     uint256 _interestRate = (interestRate*10**18) + (10*interestRate*_duration*ratio/365);
//     uint256 _interest = (_interestRate*borrowedAmount*_duration)/(365*10**20);
//     loanIdTracker += 1;
//     debt = _borrowed; 
//     Loan memory _loan = Loan({
//       collateralTokens: _collateral,
//       borrowedAmount: _borrowAmount + _interest,
//       interest: _interest,
//       startDate: block.timestamp,
//       userAddress: msg.sender,
//       duration: preciseDuration,
//       loanId: loanIdTracker
//     });
//     loans.push(_loan);
//     auctioned[_loan.loanId] = false;
//     liquidated[_loan.loanId] = false;
//     resolved[_loan.loanId] = false;
//     //insert code to unstake bera from the consensus vaults so it can be sent to borrower. Also need code to add consensus vault rewards to pending rewards for gbera stakers
//     bera.transferFrom(address(this), msg.sender, _borrowAmount);
//   }

//   function repay(uint256 _repayAmount, uint256 _loanId) public {
//     Loan _loan = loans[_loanId];
//     require(block.timestamp <= _loan.startDate + _loan.duration);
//     require(_repayAmount >= 0, "can't repay zero");
//     require(_loan.borrowedAmount >= _repayAmount, "repaying too much");
//     bera.transferFrom(msg.sender, address(this), _repayAmount);
//     //insert code to stake repaid bera in the consensus vaults and add existing consensus vault rewards to pending rewards for gbera stakers
//     uint256 _ratio = loan.interest*10**18/loan.borrowedAmount;
//     uint256 _interest = (_repayAmount*_ratio)/10**18;
//     debt -= (_repayAmount - _interest);
//     loan.borrowedAmount -= _repayAmount;
//     loan.interest -= _interest;
//     totalValuation += (_interest*valuationMultiple)/10;
//     if(loan.borrowedAmount == 0){
//       for(uint256 i=0; i < loan.collateral.length; i++){
//         loan.collateral[i].transfer(address(this), msg.sender);
//       }
//       if (valuationMultiple <= 25){
//         valuationMultiple += 1;
//       }  
//     }
//     poolsize += _interest*95/100; 
//     bera.transferFrom(address(this), treasuryAddress, _interest*5/100);
//     gberaRatio =  gbera.supply()/poolSize;
//   }

//   function resolve(uint256 _loanId) public {
//     Loan _loan = loans[_loanId];
//     require(block.timestamp > _loan.startDate + _loan.duration && _loan.borrowedAmount > 0, "borrower has not defaulted");
//     uint256 _normalisedCost = gberaRatio*_loan.borrowedAmount / 10**18;
//     require(gbera.balanceOf(msg.sender) >= _normalisedCost);
//     gbera.burn(msg.sender,_normalisedCost);      
//     poolsize -= _loan.borrowedAmount - _loan.interest;
//     liquidated[_loanId] = true;
//     resolved[_loanId] = true;
//     gberaRatio = gbera.supply()/poolsize;
//     debt -= (_loan.borrowedAmount - _loan.interest);
//     _loan.borrowedAmount = 0;
//     for(uint256 i=0; i < _loan.collateralTokens.length; i++){
//       _loan.collateralTokens[i].transfer(address(this), msg.sender);
//     }
//   }

//   function liquidator() public {
//     for (uint256 i=0; i < loans.length; i++) {
//       _loan = loans[i];
//       if (block.timestamp > _loan.startDate + _loan.duration + 1 days && _loan.borrowedAmount > 0){
//         liquidated[_loan.loanId] = true;
//         auction(_loan.loanId);
//       }
//     }
//   }

//   function auction(uint256 _loanId) public {
//     require(liquidated[_loanId] == true && resolved[_loanId] == false && auctioned[_loanId] == false, "this loan hasn't been liquidated or has already been resolved or auctioned");
//     auctioned[_loanId] = true;
//     Loan _loan = loans[_loanId];
//     Auction memory _auction = Auction({
//       startDate: block.timestamp,
//       endDate: startDate + 3 days,
//       tokens: _loan.collateralTokens, 
//       startPrice: ((_loan.borrowedAmount - _loan.interest)*gberaRatio)/10**18, 
//       auctionId: _loanId,
//       highestBid: 0,
//       highestBidder: treasuryAddress,
//       claimed: false
//     });
//   }

//   function bid(uint256 _bidAmount, uint256 _auctionId) public {
//     Auction _auction = auctionLookup[_auctionId];
//     require(_bidAmount > _auction.highestBid, "doesn't beat current highest bid");
//     require(gbera.balanceOf(msg.sender) >= _bidAmount, "insufficient balance");
//     require(block.timestamp < _auction.endDate, "auction already ended");
//     gbera.transferFrom(msg.sender, address(this), _bidAmount);
//     if (_auction.highestBid > 0){
//       gbera.transferFrom(address(this), _auction.highestBidder, _auction.highestBid);
//     }
//     auctions[i].highestBid = _bidAmount;
//     auctions[i].highestBidder = msg.sender;
//   }

//   //function for auction winner to claim the NFT's
//   function auctionClaim(uint256 _auctionId) public {
//     Auction _auction = auctionLookup[_auctionId];
//     require(_auction.highestBidder == msg.sender, "you didn't win the auction");
//     require(_auction.claimed == false, "auction already claimed");
//     require(block.timestamp >= _auction.endDate, "auction not yet finished");    
//     _auction.claimed = true;    
//     poolSize -= _auction.startPrice;
//     debt -= _auction.startPrice;
//     if(_auction.startPrice < _auction.highestBid) {
//       gbera.burn(address(this), _auction.highestBid);
//       for(uint256 i=0; i < _auction.tokens.length; i++) {
//         _auction.tokens[i].transfer(address(this), msg.sender);
//       }
//     }
//     else {
//       for(uint256 i=0; i < _auction.tokens.length; i++) {
//         _auction.tokens[i].transferFrom(address(this), treasuryAddress);
//       }
//       totalValuation = totalValuation/10;
//     }
//     gberaRatio = gbera.supply()*10**18/poolSize;
//   }

//   //function for gberastakers to vote on interest rates and valuations
//   function Vote(uint256 _rate, uint256 _value) public {
//     stakedPosition _stake = stakeLookup[msg.sender];
//     require(staked[msg.sender] == true && block.timestamp - _stake.startDate > 2 weeks && block.timestamp - _stake.lastVote > 1 weeks);
//     require(_stake.stakedBalance > 0, "you have no voting power");
//     _stake.interestVote = _rate;
//     _stake.valueVote = _value;
//     uint256 _averageRate = 0;
//     uint256 _averageValuation = 0;
//     for(uint256 i=0; i < stakers.length; i++) {
//       _averageRate += stakeLookup[msg.sender].stakeVote*stakeLookup[msg.sender].stakedBalance;
//       _averageValuation += stakeLookup[msg.sender].valueVote*stakeLookup[msg.sender].stakedBalance;
//     }
//     _averageRate = _averageRate/totalStaked;
//     _averageValuation = _averageValuation/totalStaked;
//     require(_averageValuation <= totalValuation*105/100); 
//     interestRate = _averageRate;
//     totalValuation = _averageValuation;
//   }

// }

// //TODO: think about function security (all public right now), implement honeycomb/beradrome nft utility, integrate porridge token contract