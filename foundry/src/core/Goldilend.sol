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


//todo: validate bear nfts on boost and borrow and borrow functions
//todo: implement this lib on all e18 number math
import { FixedPointMathLib } from "../../lib/solady/src/utils/FixedPointMathLib.sol";
import { SafeTransferLib } from "../../lib/solady/src/utils/SafeTransferLib.sol";
import { ERC20 } from "../../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import { IERC721 } from "../../lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import { IERC721Receiver } from "../../lib/openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol";
import { IPorridge } from "../interfaces/IPorridge.sol";


/// @title Goldilend
/// @notice Berachain NFT Lending
/// @author ampnoob
/// @author geeb
contract Goldilend is ERC20("gBERA Token", "gBERA"), IERC721Receiver {


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                          STRUCTS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  struct Loan {
    address[] collateralNFTs;
    uint256[] collateralNFTIds;
    uint256 borrowedAmount;
    uint256 interest;
    uint256 duration;
    uint256 endDate;
    uint256 loanId;
    bool liquidated;
  }

  struct Boost {
    address[] partnerNFTs;
    uint256[] partnerNFTIds;
    uint256 expiry;
    uint256 boostMagnitude;
  }

  struct Stake {
    uint256 lastClaim;
    uint256 stakedBalance;    
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      STATE VARIABLES                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/
    

  uint32 public constant DAYS_SECONDS = 86400;
  uint32 public constant FORTNITE = DAYS_SECONDS * 14;
  uint32 public constant MONTH_DAYS = DAYS_SECONDS * 30;
  uint32 public constant SIX_MONTHS = MONTH_DAYS * 6;
  uint32 public constant ONE_YEAR = MONTH_DAYS * 12;

  address public beraAddress;
  address public porridgeAddress;
  address public adminAddress;
  address public treasuryAddress;

  mapping(address => Boost) public boosts;
  mapping(address => Stake) public stakes;
  mapping(address => Loan[]) public loans;

  mapping(address => uint8) public partnerNFTBoosts;
  mapping(address => uint256) public nftFairValues;

  uint256 emissionsStart;
  uint256 totalValuation;
  uint256 protocolInterestRate;
  uint256 outstandingDebt;
  uint256 poolSize;
  uint256 gberaRatio;
  uint256 porridgeMultiple;


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                         CONSTRUCTOR                        */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/
  

  /// @notice Constructor of this contract
  /// @param _startingPoolSize Starting size of the lending pool
  /// @param _protocolInterestRate Interest rate of the protocol
  /// @param _beraAddress Address of $BERA
  /// @param _porridgeAddress Address of $PRG
  /// @param _adminAddress Address of the Goldilocks DAO multisig
  /// @param _treasuryAddress Address of the Goldilocks Treasury
  /// @param _partnerNFTs Partnership NFTs
  /// @param _partnerNFTBoosts Partnership NFTs Boosts
  constructor(
    uint256 _startingPoolSize,
    uint256 _protocolInterestRate,
    address _beraAddress, 
    address _porridgeAddress,
    address _treasuryAddress,
    address _adminAddress,
    address[] memory _partnerNFTs, 
    uint8[] memory _partnerNFTBoosts
  ) {
    poolSize = _startingPoolSize;
    protocolInterestRate = _protocolInterestRate;
    beraAddress = _beraAddress;
    porridgeAddress = _porridgeAddress;
    treasuryAddress = _treasuryAddress;
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
  error InvalidLoanDuration();
  error InvalidLoanAmount();
  error InvalidCollateral();
  error BorrowLimitExceeded();
  error ExcessiveRepay();
  error LoanNotFound();
  error LoanExpired();
  error UnLiquidatable();


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           EVENTS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  //todo: add deez


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
  /*                       VIEW FUNCTIONS                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice View the details of a loan
  /// @param user Originator of loan
  /// @param userLoanId Id of loan
  function lookupLoan(address user, uint256 userLoanId) external view returns (Loan memory loan) {
    (loan, ) = _lookupLoan(user, userLoanId);
  }

  /// @notice View the claimable $PRG of $gBERA staker
  /// @param user $gBERA staker
  function getClaimable(address user) external view returns (uint256) {
    return _calculateClaim(stakes[user]);
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      EXTERNAL FUNCTIONS                    */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  //todo: bug here where if user boosts twice the first boost NFTs would be stuck in contract
  /// @notice Locks partner NFTs to receive boost on staking yield and discounted borrowing rates
  /// @param partnerNFTs Array of NFT addresses to transfer to this contract
  /// @param partnerNFTIds Array of token IDs for NFTs to be transferred
  /// @param expiry Expiration date of the boost
  function boost(
    address[] calldata partnerNFTs, 
    uint256[] calldata partnerNFTIds, 
    uint256 expiry
  ) external {
    if(expiry < block.timestamp + MONTH_DAYS) revert ShortExpiration();
    if(partnerNFTs.length != partnerNFTIds.length) revert ArrayMismatch();
    uint256 magnitude;
    for(uint8 i; i < partnerNFTs.length; i++) {
      IERC721(partnerNFTs[i]).safeTransferFrom(msg.sender, address(this), partnerNFTIds[i]);
      magnitude += partnerNFTBoosts[partnerNFTs[i]];
    }
    Boost memory userBoost = Boost({
      partnerNFTs: partnerNFTs,
      partnerNFTIds: partnerNFTIds,
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
      IERC721(userBoost.partnerNFTs[i]).safeTransferFrom(address(this), msg.sender, userBoost.partnerNFTIds[i]);
    }
    boosts[msg.sender].boostMagnitude = 0;
    boosts[msg.sender].expiry = 0;
  }
  
  /// @notice Locks $BERA and mints $gBERA
  /// @param lockAmount Amount of $BERA to lock
  function lock(uint256 lockAmount) external {
    poolSize += lockAmount;
    SafeTransferLib.safeTransferFrom(beraAddress, msg.sender, address(this), lockAmount);
    _mint(msg.sender, lockAmount * gberaRatio);
    _refreshBera(lockAmount);
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
    SafeTransferLib.safeTransferFrom(address(this), msg.sender, address(this), stakeAmount);
  }

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
    SafeTransferLib.safeTransfer(address(this), msg.sender, unstakeAmount);
  }

  /// @notice Claims $gBERA staking rewards
  function claim() external {
    if(emissionsStart + SIX_MONTHS > block.timestamp) revert EmissionsEnded();
    _claim();
  }

  /// @notice Borrows $BERA against value of NFT
  /// @param borrowAmount Amount of $BERA to borrow
  /// @param duration Duration of loan
  /// @param collateralNFT NFT collection to use as collateral
  /// @param collateralNFTId Token Id of NFT to use as collateral
  function borrow(
    uint256 borrowAmount,
    uint256 duration,
    address collateralNFT,
    uint256 collateralNFTId
  ) external {
    if(duration < FORTNITE || duration > ONE_YEAR) revert InvalidLoanDuration();
    if(borrowAmount > poolSize / 10) revert InvalidLoanAmount();
    uint256 fairValue = nftFairValues[collateralNFT] * totalValuation / 100;
    uint256 debt = outstandingDebt;
    if(borrowAmount > fairValue || borrowAmount > poolSize - debt) revert BorrowLimitExceeded();
    uint256 interest = _calculateInterest(borrowAmount, debt, duration);
    Boost memory userBoost = boosts[msg.sender];
    if(userBoost.expiry > block.timestamp + duration) {
      uint256 discount = 50;
      if(userBoost.boostMagnitude < discount) {
        discount = 100 - userBoost.boostMagnitude;
      }
      interest = interest * discount / 100;
    }
    outstandingDebt = debt + borrowAmount;
    address[] memory collateralNFTs = new address[](1);
    collateralNFTs[0] = collateralNFT;
    uint256[] memory collateralNFTIds = new uint256[](1);
    collateralNFTIds[0] = collateralNFTId;
    Loan memory loan = Loan({
      collateralNFTs: collateralNFTs,
      collateralNFTIds: collateralNFTIds,
      borrowedAmount: borrowAmount + interest,
      interest: interest,
      duration: duration,
      endDate: block.timestamp + duration,
      loanId: loans[msg.sender].length,
      liquidated: false
    });
    loans[msg.sender].push(loan);
    IERC721(collateralNFT).safeTransferFrom(msg.sender, address(this), collateralNFTId);
    SafeTransferLib.safeTransfer(beraAddress, msg.sender, borrowAmount);
  }

  /// @notice Borrows $BERA against value of NFTs
  /// @param borrowAmount Amount of $BERA to borrow
  /// @param duration Duration of loan
  /// @param collateralNFTs NFT collections to use as collateral
  /// @param collateralNFTIds Token IDs of NFTs to use as collateral
  function borrow(
    uint256 borrowAmount, 
    uint256 duration, 
    address[] calldata collateralNFTs, 
    uint256[] calldata collateralNFTIds
  ) external {
    if(duration < FORTNITE || duration > ONE_YEAR) revert InvalidLoanDuration();
    if(borrowAmount > poolSize / 10) revert InvalidLoanAmount();
    if(collateralNFTs.length != collateralNFTIds.length) revert ArrayMismatch();
    uint256 fairValue = _calculateFairValue(collateralNFTs);
    uint256 debt = outstandingDebt;
    if(borrowAmount > fairValue || borrowAmount > poolSize - debt) revert BorrowLimitExceeded();
    uint256 interest = _calculateInterest(borrowAmount, debt, duration);
    Boost memory userBoost = boosts[msg.sender];
    if(userBoost.expiry > block.timestamp + duration) {
      uint256 discount = 50;
      if(userBoost.boostMagnitude < discount) {
        discount = 100 - userBoost.boostMagnitude;
      }
      interest = interest * discount / 100;
    }
    outstandingDebt = debt + borrowAmount;
    Loan memory loan = Loan({
      collateralNFTs: collateralNFTs,
      collateralNFTIds: collateralNFTIds,
      borrowedAmount: borrowAmount + interest,
      interest: interest,
      duration: duration,
      endDate: block.timestamp + duration,
      loanId: loans[msg.sender].length + 1,
      liquidated: false
    });
    loans[msg.sender].push(loan);
    for(uint256 i; i < collateralNFTs.length; i++) {
      IERC721(collateralNFTs[i]).safeTransferFrom(msg.sender, address(this), collateralNFTIds[i]);
    } 
    SafeTransferLib.safeTransfer(beraAddress, msg.sender, borrowAmount);
  }

  //todo: test loanid lookup method and if someone can access someone elses
  //todo: ask amp about interest math
  /// @notice Repays loan of $BERA
  /// @param repayAmount Amount of $BERA to repay
  /// @param userLoanId ID of loan to repay
  function repay(uint256 repayAmount, uint256 userLoanId) external {
    (Loan memory userLoan, uint256 index) = _lookupLoan(msg.sender, userLoanId);
    if(userLoan.borrowedAmount < repayAmount) revert ExcessiveRepay();
    if(block.timestamp > userLoan.endDate) revert LoanExpired();
    uint256 interestLoanRatio = userLoan.interest / userLoan.borrowedAmount;
    uint256 interest = repayAmount * interestLoanRatio;
    outstandingDebt -= repayAmount - interest;
    loans[msg.sender][index].borrowedAmount -= repayAmount;
    loans[msg.sender][index].interest -= interest;
    poolSize += interest * 95 / 100;
    gberaRatio = FixedPointMathLib.divWad(totalSupply(), poolSize);
    if(userLoan.borrowedAmount - repayAmount == 0) {
      for(uint256 i; i < userLoan.collateralNFTs.length; i++){
        IERC721(userLoan.collateralNFTs[i]).safeTransferFrom(address(this), msg.sender, userLoan.collateralNFTIds[i]);
      }
    }
    SafeTransferLib.safeTransfer(beraAddress, treasuryAddress, interest * 5 / 100);
    SafeTransferLib.safeTransferFrom(beraAddress, msg.sender, address(this), repayAmount);
    _refreshBera(repayAmount);
  }

  //todo: check with amp about expirations
  /// @notice Liquidates overdue loans by paying $BERA to purchase collateral
  /// @param user Owner of loan to be liquidated
  /// @param userLoanId Loan to be liquidated
  function liquidate(address user, uint256 userLoanId) external {
    (Loan memory userLoan, uint256 index) = _lookupLoan(user, userLoanId);
    if(block.timestamp < userLoan.endDate || userLoan.liquidated) revert UnLiquidatable();
    loans[user][index].liquidated = true;
    loans[user][index].borrowedAmount = 0;
    poolSize += userLoan.interest * 95 / 100;
    outstandingDebt -= userLoan.borrowedAmount - userLoan.interest;
    gberaRatio = FixedPointMathLib.divWad(totalSupply(), poolSize);
    for(uint256 i; i < userLoan.collateralNFTs.length; i++) {
      IERC721(userLoan.collateralNFTs[i]).safeTransferFrom(address(this), msg.sender, userLoan.collateralNFTIds[i]);
    }
    SafeTransferLib.safeTransfer(beraAddress, treasuryAddress, userLoan.interest * 5 / 100);
    SafeTransferLib.safeTransferFrom(beraAddress, msg.sender, address(this), userLoan.borrowedAmount);
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

  //todo: what should porridgeMultiple be
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

  /// @notice Calculates the fair value of NFTs being borrowed against
  /// @param collateralNFTs NFT collections to find value of
  /// @return fairValue Fair value of NFTs
  function _calculateFairValue(address[] calldata collateralNFTs) internal view returns (uint256 fairValue) {
    for(uint256 i; i < collateralNFTs.length; i++) {
      fairValue += (nftFairValues[collateralNFTs[i]] * totalValuation) / 100;
    }
  }

  /// @notice Caluclates the total interest due at repayment
  /// @param borrowAmount Amount to be borrowed
  /// @param debt Current amount of outstanding debt
  /// @return interest Total interest due at repayment
  function _calculateInterest(
    uint256 borrowAmount, 
    uint256 debt,
    uint256 duration
  ) internal view returns (uint256 interest) {
    uint256 rate = protocolInterestRate;
    uint256 ratio = ((2 * (debt + borrowAmount)) / poolSize + 1) / 2;
    uint256 interestRate = rate + (10 * rate * duration * ratio / 365);
    interest = (interestRate * borrowAmount * duration) / 365;
  }

  /// @notice Finds the loan by userId
  /// @param userLoanId Id of loan to be found
  function _lookupLoan(
    address user, 
    uint256 userLoanId
  ) internal view returns (Loan memory userLoan, uint256 index) {
    for(uint256 i; i < loans[user].length; i++) {
      if(loans[user][i].loanId == userLoanId) return (loans[user][i], i);
    }
    revert LoanNotFound();
  }

  //todo: implement this
  /// @notice Stakes $BERA in Berachain Consensus Vault, 
  /// claims existing vault rewards, and updates $gBERA ratio
  /// @param beraAmount Amount of $BERA to stake
  function _refreshBera(uint256 beraAmount) internal {

  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                    PERMISSIONED FUNCTION                   */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Allows the DAO to adjust the valuation of the NFT's and the interest rate
  function setValue(uint256 value, uint256 rate) external onlyTreasury {
    totalValuation = value;
    protocolInterestRate = rate;
  } 


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                   IMPLEMENTATION FUNCTIONS                 */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  function onERC721Received(
    address,
    address,
    uint256,
    bytes calldata
  ) external virtual returns (bytes4) {
    return IERC721Receiver.onERC721Received.selector;
  }

}