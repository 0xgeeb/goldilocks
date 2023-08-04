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
import { IPorridge } from "./interfaces/IPorridge.sol";


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

  struct Stake {
    uint256 lastClaim;
    uint256 stakedBalance;    
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      STATE VARIABLES                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/
    

  uint32 public constant DAYS_SECONDS = 86400;
  uint32 public constant MONTH_DAYS = DAYS_SECONDS * 30;
  uint32 public constant SIX_MONTHS = MONTH_DAYS * 6;

  address public beraAddress;
  address public gberaAddress;
  address public porridgeAddress;
  address public adminAddress;
  address public treasuryAddress;

  mapping (address => Boost) public boosts;
  mapping (address => Stake) public stakes;
  mapping (uint256 => Loan) public loanLookup;

  mapping (bytes32 => uint) public fairValue;
  mapping (bytes32 => uint) public boostSizes;

  mapping (uint256 => bool) public liquidated;
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
  /// @param _porridgeAddress Address of $PRG
  /// @param _adminAddress Address of the Goldilocks DAO multisig
  /// @param _partnerNFTs Partnership NFTs
  /// @param _partnerNFTBoosts Partnership NFTs Boosts
  constructor(
    uint256 _startingSize, 
    address _beraAddress, 
    address _gberaAddress, 
    address _porridgeAddress,
    address _adminAddress,
    address[] memory _partnerNFTs, 
    uint8[] memory _partnerNFTBoosts
  ) {
    poolSize = _startingSize;
    beraAddress = _beraAddress;
    gberaAddress = _gberaAddress;
    porridgeAddress = _porridgeAddress;
    adminAddress = _adminAddress;
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
  error InvalidBoost();
  error BoostNotExpired();
  error NotTreasury();
  error NotAdmin();
  error InvalidStake();
  error EmissionsEnded();


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           EVENTS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/




  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                         MODIFIERS                          */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Ensures msg.sender is the treasury address
  modifier onlyTreasury() {
    if(msg.sender != treasuryAddress) revert NotTreasury();
    _;
  }

  /// @notice Ensures msg.sender is the admin address
  modifier onlyAdmin() {
    if(msg.sender != adminAddress) revert NotAdmin();
    _;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      EXTERNAL FUNCTIONS                    */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Locks partner NFTs to receive boost on staking yield and discounted borrowing rates
  /// @param partnerNFTs Array of NFT addresses to transfer to this contract
  /// @param partnerNFTIDs Array of token IDs for NFTs to be transferred
  /// @param expiry Expiration date of the boost
  function boost(address[] calldata partnerNFTs, uint256[] calldata partnerNFTIDs, uint256 expiry) external {
    if(expiry < block.timestamp + MONTH_DAYS) revert ShortExpiration();
    if(partnerNFTs.length != partnerNFTIDs.length) revert ArrayMismatch();
    uint256 magnitude;
    for(uint8 i; i < partnerNFTs.length; i++) {
      IERC721(partnerNFTs[i]).safeTransferFrom(msg.sender, address(this), partnerNFTIDs[i]);
      magnitude += partnerNFTBoosts[partnerNFTs[i]];
    }
    Boost memory userBoost = Boost({
      partnerNFTs: partnerNFTs,
      partnerNFTIDs: partnerNFTIDs,
      expiry: expiry,
      boostMagnitude: magnitude
    });
    boosts[msg.sender] = userBoost;
  }

  /// @notice Extends the duration of an existing boost
  /// @param newExpiry New expiration of the boost
  function extendBoost(uint256 newExpiry) external {
    if(boosts[msg.sender].expiry == 0) revert InvalidBoost();
    boosts[msg.sender].expiry = newExpiry;
  }

  /// @notice Claims tokens from expired boosts
  function withdrawBoost() external {
    Boost memory userBoost = boosts[msg.sender];
    if(userBoost.expiry == 0) revert InvalidBoost();
    if(userBoost.expiry > block.timestamp) revert BoostNotExpired();
    for(uint8 i; i < userBoost.partnerNFTs.length; i++) {
      IERC721(userBoost.partnerNFTs[i]).safeTransferFrom(address(this), msg.sender, userBoost.partnerNFTIDs[i]);
    }
    boosts[msg.sender].boostMagnitude = 0;
  }
  
  //todo: add code to stake bera in consensus vault, add existing consensus vault rewards to pool and update gbera ratio
  /// @notice Locks $BERA and mints $gBERA
  /// @param lockAmount Amount of $BERA to lock
  function lock(uint256 lockAmount) external {
    poolSize += lockAmount;
    IERC20(beraAddress).transferFrom(msg.sender, address(this), lockAmount);
    IgBERA(gberaAddress).mint(msg.sender, lockAmount * gberaRatio);
  }

  /// @notice Stakes $gBERA
  /// @param stakeAmount Amount of $gBERA to stake
  function stake(uint256 stakeAmount) external {
    if(stakes[msg.sender].lastClaim > 0) {
      _claim();
    }
    Stake memory userStake = Stake({
      lastClaim: block.timestamp,
      stakedBalance: stakes[msg.sender].stakedBalance + stakeAmount
    });
    stakes[msg.sender] = userStake;
    IERC20(gberaAddress).transferFrom(msg.sender, address(this), stakeAmount);
  }

  //todo: use solady safetranfser instead here
  /// @notice Unstakes $gBERA
  /// @param unstakeAmount Amount of $gBERA to unstake
  function unstake(uint256 unstakeAmount) external {
    uint256 stakedBalance = stakes[msg.sender].stakedBalance;
    if(stakedBalance < unstakeAmount) revert InvalidStake();
    Stake memory userStake = Stake({
      lastClaim: block.timestamp,
      stakedBalance: stakedBalance - unstakeAmount
    });
    _claim();
    stakes[msg.sender] = userStake;
    IERC20(gberaAddress).transfer(msg.sender, unstakeAmount);
  }

  //todo: add function to mint porridge
  /// @notice Claims $gBERA staking rewards
  function claim() external {
    if(emissionsStart + SIX_MONTHS > block.timestamp) revert EmissionsEnded();
    _claim();
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
    IERC20(beraAddress).transferFrom(address(this), msg.sender, _borrowAmount);
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

  /// @notice Allows the DAO to adjust the valuation of the NFT's and the interest rate
  function setValue(uint256 value, uint256 rate) external onlyTreasury {
    totalValuation = value;
    interestRate = rate;
  } 


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      INTERNAL FUNCTIONS                    */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Calculates and distributes claiming rewards
  function _claim() internal {
    Stake memory userStake = stakes[msg.sender];
    uint256 claimed = _calculateClaim(userStake);
    stakes[msg.sender].lastClaim = block.timestamp;
    IPorridge(porridgeAddress).goldilendMint(msg.sender, claimed);
  }

  /// @notice Calculates claiming rewards
  /// @param userStake Struct of the user's current stake information
  function _calculateClaim(Stake memory userStake) internal view returns (uint256 porridgeEarned) {
    uint256 timeStaked = block.timestamp - userStake.lastClaim;
    uint256 average = ((block.timestamp - emissionsStart) + (userStake.lastClaim - emissionsStart)) / 2;
    uint256 rate = porridgeMultiple - (porridgeMultiple * average / SIX_MONTHS);
    porridgeEarned = (timeStaked * rate * userStake.stakedBalance) / 100;
    Boost memory userBoost = boosts[msg.sender];
    if (userBoost.expiry > block.timestamp) {
      porridgeEarned = (porridgeEarned * (100 + userBoost.boostMagnitude)) / 100;
    }
  }
}

//TODO: think about function security (all public right now), implement honeycomb/beradrome nft utility, integrate porridge token contract