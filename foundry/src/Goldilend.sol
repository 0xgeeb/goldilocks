//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


// |============================================================================================|
// |    ______      _____    __      _____    __   __       _____     _____   __  __   ______   |
// |   /_/\___\    ) ___ (  /\_\    /\ __/\  /\_\ /\_\     ) ___ (   /\ __/\ /\_\\  /\/ ____/\  |
// |   ) ) ___/   / /\_/\ \( ( (    ) )  \ \ \/_/( ( (    / /\_/\ \  ) )__\/( ( (/ / /) ) __\/  |
// |  /_/ /  ___ / /_/ (_\ \\ \_\  / / /\ \ \ /\_\\ \_\  / /_/ (_\ \/ / /    \ \_ / /  \ \ \    |
// |  \ \ \_/\__\\ \ )_/ / // / /__\ \ \/ / // / // / /__\ \ )_/ / /\ \ \_   / /  \ \  _\ \ \   |
// |   )_)  \/ _/ \ \/_\/ /( (_____() )__/ /( (_(( (_____(\ \/_\/ /  ) )__/\( (_(\ \ \)____) )  |
// |   \_\____/    )_____(  \/_____/\/___\/  \/_/ \/_____/ )_____(   \/___\/ \/_//__\/\____\/   |
// |                                                                                            |
// |============================================================================================|
// ==============================================================================================
// ======================================== Goldilend ===========================================
// ==============================================================================================


import { FixedPointMathLib } from "../lib/solady/src/utils/FixedPointMathLib.sol";
import { ERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { ERC721 } from "../lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import { IERC721 } from "../lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import { IgBERA } from "./interfaces/IgBERA.sol";


/// @title Goldilend
/// @notice Berachain NFT Lending
/// @author ampnoob
/// @author geeb
contract Goldilend {


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                          STRUCTS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  struct Loan {
    ERC721[] collateralTokens;
    uint256 borrowedAmount;
    uint256 interest;
    uint256 startDate;
    address userAddress;
    uint256 duration;
    uint256 loanId;
  }

  struct Boost {
    address[] partnerNFTs;
    uint256[] partnerNFTIDs;
    uint256 expiry;
    uint256 boostMagnitude;
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
    uint256 lastClaim;
    uint256 stakedBalance;
    address stakeAddress;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      STATE VARIABLES                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/
    

  uint32 public constant DAYS_SECONDS = 86400;
  uint32 public constant MONTH_DAYS = DAYS_SECONDS * 30;
  uint32 public constant SIX_MONTHS = MONTH_DAYS * 6;

  address bera;
  address gbera;
  address treasuryAddress;

  mapping (uint256 => Loan) public loanLookup;
  mapping (address => StakedPosition) public stakeLookup;
  mapping (address => Boost) public boosts;

  mapping (bytes32 => uint) public fairValue;
  mapping (bytes32 => uint) public boostSizes;

  mapping (uint256 => bool) public liquidated;
  mapping (address => bool) public staked;
  mapping (address => uint8) public partnerNFTBoosts;

  Loan[] public loans;

  uint256 totalValuation;
  uint256 poolSize;
  uint256 gberaRatio;
  uint256 loanIdTracker = 0;
  uint256 debt = 0;
  uint256 interestRate = 15;
  uint256 porridgeMultiple;
  uint256 emissionsStart;


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                         CONSTRUCTOR                        */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/
  

  /// @notice Constructor of this contract
  /// @param _startingSize Starting size of the lending pool
  /// @param _beraAddress Address of $BERA
  /// @param _gberaAddress Address of $gBERA
  /// @param _partnerNFTs Partnership NFTs
  /// @param _partnerNFTBoosts Partnership NFTs Boosts
  constructor(uint256 _startingSize, address _beraAddress, address _gberaAddress, address[] memory _partnerNFTs, uint8[] memory _partnerNFTBoosts) {
    poolSize = _startingSize;
    bera = _beraAddress;
    gbera = _gberaAddress;
    emissionsStart = block.timestamp;
    for(uint8 i; i < _partnerNFTs.length; i++) {
      partnerNFTBoosts[_partnerNFTs[i]] = _partnerNFTBoosts[i];
    }
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           ERRORS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  error ShortExpiration();
  error ArrayMismatch();


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           EVENTS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/




  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                         MODIFIERS                          */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      EXTERNAL FUNCTIONS                    */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

  /// @notice Locks partner NFTs to receive boost on staking yield and discounted borrowing rates
  function boost(address[] memory partnerNFTs, uint256[] memory partnerNFTIDs, uint256 expiry) external {
    if(expiry < block.timestamp + MONTH_DAYS) revert ShortExpiration();
    if(partnerNFTs.length != partnerNFTIDs.length) revert ArrayMismatch();

    //todo: add boostmagnitude loop

    Boost memory userBoost = Boost({
      partnerNFTs: partnerNFTs,
      partnerNFTIDs: partnerNFTIDs,
      expiry: expiry,
      boostMagnitude: 0
    });

    boosts[msg.sender] = userBoost;
  }

  /// @notice Extends the duration of an existing boost
  function extendBoost(uint256 _expirationDate) external {
    // require(boosted[msg.sender] == true, "no boost to extend");
    boostLookup[msg.sender].expiry = _expirationDate;
  }

  /// @notice Claims tokens from expired boosts
  function withdrawBoost() external view {
    // require(boosted[msg.sender] == true, "no boost to withdraw");
    // _boost = boostLookup[msg.sender];
    // require(_boost.expiry < block.timestamp, "boost not expired");
    // for (uint256 i=0; i < _boost.boostTokens.length; i++){
    //   _boost.boostTokens[i].transfer(address(this), msg.sender);
    // }
    // bosted[msg.sender] = false;
  }
  
  /// @notice Locks $BERA and mints $gBERA
  /// @param lockAmount Amount of $BERA to lock
  function lock(uint256 lockAmount) external {
    require(lockAmount > 0, "can't lock zero tokens");
    require (IERC20(bera).balanceOf(msg.sender) >= lockAmount, "insufficient balance");
    IERC20(bera).transferFrom(msg.sender, address(this), lockAmount);
    IgBERA(gbera).mint(msg.sender, gberaRatio*lockAmount/10**18);
    poolSize += lockAmount;
  }

  /// @notice Stakes $gBERA
  /// @param stakeAmount Amount of $gBERA to stake
  function stake(uint256 stakeAmount) external {
    require(stakeAmount > 0, "can't stake zero tokens");
    // require (IgBERA(gbera).balanceOf(msg.sender) >= stakeAmount, "insufficient balance");
    if(!staked[msg.sender]) {
      StakedPosition memory _stake = StakedPosition({
        lastClaim: block.timestamp,
        stakedBalance: stakeAmount,
        stakeAddress: msg.sender
      });
      staked[msg.sender] = true;
      stakeLookup[msg.sender] = _stake;
    }
    else{
      stakeLookup[msg.sender].stakedBalance += stakeAmount;
      claim();
    }
    // totalStaked += stakeAmount;
  }

  function unstake(uint256 unstakeAmount) external {
    require(staked[msg.sender] == true, "you're not staked!"); 
    uint256 _balance = stakeLookup[msg.sender].stakedBalance;
    require(unstakeAmount > 0, "can't unstake zero tokens");
    require (_balance >= unstakeAmount, "insufficient staked balance");
    stakeLookup[msg.sender].stakedBalance -= unstakeAmount;
    claim();
    if(_balance - unstakeAmount == 0){
      staked[msg.sender] = false;
    }
  }

  function claim() public view {
    require(staked[msg.sender] == true, "you're not staked!");
    // StakedPosition memory _stake = stakeLookup[msg.sender];
    // if(block.timestamp < emissionsStart + sixMonths) {
    //   uint256 _timestaked = block.timestamp - _stake.lastClaim;
    //   uint256 _average = ((block.timestamp - emissionsStart) + (_stake.lastClaim - emissionsStart))/2;
    //   uint256 _rate = porridgeMultiple - (porridgeMultiple*_average/sixMonths);
    //   uint256 _porridgeEarned = (_timestaked * _rate * _stake.stakedBalance)/100;
    //   if (boosted[msg.sender] == true){
    //     _boost = boostLookup[msg.sender];
    //     if (_boost.expiry > block.timestamp) {
    //       _porridgeEarned = (_porridgeEarned*(100+_boost.boostMagnitude))/100;
    //     }
    //   }
    //   porridge.mint(msg.sender, _porridgeEarned);
    // }
    // stakeLookup[msg.sender].lastClaim = block.timestamp;
  }

  function borrow(uint256 _borrowAmount, ERC721[] memory _collateral, uint256 _duration, bytes32[] memory _collectionIDs) external {
    require(_borrowAmount >= 0, "can't borrow zero");
    require(_duration >= 14 && _duration <= 365, "invalid loan duration");
    require(_borrowAmount <= poolSize/10);
    // uint256 preciseDuration = _duration * 1 days;
    // uint256 _availableCapital = poolSize - debt;
    // uint256 _borrowed = debt + _borrowamount;
    // uint256 _fairValue;
    // for(uint256 i; i < _collateral.length; i++) {
    //   require(isBear(_collateral[i], _collectionIds[i]) == true && ownerOf(_collateral[i]) == msg.sender, "insufficiently dank collateral");
    //   _fairValue += (fairValue[_collectionIDs[i]]*totalValuation)/100;
    // }
    // require(_borrowAmount <= _fairValue && _borrowamount <= _availableCapital, "borrow limit exceeded");
    // for(uint256 i; i < _collateral.length; i++) {
    //   collateral[i].transfer(msg.sender, address(this));
    // } 
    // uint256 _ratio = ((2*10**18*_borrowed)/poolsize + 1)/2;
    // uint256 _interestRate = (interestRate*10**18) + (10*interestRate*_duration*ratio/365);
    // uint256 _interest = (_interestRate*borrowedAmount*_duration)/(365*10**20);
    // if (boosted[msg.sender] == true){
    //   _boost = boostLookup[msg.sender];
    //   if (_boost.expiry > block.timestamp + preciseDuration){
    //     uint256 _discount = 50;
    //     if _boost.boostMagnitude < 50 {
    //       _discount = 100 - _boost.boostMagnitude;
    //     }
    //     _interest = (discount*_interest)/100;
    //   }
    // }
    loanIdTracker += 1;
    // debt = _borrowed;
    // Loan memory _loan = Loan({
    //   collateralTokens: _collateral,
    //   borrowedAmount: _borrowAmount + _interest,
    //   interest: _interest,
    //   startDate: block.timestamp,
    //   userAddress: msg.sender,
    //   duration: preciseDuration,
    //   loanId: loanIdTracker
    // });
    // loans.push(_loan);
    // liquidated[_loan.loanId] = false;
    IERC20(bera).transferFrom(address(this), msg.sender, _borrowAmount);
  }

  function repay(uint256 _repayAmount, uint256 _loanId) external {
    // Loan _loan = loans[_loanId];
    // require(block.timestamp <= _loan.startDate + _loan.duration);
    // require(_repayAmount >= 0, "can't repay zero");
    // require(_loan.borrowedAmount >= _repayAmount, "repaying too much");
    // bera.transferFrom(msg.sender, address(this), _repayAmount);
    // uint256 _ratio = loan.interest*10**18/loan.borrowedAmount;
    // uint256 _interest = (_repayAmount*_ratio)/10**18;
    // // debt -= (_repayAmount - _interest);
    // _loan.borrowedAmount -= _repayAmount;
    // _loan.interest -= _interest;
    // loans[_loanId] = _loan;
    // if(_loan.borrowedAmount == 0) {
    //   for(uint256 i=0; i < loan.collateral.length; i++){
    //     loan.collateral[i].transfer(address(this), msg.sender);
    //   }
    // }
    // poolsize += _interest*95/100; 
    // bera.transferFrom(address(this), treasuryAddress, _interest*5/100);
    // gberaRatio =  gbera.supply()*10**18/poolSize;
  }


  //function to liquidate overdue loans and pay bera to purchase collateral
  function liquidate(uint256 _loanId) external {
    // Loan _loan = loans[_loanId];
    // require(block.timestamp > _loan.startDate + _loan.duration && _loan.borrowedAmount > 0, "borrower has not defaulted");
    // require(bera.balanceOf(msg.sender) >= _loan.borrowedAmount);
    // bera.transferFrom(msg.sender, address(this), _loan.borrowedAmount);
    // poolsize += _loan.interest*95/100;
    // bera.transferFrom(address(this), treasuryAddress, _interest*5/100);
    // liquidated[_loanId] = true;
    // gberaRatio = gbera.supply()*10**18/poolsize;
    // debt -= (_loan.borrowedAmount - _loan.interest);
    // loans[_loanId].borrowedAmount = 0;
    // for(uint256 i; i < _loan.collateralTokens.length; i++) {
    //   _loan.collateralTokens[i].transfer(address(this), msg.sender);
    // }
  }

  //function for the DAO to adjust the valuation of the NFT's and the interest rate
  function setValue(uint256 _value, uint256 _rate) public {
    require(msg.sender == treasuryAddress, "only treasury can set valuation");
    totalValuation = _value;
    interestRate = _rate;
  } 


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      INTERNAL FUNCTIONS                    */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


}

//TODO: think about function security (all public right now), implement honeycomb/beradrome nft utility, integrate porridge token contract