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


import { ERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import { ReentrancyGuard } from "../lib/openzeppelin-contracts/contracts/security/ReentrancyGuard.sol";
import { SafeTransferLib } from "../lib/solady/src/utils/SafeTransferLib.sol";
import { FixedPointMathLib } from "../lib/solady/src/utils/FixedPointMathLib.sol";
import { IBorrow } from "./interfaces/IBorrow.sol";
import { IGAMM } from "./interfaces/IGAMM.sol";


/// @title Porridge
/// @notice Staking of the $LOCKS token to earn $PRG
/// @author geeb
/// @author ampnoob
contract Porridge is ERC20("Porridge Token", "PRG"), ReentrancyGuard {


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      STATE VARIABLES                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  uint32 public immutable DAYS_SECONDS = 86400;
  uint8 public immutable DAILY_EMISSISION_RATE = 200;

  mapping(address => uint256) public staked;
  mapping(address => uint256) public stakeStartTime;

  address public gammAddress;
  address public borrowAddress;
  address public honeyAddress;
  address public goldilendAddress;


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                          CONSTRUCTOR                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Constructor of this contract
  /// @param _gammAddress Address of the GAMM
  /// @param _borrowAddress Address of the Borrow contract
  /// @param _honeyAddress Address of the HONEY contract
  constructor(address _gammAddress, address _borrowAddress, address _honeyAddress) {
    gammAddress = _gammAddress;
    borrowAddress = _borrowAddress;
    honeyAddress = _honeyAddress;
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
    if(msg.sender != goldilendAddress) revert NotGoldilend();
    _;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                       VIEW FUNCTIONS                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice View the staked $LOCKS of an address
  /// @param user Address to view staked $LOCKS
  function getStaked(address user) external view returns (uint256) {
    return staked[user];
  }

  /// @notice View the stake start time of an address
  /// @param user Address to view stake start time
  function getStakeStartTime(address user) external view returns (uint256) {
    return stakeStartTime[user];
  }

  /// @notice View the claimable yield of an address
  /// @param user Address to view claimable yield
  function getClaimable(address user) external view returns (uint256) {
    uint256 stakedAmount = staked[user];
    return _calculateClaimable(user, stakedAmount);
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                    EXTERNAL FUNCTIONS                      */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice stakes $LOCKS to begin earning $PRG
  /// @param amount Amount of $LOCKS to stake
  function stake(uint256 amount) external nonReentrant {
    if(staked[msg.sender] > 0) {
      _stakeClaim();
    }
    stakeStartTime[msg.sender] = block.timestamp;
    staked[msg.sender] += amount;
    SafeTransferLib.safeTransferFrom(gammAddress, msg.sender, address(this), amount);
    emit Staked(msg.sender, amount);
  }

  /// @notice unstakes $LOCKS and claims $PRG rewards
  /// @param amount Amount of $LOCKS to unstake
  function unstake(uint256 amount) external nonReentrant {
    if(amount > staked[msg.sender]) revert InvalidUnstake();
    if(amount > staked[msg.sender] - IBorrow(borrowAddress).getLocked(msg.sender)) revert LocksBorrowedAgainst();
    uint256 stakedAmount = staked[msg.sender];
    staked[msg.sender] -= amount;
    _claim(stakedAmount);
    SafeTransferLib.safeTransfer(gammAddress, msg.sender, amount);
    emit Unstaked(msg.sender, amount);
  }

  /// @notice Burns $PRG to buy $LOCKS at floor price
  /// @param amount Amount of $PRG to burn
  function realize(uint256 amount) external nonReentrant {
    _burn(msg.sender, amount);
    SafeTransferLib.safeTransferFrom(honeyAddress, msg.sender, gammAddress, FixedPointMathLib.mulWad(amount, IGAMM(gammAddress).floorPrice()));
    IGAMM(gammAddress).porridgeMint(msg.sender, amount);
    emit Realized(msg.sender, amount);
  }

  /// @notice Claim $PRG rewards
  function claim() external nonReentrant {
    uint256 stakedAmount = staked[msg.sender];
    _claim(stakedAmount);
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      INTERNAL FUNCTIONS                    */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Calculates and distributes yield
  /// @param stakedAmount Amount of $LOCKS the user has staked in the contract
  function _claim(uint256 stakedAmount) internal {
    uint256 claimable = _calculateClaimable(msg.sender, stakedAmount);
    if(claimable > 0) {
      stakeStartTime[msg.sender] = block.timestamp;
      _mint(msg.sender, claimable);
      emit Claimed(msg.sender, claimable);
    }
  }

  /// @notice Calculates and distributes yield from stake function
  function _stakeClaim() internal {
    uint256 stakedAmount = staked[msg.sender];
    uint256 claimable = _calculateClaimable(msg.sender, stakedAmount);
    if(claimable > 0) {
      _mint(msg.sender, claimable);
      emit Claimed(msg.sender, claimable);
    }
  }

  /// @notice Calculates claimable yield
  /// @param user Address of staker to calculate yield
  /// @param stakedAmount Amount of $LOCKS the user has staked in the contract
  /// @return yield Amount of $PRG earned by staker
  function _calculateClaimable(address user, uint256 stakedAmount) internal view returns (uint256 yield) {
    uint256 timeStaked = _timeStaked(user);
    uint256 yieldPortion = stakedAmount / DAILY_EMISSISION_RATE;
    yield = yieldPortion * (timeStaked / DAYS_SECONDS);
  }

  /// @notice Calculates time staked of a staker
  /// @param user Address of staker to find time staked
  /// @return timeStaked staked of an address
  function _timeStaked(address user) internal view returns (uint256 timeStaked) {
    timeStaked = block.timestamp - stakeStartTime[user];
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                  PERMISSIONED FUNCTIONS                    */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Goldilend contract will call this function when users claim $PRG tokens
  /// @param to Recipient of minted $PRG tokens
  /// @param amount Amount of minted $PRG tokens
  function goldilendMint(address to, uint256 amount) external onlyGoldilend {
    _mint(to, amount);
  }
}