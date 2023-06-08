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
import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { IBorrow } from "./interfaces/IBorrow.sol";
import { IGAMM } from "./interfaces/IGAMM.sol";


/// @title Porridge
/// @notice Staking of the $LOCKS token to earn $PRG
/// @author geeb
/// @author ampnoob
contract Porridge is ERC20("Porridge Token", "PRG") {


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      STATE VARIABLES                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  IERC20 honey;
  IGAMM igamm;
  IBorrow iborrow;

  mapping(address => uint256) public staked;
  mapping(address => uint256) public stakeStartTime;

  uint256 public totalStaked;
  uint256 public immutable DAYS_SECONDS = 86400e18;
  uint8 public immutable DAILY_EMISSISIONS = 200;
  address public adminAddress;
  address public gammAddress;


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                          CONSTRUCTOR                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Constructor of this contract
  /// @param _gammAddress Address of the GAMM
  /// @param _borrowAddress Address of the Borrow contract
  /// @param _adminAddress Address of the GoldilocksDAO multisig
  constructor(address _gammAddress, address _borrowAddress, address _adminAddress) {
    igamm = IGAMM(_gammAddress);
    iborrow = IBorrow(_borrowAddress);
    adminAddress = _adminAddress;
    gammAddress = _gammAddress;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           ERRORS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/





  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           EVENTS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/





  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                         MODIFIERS                          */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Ensures msg.sender is the admin address
  modifier onlyAdmin() {
    require(msg.sender == adminAddress, "not admin");
    _;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                       VIEW FUNCTIONS                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice View the staked $LOCKS of an address
  /// @param _user Address to view staked $LOCKS
  function getStaked(address _user) external view returns (uint256) {
    return staked[_user];
  }

  /// @notice View the stake start time of an address
  /// @param _user Address to view stake start time
  function getStakeStartTime(address _user) external view returns (uint256) {
    return stakeStartTime[_user];
  }

  /// @notice View the claimable yield of an address
  /// @param _user Address to view claimable yield
  function getYield(address _user) external view returns (uint256) {
    return _calculateYield(_user);
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                    EXTERNAL FUNCTIONS                      */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice stakes $LOCKS to begin earning $PRG
  /// @param _amount Amount of $LOCKS to stake
  function stake(uint256 _amount) external {
    stakeStartTime[msg.sender] = block.timestamp;
    staked[msg.sender] += _amount;
    IERC20(gammAddress).transferFrom(msg.sender, address(this), _amount);
  }

  /// @notice unstakes $LOCKS and claims $PRG rewards
  /// @param _amount Amount of $LOCKS to unstake
  /// @return _yield Amount of $PRG earned by staker
  function unstake(uint256 _amount) external returns (uint256 _yield) {
    require(_amount > 0, "cannot unstake zero");
    require(staked[msg.sender] >= _amount, "insufficient staked balance");
    require(_amount <= staked[msg.sender] - iborrow.getLocked(msg.sender), "you are currently borrowing against your locks");
    _yield = _distributeYield(msg.sender);
    staked[msg.sender] -= _amount;
    IERC20(gammAddress).transfer(msg.sender, _amount);
  }

  /// @notice Claim $PRG rewards
  /// @return _yield Amount of $PRG earned by staker
  function claim() external returns (uint256 _yield){
    _yield = _distributeYield(msg.sender);
  }

  /// @notice Burns $PRG to buy $LOCKS at floor price
  /// @param _amount Amount of $PRG to burn
  function realize(uint256 _amount) external {
    require(_amount > 0, "cannot realize 0");
    uint256 floorPrice = igamm.floorPrice();    
    _burn(msg.sender, _amount);
    honey.transferFrom(msg.sender, gammAddress, (_amount * floorPrice) / 1e18);
    igamm.porridgeMint(msg.sender, _amount);
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      INTERNAL FUNCTIONS                    */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Calculates claimable yield and mints $PRG
  /// @param _user Address of staker to calculate yield and mint $PRG
  /// @return _yield Amount of $PRG earned by staker
  function _distributeYield(address _user) internal returns (uint256 _yield) {
    _yield = _calculateYield(_user);
    require(_yield > 0, "nothing to distribute");
    stakeStartTime[_user] = block.timestamp;
    _mint(_user, _yield);
  }

  /// @notice Calculates claimable yield
  /// @param _user Address of staker to calculate yield
  /// @return Amount of $PRG earned by staker
  function _calculateYield(address _user) internal view returns (uint256) {
    uint256 _time = _timeStaked(_user);
    uint256 _yieldPortion = staked[_user] / DAILY_EMISSISIONS;
    uint256 _yield = (_yieldPortion * ((_time * 1e18 * 1e18) / DAYS_SECONDS)) / 1e18;
    return _yield;
  }

  /// @notice Calculates time staked of a staker
  /// @param _user Address of staker to find time staked
  /// @return Time staked of an address
  function _timeStaked(address _user) internal view returns (uint256) {
    return block.timestamp - stakeStartTime[_user];
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                       ADMIN FUNCTIONS                      */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Sets address of $HONEY
  /// @param _honeyAddress Addresss of $HONEY
  function setHoneyAddress(address _honeyAddress) external onlyAdmin {
    honey = IERC20(_honeyAddress);
  }

  // todo: delete this
  function approveBorrowForLocks(address _borrowAddress) external onlyAdmin {
    IERC20(gammAddress).approve(_borrowAddress, type(uint256).max);
  }

}