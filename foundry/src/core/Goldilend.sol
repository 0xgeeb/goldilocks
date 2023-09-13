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


import { FixedPointMathLib } from "../../lib/solady/src/utils/FixedPointMathLib.sol";
import { SafeTransferLib } from "../../lib/solady/src/utils/SafeTransferLib.sol";
import { ERC20 } from "../../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import { IERC20 } from "../../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { IERC721 } from "../../lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import { IERC721Receiver } from "../../lib/openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol";
import { IPorridge } from "../interfaces/IPorridge.sol";
import { IConsensusVault } from "../mock/IConsensusVault.sol";


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

  address public porridgeAddress;
  address public adminAddress;
  address public beraAddress;
  address public vaultAddress;

  mapping(address => Boost) public boosts;
  mapping(address => Stake) public stakes;
  mapping(address => Loan[]) public loans;

  mapping(address => uint8) public partnerNFTBoosts;
  mapping(address => uint256) public nftFairValues;

  uint256 public emissionsStart;
  uint256 public totalValuation;
  uint256 public protocolInterestRate;
  uint256 public outstandingDebt;
  uint256 public poolSize;
  uint256 public porridgeMultiple;


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                         CONSTRUCTOR                        */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/
  

  /// @notice Constructor of this contract
  /// @param _startingPoolSize Starting size of the lending pool
  /// @param _protocolInterestRate Interest rate of the protocol
  /// @param _porridgeMultiple Boost for earning $PRG
  /// @param _porridgeAddress Address of $PRG
  /// @param _adminAddress Address of the GoldilocksDAO multisig
  /// @param _beraAddress Address of $BERA
  /// @param _vaultAddress Address of Consensus Vault
  /// @param _partnerNFTs Partnership NFTs
  /// @param _partnerNFTBoosts Partnership NFTs Boosts
  constructor(
    uint256 _startingPoolSize,
    uint256 _protocolInterestRate,
    uint256 _porridgeMultiple,
    address _porridgeAddress,
    address _adminAddress,
    address _beraAddress, 
    address _vaultAddress,
    address[] memory _partnerNFTs, 
    uint8[] memory _partnerNFTBoosts
  ) {
    poolSize = _startingPoolSize;
    protocolInterestRate = _protocolInterestRate;
    porridgeMultiple = _porridgeMultiple;
    porridgeAddress = _porridgeAddress;
    adminAddress = _adminAddress;
    beraAddress = _beraAddress;
    vaultAddress = _vaultAddress;
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
  error InvalidBoostNFT();
  error BoostNotExpired();
  error NotAdmin();
  error InvalidUnstake();
  error InvalidLoanDuration();
  error InvalidLoanAmount();
  error InvalidCollateral();
  error BorrowLimitExceeded();
  error ExcessiveRepay();
  error LoanNotFound();
  error LoanExpired();
  error Unliquidatable();


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           EVENTS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  event BeraLock(address indexed user, uint256 amount);
  event gBeraStake(address indexed user, uint256 amount);
  event Borrow(address indexed user, uint256 amount);
  event Repay(address indexed user, uint256 amount);
  event Liquidation(address indexed borrower, address indexed liquidator, uint256 amount);


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                         MODIFIERS                          */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Ensures msg.sender is the treasury address
  modifier onlyAdmin() {
    if(msg.sender != adminAddress) revert NotAdmin();
    _;
  }

  /// @notice Ensures a boost is created with only partner NFTs
  /// @param partnerNFTs Array of NFTs to validate as partner NFTs
  modifier validateBoost(address[] calldata partnerNFTs) {
    for(uint256 i; i < partnerNFTs.length; i++) {
      if(partnerNFTBoosts[partnerNFTs[i]] == 0) revert InvalidBoostNFT();
    }
    _;
  }

  /// @notice Ensures a loan is created with only bera NFTs
  /// @param collateralNFTs Array of NFTs to validate as bera NFTs
  modifier validateBorrow(address[] calldata collateralNFTs) {
    for(uint256 i; i < collateralNFTs.length; i++) {
      if(nftFairValues[collateralNFTs[i]] == 0) revert InvalidCollateral();
    }
    _;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                       VIEW FUNCTIONS                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice View the details of all loans originated from user
  /// @param user Originator of loan
  function lookupLoans(address user) external view returns (Loan[] memory userLoans) {
    userLoans = loans[user];
  }

  /// @notice View the details of a loan
  /// @param user Originator of loan
  /// @param userLoanId Id of loan
  function lookupLoan(address user, uint256 userLoanId) external view returns (Loan memory loan) {
    (loan, ) = _lookupLoan(user, userLoanId);
  }
  
  /// @notice View the details of a boost
  /// @param user Owner of boost
  function lookupBoost(address user) external view returns (Boost memory userBoost) {
    userBoost = boosts[user];
  }

  /// @notice View the claimable $PRG of $gBERA staker
  /// @param user $gBERA staker
  function getClaimable(address user) external view returns (uint256) {
    return _calculateClaim(stakes[user]);
  }

  /// @notice View the current $gBERA ratio
  function getgBERARatio() external view returns (uint256) {
    return _gberaRatio();
  }

  /// @notice View the fair value of NFTs
  function getFairValues(address[] calldata collateralNFTs) external view returns (uint256) {
    return _calculateFairValue(collateralNFTs);
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      EXTERNAL FUNCTIONS                    */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Locks partner NFT to receive boost on staking yield and discounted borrowing rates
  /// @param partnerNFT NFT addresse to transfer to this contract
  /// @param partnerNFTId Token ID of NFT to be transferred
  /// @param expiry Expiration date of the boost
  function boost(
    address partnerNFT, 
    uint256 partnerNFTId, 
    uint256 expiry
  ) external {
    if(expiry < block.timestamp + MONTH_DAYS) revert ShortExpiration();
    if(partnerNFTBoosts[partnerNFT] == 0) revert InvalidBoostNFT();
    boosts[msg.sender] = _buildBoost(partnerNFT, partnerNFTId, expiry);
    IERC721(partnerNFT).safeTransferFrom(msg.sender, address(this), partnerNFTId);
  }


  /// @notice Locks partner NFTs to receive boost on staking yield and discounted borrowing rates
  /// @param partnerNFTs Array of NFT addresses to transfer to this contract
  /// @param partnerNFTIds Array of token IDs for NFTs to be transferred
  /// @param expiry Expiration date of the boost
  function boost(
    address[] calldata partnerNFTs, 
    uint256[] calldata partnerNFTIds, 
    uint256 expiry
  ) external validateBoost(partnerNFTs) {
    if(expiry < block.timestamp + MONTH_DAYS) revert ShortExpiration();
    if(partnerNFTs.length != partnerNFTIds.length) revert ArrayMismatch();    
    boosts[msg.sender] = _buildBoost(partnerNFTs, partnerNFTIds, expiry);
    for(uint8 i; i < partnerNFTs.length; i++) {
      IERC721(partnerNFTs[i]).safeTransferFrom(msg.sender, address(this), partnerNFTIds[i]);
    }
  }

  /// @notice Extends the duration of an existing boost
  /// @param newExpiry New expiration of the boost
  function extendBoost(uint256 newExpiry) external {
    if(boosts[msg.sender].expiry == 0) revert InvalidBoost();
    if(newExpiry < block.timestamp + MONTH_DAYS) revert ShortExpiration();
    boosts[msg.sender].expiry = newExpiry;
  }

  /// @notice Claims tokens from expired boosts
  function withdrawBoost() external {
    Boost memory userBoost = boosts[msg.sender];
    if(userBoost.expiry == 0) revert InvalidBoost();
    if(userBoost.expiry > block.timestamp) revert BoostNotExpired();
    address[] memory nfts;
    uint256[] memory ids;
    Boost memory newUserBoost = Boost({
      partnerNFTs: nfts,
      partnerNFTIds: ids,
      expiry: 0,
      boostMagnitude: 0
    });
    boosts[msg.sender] = newUserBoost;
    for(uint8 i; i < userBoost.partnerNFTs.length; i++) {
      IERC721(userBoost.partnerNFTs[i]).safeTransferFrom(address(this), msg.sender, userBoost.partnerNFTIds[i]);
    }
  }
  
  /// @notice Locks $BERA and mints $gBERA
  /// @param lockAmount Amount of $BERA to lock
  function lock(uint256 lockAmount) external {
    poolSize += lockAmount;
    SafeTransferLib.safeTransferFrom(beraAddress, msg.sender, address(this), lockAmount);
    _refreshBera(lockAmount);
    _mint(msg.sender, _gberaMintAmount(lockAmount));
    emit BeraLock(msg.sender, lockAmount);
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
    emit gBeraStake(msg.sender, stakeAmount);
  }

  /// @notice Unstakes $gBERA
  /// @param unstakeAmount Amount of $gBERA to unstake
  function unstake(uint256 unstakeAmount) external {
    uint256 stakedBalance = stakes[msg.sender].stakedBalance;
    if(stakedBalance < unstakeAmount) revert InvalidUnstake();
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
    _claim();
    stakes[msg.sender].lastClaim = block.timestamp;
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
    if(nftFairValues[collateralNFT] == 0) revert InvalidCollateral();
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
      interest = (interest / 100) * discount;
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
      loanId: loans[msg.sender].length + 1,
      liquidated: false
    });
    loans[msg.sender].push(loan);
    IERC721(collateralNFT).safeTransferFrom(msg.sender, address(this), collateralNFTId);
    SafeTransferLib.safeTransfer(beraAddress, msg.sender, borrowAmount);
    emit Borrow(msg.sender, borrowAmount);
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
  ) external validateBorrow(collateralNFTs) {
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
      interest = (interest / 100) * discount;
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
    emit Borrow(msg.sender, borrowAmount);
  }

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
    poolSize += (interest / 100) * 95;
    if(userLoan.borrowedAmount - repayAmount == 0) {
      for(uint256 i; i < userLoan.collateralNFTs.length; i++){
        IERC721(userLoan.collateralNFTs[i]).safeTransferFrom(address(this), msg.sender, userLoan.collateralNFTIds[i]);
      }
    }
    _refreshBera(repayAmount);
    SafeTransferLib.safeTransfer(beraAddress, adminAddress, (interest / 100) * 5);
    SafeTransferLib.safeTransferFrom(beraAddress, msg.sender, address(this), repayAmount);
    emit Repay(msg.sender, repayAmount);
  }

  /// @notice Liquidates overdue loans by paying $BERA to purchase collateral
  /// @param user Owner of loan to be liquidated
  /// @param userLoanId Loan to be liquidated
  function liquidate(address user, uint256 userLoanId) external {
    (Loan memory userLoan, uint256 index) = _lookupLoan(user, userLoanId);
    if(block.timestamp < userLoan.endDate || userLoan.liquidated) revert Unliquidatable();
    loans[user][index].liquidated = true;
    loans[user][index].borrowedAmount = 0;
    poolSize += (userLoan.interest / 100) * 95;
    outstandingDebt -= userLoan.borrowedAmount - userLoan.interest;
    for(uint256 i; i < userLoan.collateralNFTs.length; i++) {
      IERC721(userLoan.collateralNFTs[i]).safeTransferFrom(address(this), msg.sender, userLoan.collateralNFTIds[i]);
    }
    SafeTransferLib.safeTransfer(beraAddress, adminAddress, (userLoan.interest / 100) * 5);
    SafeTransferLib.safeTransferFrom(beraAddress, msg.sender, address(this), userLoan.borrowedAmount);
    emit Liquidation(msg.sender, user, userLoan.borrowedAmount);
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
    uint256 timeStaked = (block.timestamp - userStake.lastClaim) > SIX_MONTHS ? SIX_MONTHS : block.timestamp - userStake.lastClaim;
    uint256 rate = _calculateRate(userStake.lastClaim);
    porridgeEarned = FixedPointMathLib.mulWad(timeStaked, rate) * userStake.stakedBalance;
    Boost memory userBoost = boosts[msg.sender];
    if (userBoost.expiry > block.timestamp) {
      uint256 porridgeBoost = 50;
      if(userBoost.boostMagnitude < porridgeBoost) {
        porridgeBoost = userBoost.boostMagnitude;
      }
      porridgeEarned = (porridgeEarned / 100) * (100 + porridgeBoost);
    }
  }

  /// @notice Calculates the rate of $PRG emissions
  /// @param lastClaim Last timestamp user claimed
  function _calculateRate(uint256 lastClaim) internal view returns (uint256 rate) {
    uint256 emissionsPeriod = block.timestamp - emissionsStart;
    if(emissionsPeriod > SIX_MONTHS) {
      emissionsPeriod = SIX_MONTHS;
    }
    uint256 average = (emissionsPeriod + (lastClaim - emissionsStart)) / 2;
    if(average > SIX_MONTHS) {
      average = SIX_MONTHS;
    }
    rate = porridgeMultiple - FixedPointMathLib.mulWad(porridgeMultiple, FixedPointMathLib.divWad(average, SIX_MONTHS));
  }

  /// @notice Calculates the fair value of NFTs being borrowed against
  /// @param collateralNFTs NFT collections to find value of
  /// @return fairValue Fair value of NFTs
  function _calculateFairValue(address[] calldata collateralNFTs) internal view returns (uint256 fairValue) {
    for(uint256 i; i < collateralNFTs.length; i++) {
      fairValue += (totalValuation / 100) * nftFairValues[collateralNFTs[i]];
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
    uint256 ratio = FixedPointMathLib.divWad(debt + borrowAmount, poolSize) + 5e17;
    uint256 interestRate = rate + FixedPointMathLib.mulWad(10 * rate, FixedPointMathLib.mulWad(ratio, FixedPointMathLib.divWad(duration, ONE_YEAR)));
    interest = FixedPointMathLib.mulWad(FixedPointMathLib.mulWad(interestRate, borrowAmount), FixedPointMathLib.divWad(duration, ONE_YEAR));
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

  /// @notice Stakes $BERA in Berachain Consensus Vault, 
  /// claims existing vault rewards, and updates poolSize
  /// @param beraAmount Amount of $BERA to stake
  function _refreshBera(uint256 beraAmount) internal {
    IERC20(beraAddress).approve(vaultAddress, beraAmount);
    uint256 rewards = IConsensusVault(vaultAddress).deposit(beraAmount);
    poolSize += rewards;
  }

  /// @notice Calculates the amount of $gBERA to mint
  /// @param lockAmount Amount of $BERA to lock
  /// @return mintAmount Total supply of $gBERA divided by the lending pool size multiplied by lockAmount
  function _gberaMintAmount(uint256 lockAmount) internal view returns (uint256 mintAmount) {
    uint256 ratio = _gberaRatio();
    mintAmount = totalSupply() > 0 ? FixedPointMathLib.mulWad(lockAmount, ratio) : lockAmount;
  }

  /// @notice Calculates the current $gBERA ratio
  /// @return gberaRatio Total supply of $gBERA divided by the lending pool size
  function _gberaRatio() internal view returns (uint256 gberaRatio) {
    gberaRatio = FixedPointMathLib.divWad(totalSupply(), poolSize);
  }

  /// @notice Creates the struct containing the details of the boost
  /// @param partnerNFT NFT address to transfer to this contract
  /// @param partnerNFTId Token ID of NFT to be transferred
  function _buildBoost(
    address partnerNFT, 
    uint256 partnerNFTId,
    uint256 expiry
  ) internal returns (Boost memory newUserBoost) {
    uint256 magnitude;
    Boost storage userBoost = boosts[msg.sender];
    if(userBoost.expiry == 0) {
      magnitude = partnerNFTBoosts[partnerNFT];
      address[] memory nft = new address[](1);
      nft[0] = partnerNFT;
      uint256[] memory id = new uint256[](1);
      id[0] = partnerNFTId;
      newUserBoost = Boost({
        partnerNFTs: nft,
        partnerNFTIds: id,
        expiry: expiry,
        boostMagnitude: magnitude
      });
    }
    else {
      address[] storage nfts = userBoost.partnerNFTs;
      uint256[] storage ids = userBoost.partnerNFTIds;
      magnitude = userBoost.boostMagnitude;
      magnitude += partnerNFTBoosts[partnerNFT];
      nfts.push(partnerNFT);
      ids.push(partnerNFTId);
      newUserBoost = Boost({
        partnerNFTs: nfts,
        partnerNFTIds: ids,
        expiry: expiry,
        boostMagnitude: magnitude
      });
    }
  }

  /// @notice Creates the struct containing the details of the boost
  /// @param partnerNFTs Array of NFT addresses to transfer to this contract
  /// @param partnerNFTIds Array of token IDs for NFTs to be transferred
  function _buildBoost(
    address[] calldata partnerNFTs, 
    uint256[] calldata partnerNFTIds,
    uint256 expiry
  ) internal returns (Boost memory newUserBoost) {
    uint256 magnitude;
    Boost storage userBoost = boosts[msg.sender];
    if(userBoost.expiry == 0) {
      for(uint8 i; i < partnerNFTs.length; i++) {
        magnitude += partnerNFTBoosts[partnerNFTs[i]];
      }
      newUserBoost = Boost({
        partnerNFTs: partnerNFTs,
        partnerNFTIds: partnerNFTIds,
        expiry: expiry,
        boostMagnitude: magnitude
      });
    }
    else {
      address[] storage nfts = userBoost.partnerNFTs;
      uint256[] storage ids = userBoost.partnerNFTIds;
      magnitude = userBoost.boostMagnitude;
      for (uint256 i = 0; i < partnerNFTs.length; i++) {
        magnitude += partnerNFTBoosts[partnerNFTs[i]];
        nfts.push(partnerNFTs[i]);
        ids.push(partnerNFTIds[i]);
      }
      newUserBoost = Boost({
        partnerNFTs: nfts,
        partnerNFTIds: ids,
        expiry: expiry,
        boostMagnitude: magnitude
      });
    }
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                    PERMISSIONED FUNCTIONS                  */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Allows the DAO to adjust the valuation of the NFTs to borrow against
  /// @param _totalValuation The total valuation of all NFTs able to be borrowed against
  /// @param _nfts NFTs that are able to be borrowed against
  /// @param _nftFairValues The percentage each NFT is valued as a porportion of the total valuation
  function setValue(
    uint256 _totalValuation, 
    address[] calldata _nfts,
    uint256[] calldata _nftFairValues
  ) external onlyAdmin {
    totalValuation = _totalValuation;
    for(uint256 i; i < _nftFairValues.length; i++) {
      nftFairValues[_nfts[i]] = _nftFairValues[i];
    }
  } 

  /// @notice Allows the DAO to adjust the interest rate for the protocol
  /// @param _protocolInterestRate New interest rate
  function setProtocolInterestRate(uint256 _protocolInterestRate) external onlyAdmin {
    protocolInterestRate = _protocolInterestRate;
  }

  /// @notice Allows the DAO to withdraw $BERA in case of emergency
  function emergencyWithdraw() external onlyAdmin {
    SafeTransferLib.safeTransfer(beraAddress, adminAddress, poolSize - outstandingDebt);
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                   IMPLEMENTATION FUNCTION                  */
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