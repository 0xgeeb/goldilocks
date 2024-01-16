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
// ========================================= Porridge ===========================================
// ==============================================================================================


//todo: fix unweighted stake bug
//todo: add checkpoints
import { ERC20 } from "../../lib/solady/src/tokens/ERC20.sol";
import { SafeTransferLib } from "../../lib/solady/src/utils/SafeTransferLib.sol";
import { FixedPointMathLib } from "../../lib/solady/src/utils/FixedPointMathLib.sol";
import { IBorrow } from "../interfaces/IBorrow.sol";
import { IGAMM } from "../interfaces/IGAMM.sol";


/// @title Porridge
/// @notice Staking of the $LOCKS token to earn $PRG
/// @author geeb
/// @author ampnoob
contract Porridge is ERC20 {


  struct Stake {
    uint256 lastClaim;
    uint256 stakedBalance;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      STATE VARIABLES                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  uint32 public immutable DAYS_SECONDS = 86400;
  // uint16 public immutable DAILY_EMISSISION_RATE = 600;
  uint256 public immutable ANNUAL_PORRIDGE_EMISSIONS = 5e17;

  mapping(address => Stake) public stakes;

  address public gamm;
  address public borrow;
  address public goldilend;
  address public honey;


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                          CONSTRUCTOR                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Constructor of this contract
  /// @param _gamm Address of the GAMM
  /// @param _borrow Address of the Borrow contract
  /// @param _goldilend Address of the Goldilend contract
  /// @param _honey Address of the HONEY contract
  constructor(
    address _gamm, 
    address _borrow,
    address _goldilend,
    address _honey
  ) {
    gamm = _gamm;
    borrow = _borrow;
    goldilend = _goldilend;
    honey = _honey;
  }

  /// @notice Returns the name of the $PRG token
  function name() public pure override returns (string memory) {
    return "Porridge Token";
  }

  /// @notice Returns the symbol of the $PRG token
  function symbol() public pure override returns (string memory) {
    return "PRG";
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           ERRORS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  error NotGoldilend();
  error InvalidUnstake();
  error LocksBorrowedAgainst();


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           EVENTS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  event Staked(address indexed user, uint256 amount);
  event Unstaked(address indexed user, uint256 amount);
  event Realized(address indexed user, uint256 amount);
  event Claimed(address indexed user, uint256 amount);


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                         MODIFIERS                          */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Ensures msg.sender is the goldilend address
  modifier onlyGoldilend() {
    if(msg.sender != goldilend) revert NotGoldilend();
    _;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                       VIEW FUNCTIONS                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Returns the staked $LOCKS of an address
  /// @param user Address to view staked $LOCKS
  function getStaked(address user) external view returns (uint256) {
    Stake memory userStake = stakes[user];
    return userStake.stakedBalance;
  }

  /// @notice Returns the stake start time of an address
  /// @param user Address to view stake start time
  function getStakeStartTime(address user) external view returns (uint256) {
    Stake memory userStake = stakes[user];
    return userStake.lastClaim;
  }

  /// @notice Returns the claimable yield of an address
  /// @param user Address to view claimable yield
  function getClaimable(address user) external view returns (uint256) {
    Stake memory userStake = stakes[user];
    uint256 stakedAmount = userStake.stakedBalance;
    return _calculateClaimable(user, stakedAmount);
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                    EXTERNAL FUNCTIONS                      */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Stakes $LOCKS and begins earning $PRG
  /// @param amount Amount of $LOCKS to stake
  function stake(uint256 amount) external {
    Stake memory userStake = Stake({
      lastClaim: block.timestamp,
      stakedBalance: stakes[msg.sender].stakedBalance + amount
    });
    stakes[msg.sender] = userStake;
    SafeTransferLib.safeTransferFrom(gamm, msg.sender, address(this), amount);
    emit Staked(msg.sender, amount);
  }

  /// @notice Unstakes $LOCKS and claims $PRG 
  /// @param amount Amount of $LOCKS to unstake
  function unstake(uint256 amount) external {
    Stake memory userStake = stakes[msg.sender];
    if(amount > userStake.stakedBalance) revert InvalidUnstake();
    if(amount > userStake.stakedBalance - IBorrow(borrow).getLocked(msg.sender)) revert LocksBorrowedAgainst();
    uint256 stakedAmount = userStake.stakedBalance;
    stakes[msg.sender].stakedBalance -= amount;
    _claim(stakedAmount);
    SafeTransferLib.safeTransfer(gamm, msg.sender, amount);
    emit Unstaked(msg.sender, amount);
  }

  /// @notice Burns $PRG to buy $LOCKS at floor price
  /// @param amount Amount of $PRG to burn
  function realize(uint256 amount) external {
    _burn(msg.sender, amount);
    SafeTransferLib.safeTransferFrom(honey, msg.sender, gamm, FixedPointMathLib.mulWad(amount, IGAMM(gamm).floorPrice()));
    IGAMM(gamm).porridgeMint(msg.sender, amount);
    emit Realized(msg.sender, amount);
  }

  /// @notice Claim $PRG rewards
  function claim() external {
    Stake memory userStake = stakes[msg.sender];
    _claim(userStake.stakedBalance);
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      INTERNAL FUNCTIONS                    */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Calculates and distributes yield
  /// @param stakedAmount Amount of $LOCKS the user has staked in the contract
  function _claim(uint256 stakedAmount) internal {
    uint256 claimable = _calculateClaimable(msg.sender, stakedAmount);
    if(claimable > 0) {
      stakes[msg.sender].lastClaim = block.timestamp;
      _mint(msg.sender, claimable);
      emit Claimed(msg.sender, claimable);
    }
  }
    
  /// @notice Calculates claimable yield
  /// @dev claimable = (staked $LOCKS / daily emission rate) * days staked
  /// @param user Address of staker to calculate yield
  /// @param stakedAmount Amount of $LOCKS the user has staked in the contract
  /// @return yield Amount of $PRG earned by staker
  function _calculateClaimable(
    address user, 
    uint256 stakedAmount
  ) public view returns (uint256 yield) {
    uint256 timeStaked = _timeStaked(user);
    uint256 claimablePRG = FixedPointMathLib.mulWad(ANNUAL_PORRIDGE_EMISSIONS, stakedAmount);
    yield = FixedPointMathLib.mulWad(claimablePRG, FixedPointMathLib.divWad(timeStaked, 365 days));
    // uint256 yieldPortion = stakedAmount / DAILY_EMISSISION_RATE;
    // yield = FixedPointMathLib.mulWad(yieldPortion, FixedPointMathLib.divWad(timeStaked, DAYS_SECONDS));
  }

  /// @notice Calculates time staked of a staker
  /// @param user Address of staker to find time staked
  /// @return timeStaked staked of an address
  function _timeStaked(address user) internal view returns (uint256 timeStaked) {
    Stake memory userStake = stakes[user];
    timeStaked = block.timestamp - userStake.lastClaim;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                   PERMISSIONED FUNCTION                    */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Mints $PRG to user who is staking $gBERA
  /// @dev Only Goldilend contract can call this function
  /// @param to Recipient of minted $PRG tokens
  /// @param amount Amount of minted $PRG tokens
  function goldilendMint(address to, uint256 amount) external onlyGoldilend {
    _mint(to, amount);
  }

}