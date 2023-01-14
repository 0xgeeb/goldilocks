// //SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
// import { ERC721 } from "../lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
// import { Math } from "../lib/openzeppelin-contracts/contracts/utils/math/Math.sol";

// contract lendingPool {
  
//   struct Loan {
//     ERC721[] collateralTokens;
//     uint256 borrowedAmount;
//     uint256 interest;
//     uint256 startDate;
//     address userAddress;
//     uint256 duration;
//     uint256 loanId;
//   }

//   struct Lock {
//     uint256 lockAmount;
//     uint256 startDate;
//     address userAddress;
//     uint256 duration;
//     uint256 lockId;
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
//   }
  
//   IERC20 bera;
//   mapping (bytes32 => uint) public fairValue;
//   mapping (address => uint) public claimable;
//   mapping (uint => bool) public liquidated;
//   bytes32[] collectionIDs;
//   Loan[] public loans;
//   Loan[] public inactiveLoans;
//   Lock[] public locks;
//   Lock[] public expiredLocks;
//   Auction[] public auctions;  
//   Auction[] public expiredAuctions;  
//   uint256 corepoolSize;  
//   uint256 corepoolMultiple;  
//   uint256 loanIdTracker = 0;  
//   uint256 lockIdTracker = 0;  
//   uint256 auctionIdTracker = 0;  
//   uint256 pendingRewards = 0;  
//   uint256 badDebt = 0;  
//   address treasuryAddress;

//   constructor(uint256 _startingSize, address _beraAddress, bytes32[] _collectionIDs) {
//     bera = IERC20(_beraAddress);
//     corepoolSize = _startingSize;
//     collectionIDs = _collectionIDs;
//   }
  
//   function isBear(ERC721 token, bytes32 collectionId) public view returns (bool) {    
//     bytes32 tokenMetadata = token.getTokenMetadata(token.tokenOfOwnerByIndex(msg.sender, 0));    
//     bytes32 tokenCollectionId = parseTokenMetadata(tokenMetadata);    
//     return tokenCollectionId == collectionId;
//   }
  
//   function parseTokenMetadata(bytes32 tokenMetadata) internal pure returns (bytes32) {                
//     return tokenMetadata[0:32];
//   }
  
//   function removeLoan(uint loanId) public {    
//     uint index;
//     for (uint i = 0; i < loans.length; i++) {
//       if (loans[i].loanId == loanId) {
//         index = i;
//         break;
//       }
//     }    
//     loans.splice(index, 1);
//   }
  
//   function lockFunction(uint256 _lockAmount, uint256 _duration) public{    
//     require(_lockAmount > 0, "can't lock zero tokens");
//     require(_duration >= 14 * 1 days && _duration <= 365 * 1 days, "duration must be between 2 weeks and 1 year");
//     require (bera.balanceOf(msg.sender) >= _lockAmount);
//     lockIdTracker += 1;    
//     Lock memory _lock = Lock({
//       lockAmount: _lockAmount,
//       startDate: block.timestamp,
//       userAddress: msg.sender,
//       duration: _duration,
//       lockId: lockIdTracker
//     });
//   }
    
//    function borrow(uint256 _borrowAmount, ERC721[] _collateral, uint256 _duration, bytes32[] _collectionIDs) public {      
//       require(_borrowAmount >= 0, "can't borrow zero");
//       require(_duration >= 1 && _duration <= 365, "invalid loan duration");      
//       uint256 preciseDuration = _duration * 1 days;      
//       uint256 _availableCapital = corepoolSize;
//       uint256 _borrowed = _borrowAmount;
//       for (uint256 i=0; i < locks.length; i++) {
//         if (locks[i].startDate + locks[i].duration >= block.timestamp + preciseDuration){
//           _availableCapital += locks[i].lockAmount;
//         }
//       }
//       for (uint256 i=0; i < loans.length; i++) {
//         uint256 increment = loans[i].borrowedAmount; 
//         _availableCapital -= increment;
//         _borrowed += increment;
//       }      
//       uint256 _fairValue = 0;
//       for(uint256 i=0; i < _collateral.length; i++) {        
//         require(isBear(_collateral[i], _collectionIds[i]) == true && ownerOf(_collateral[i]) == msg.sender, "insufficiently dank collateral");        
//         _fairValue += (fairValue[_collectionIDs[i]]*corepoolSize*corepoolMultiple)/100;
//       }      
//       require(_borrowAmount <= _fairValue && _borrowAmount <= _availableCapital, "borrow limit exceeded");      
//       for(uint256 i=0; i < _collateral.length; i++) {
//         collateral[i].transfer(msg.sender, address(this));       
//         uint256 _ratio = Math.max((_borrowed*10**18)/corepoolSize, 2*10**18);      
//         uint256 _interestRate = (14*10**18) + (25*_duration*ratio/365);      
//         uint256 _interest = (_interestRate*borrowedAmount*_duration)/(365*10**20);      
//         idTracker += 1;      
//         Loan memory _loan = Loan({
//           collateralTokens: _collateral,
//           borrowedAmount: _borrowAmount + _interest,
//           interest: _interest,
//           startDate: block.timestamp,
//           userAddress: msg.sender,
//           duration: preciseDuration,
//           loanId: idTracker
//         });
//         loans.push(_loan);      
//         bera.transferFrom(address(this), msg.sender, _borrowAmount);
//       }
//     }
  
//    function repay(uint256 _repayAmount, uint256 _loanId) public {     
//       for (uint256 i=0; i < loans.length; i++) {
//         Loan loan = loans[i];
//         if (loan.loanId == _loanId){          
//           require(block.timestamp <= loan.startDate + loan.duration);          
//           require(_repayAmount >= 0, "can't repay zero");          
//           require(loan.borrowedAmount >= _repayAmount, "repaying too much");          
//           bera.transferFrom(msg.sender, address(this), _repayAmount);          
//           uint256 _fraction = (_repayAmount*10**18)/loan.borrowedAmount;          
//           pendingRewards += (loan.interest*_fraction)/10**18;          
//           loan.borrowedAmount -= _repayAmount;          
//           if(loan.borrowedAmount == 0) {
//             for(uint256 i=0; i < _collateral.length; i++) {
//               collateral[i].transfer(address(this), msg.sender);
//             }
//             removeLoan(_loanId);
//             inactiveloans.push(_loan);
//           }
//         }
//         break;
//       }
//       distribute(treasuryAddress);
//     }
    
//    function fullRepay(uint256 _loanId) public {     
//       for (uint256 i=0; i < loans.length; i++) {
//         Loan loan = loans[i];
//         if (loan.loanId == _loanId){
//           repay(loan.borrowedAmount, _loanId);
//         }
//         break;
//       } 
//     }
  
//   function distribute(address _treasuryAddress) public {
//     uint256 _pendingRewards = pendingRewards;    
//     bera.transferFrom(address(this), _treasuryAddress, (_pendingRewards*75)/1000);    
//     uint256 _coreshare = (_pendingRewards*75)/1000;
//     corepoolSize += coreshare;    
//     uint256 _remainingRewards = (_pendingRewards*85)/100;        
//     uint256 _totalWeight = corepoolSize*3;    
//     mapping (address => uint) rewardShares;    
//     uint256 index = 0;    
//     address[] rewardees;
//     for (uint256 i=0; i < locks.length; i++) {
//       Lock _lock = locks[i];      
//       if (_lock.startDate + _lock.duration <= block.timestamp){        
//         uint256 _multiplier = (((2*10**18)/365*1 days)*(_lock.startDate + _lock.duration - block.timestamp)/10**18) + 1;        
//         uint256 _rewardShare = _multiplier*_lock.lockAmount;        
//         _totalWeight += _rewardShare;
//         rewardShares[_lock.userAddress] += _rewardShare;
//         rewardees.push(_lock.userAddress);
//       }
//       for(uint256 i=0; i<= length(rewardees); i++){
//         rewardShares[rewardess[i]] = _rewardShare/_totalWeight;
//         claimable[rewardess[i]] += rewardShares[rewardess[i]];
//       }    
//     corepoolSize += _pendingRewards*(corepoolSize*3/_totalWeight);
//     }
//   }
  
//   function claimRewards() public {    
//     require(claimable[msg.sender] > 0, "no rewards to claim");    
//     require(bera.balanceOf(address(this)) >= claimable[msg.sender], "insufficient funds in contract");    
//     bera.transferFrom(address(this), msg.sender, claimable[msg.sender]);
//     claimable[msg.sender] = 0;
//   }
  
//   function liquidator() public {    
//     for (uint256 i=0; i < loans.length; i++) {
//       _loan = loans[i];
//       if (block.timestamp > _loan.startDate + _loan.duration + 1 days && _loan.borrowedAmount > 0){
//         liquidated[_loan.loanId] = true;
//         auction(_loan.loanId, _loan.borrowedAmount, _loan.collateralTokens);
//       }
//     }
//   }
  
//   function auction(uint256 _loanId, uint256 _borrowedAmount, ERC721[] _collateral) public {    
//     require(liquidated[_loanId] == true, "this loan hasn't been liquidated");    
//     Auction memory _auction = Auction({
//       startDate: block.timestamp,
//       endDate: startDate + 3 days,
//       tokens: loans[i].collateralTokens, 
//       startPrice: loans[i].borrowedAmount, 
//       auctionId: _loanId,
//       highestBid: 0,
//       highestBidder: treasuryAddress
//     });
//   }
  
//   function bid(uint256 _bidAmount, uint256 _auctionId) public {    
//     for (uint256 i=0; i < auctions.length; i++) {
//       if (auctions[i].auctionId == _auctionId){        
//         Auction _auction = auctions[i];
//         require(_bidAmount > _auction.highestBid, "doesn't beat current highest bid");
//         require(bera.balanceOf(msg.sender) >= _bidAmount, "insufficient balance");        
//         bera.transferFrom(msg.sender, address(this), _bidAmount);
//         bera.transferFrom(address(this), _auction.highestBidder, _auction.highestBid);        
//         auctions[i].highestBid = _bidAmount;
//         auctions[i].highestBidder = msg.sender;
//       }
//     }
//   }
  
//   function auctionClaim(uint256 _auctionId) public {    
//     for (uint256 i=0; i < auctions.length; i++) {
//       if (auctions[i].auctionId == _auctionId){        
//         Auction _auction = auctions[i];
//         require(_auction.highestBidder == msg.sender, "you didn't win the auction");
//         require(block.timestamp >= _auction.endDate, "auction not yet finished");        
//         if(_auction.startPrice == _auction.highestBid && _auction.highestBidder == treasuryAddress){
//           badDebt += _auction.startPrice;
//         }        
//         auctions.splice(i, 1);
//         expiredAuctions.push(_auction);        
//         for(uint256 i=0; i < _auction.tokens.length; i++){
//           _auction.tokens[i].transfer(address(this), msg.sender);
//         }        
//         pendingRewards += _auction.interest;
//       }
//     }
//   }
  
//   function lockClaim(uint256 _lockid) public {
//     for (uint256 i=0; i < auctions.length; i++) {
//       if (locks[i].lockId == _lockid){        
//         Lock _lock = locks[i];
//         require(_lock.startDate + _lock.duration <= block.timestamp, "lock still active");
//         require(bera.balanceOf(address(this)) - corepoolSize >= _lock.lockAmount, "insufficient bera in contract");
//         bera.transferFrom(address(this), _lock.userAddress, _lock.lockAmount);        
//         locks.splice(i, 1);
//         expiredLocks.push(_lock);
//       }
//       break;
//     }    
//     claimRewards();
//   }
  
//   function lockAdd(uint256 _lockid, uint256 _addAmount) public {
//     for (uint256 i=0; i < auctions.length; i++) {
//       if (locks[i].lockId == _lockid){        
//         Lock _lock = locks[i];
//         require(_lock.startDate + _lock.duration >= block.timestamp, "lock expired");
//         require(bera.balanceOf(msg.sender) >= _addAmount, "insufficient bera balance");
//         bera.transferFrom(msg.sender, address(this), _addAmount);        
//         _lock.lockAmount += _addAmount;
//       }
//       break;
//     }    
//     claimRewards();
//   }

// }