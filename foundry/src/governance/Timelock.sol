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
// ========================================= TimeLock ===========================================
// ==============================================================================================


/// @title Timelock
/// @notice Timelock contract for Goldilocks Protocol & Goldilocks DAO
/// @dev Forked from Uniswap governance contracts, https://etherscan.io/address/0x1a9C8182C09F50C8318d769245beA52c32BE35BC
/// @author geeb
contract Timelock {


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      STATE VARIABLES                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  uint32 public constant GRACE_PERIOD = 14 days;
  uint32 public constant MINIMUM_DELAY = 2 days;
  uint32 public constant MAXIMUM_DELAY = 30 days;

  address public admin;
  address public pendingAdmin;

  mapping(bytes32 => bool) public queuedTransactions;

  uint256 public delay;


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                         CONSTRUCTOR                        */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/
  

  /// @notice Constructor of this contract
  /// @param _admin Admin address
  /// @param _delay Delay the timelock will use, in blocks
  constructor(address _admin, uint256 _delay) {
    if(_delay < MINIMUM_DELAY || delay > MAXIMUM_DELAY) revert InvalidDelay();
    admin = _admin;
    delay = _delay;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           ERRORS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  error InvalidDelay();
  error InvalidETA();
  error NotAdmin();
  error NotPendingAdmin();
  error TxNotQueued();
  error TxLocked();
  error TxStale();
  error TxReverted();


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           EVENTS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  event NewAdmin(address indexed newAdmin);
  event NewPendingAdmin(address indexed newPendingAdmin);
  event NewDelay(uint indexed newDelay);
  event CancelTransaction(bytes32 indexed txHash, address indexed target, uint value, string signature,  bytes data, uint eta);
  event ExecuteTransaction(bytes32 indexed txHash, address indexed target, uint value, string signature,  bytes data, uint eta);
  event QueueTransaction(bytes32 indexed txHash, address indexed target, uint value, string signature, bytes data, uint eta);


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      EXTERNAL FUNCTIONS                    */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Queues a transaction for exeuction
  /// @param target Address to send the transaction to
  /// @param eta Duration of time until transaction can be executed, in blocks
  /// @param value Amount of ETH to be sent with transaction
  /// @param data Calldata to be sent with transaction
  /// @param signature Sig of transaction
  function queueTransaction(
    address target, 
    uint256 eta,
    uint256 value,
    bytes memory data,
    string memory signature
  ) external {
    if(msg.sender != admin) revert NotAdmin();
    if(eta < block.timestamp + delay) revert InvalidETA();
    bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
    queuedTransactions[txHash] = true;
    emit QueueTransaction(txHash, target, value, signature, data, eta);
  }

  /// @notice Executes a transaction if delay has passed
  /// @param target Address to send the transaction to
  /// @param eta Duration of time until transaction can be executed, in blocks
  /// @param value Amount of ETH to be sent with transaction
  /// @param data Calldata to be sent with transaction
  /// @param signature Sig of transaction
  function executeTransaction(
    address target, 
    uint256 eta,
    uint256 value, 
    bytes memory data, 
    string memory signature
  ) external payable {
    if(msg.sender != admin) revert NotAdmin();
    bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
    if(!queuedTransactions[txHash]) revert TxNotQueued();
    if(block.timestamp < eta) revert TxLocked();
    if(block.timestamp > eta + GRACE_PERIOD) revert TxStale();
    queuedTransactions[txHash] = false;
    bytes memory callData;
    if (bytes(signature).length == 0) {
      callData = data;
    } 
    else {
      callData = abi.encodePacked(bytes4(keccak256(bytes(signature))), data);
    }
    (bool success, ) = target.call{ value: value }(callData);    
    if(!success) revert TxReverted();
    emit ExecuteTransaction(txHash, target, value, signature, data, eta);
  }

  /// @notice Cancels a transaction before execution
  /// @param target Address to send the transaction to
  /// @param eta Duration of time until transaction can be executed, in blocks
  /// @param value Amount of ETH to be sent with transaction
  /// @param data Calldata to be sent with transaction
  /// @param signature Sig of transaction
  function cancelTransaction(
    address target, 
    uint256 eta,
    uint256 value, 
    bytes memory data, 
    string memory signature
  ) external {
    if(msg.sender != admin) revert NotAdmin();
    bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
    queuedTransactions[txHash] = false;
    emit CancelTransaction(txHash, target, value, signature, data, eta);
  }

  /// @notice Begins transfer of admin rights
  /// @dev newPendingAdmin must call `acceptAdmin` to finalize the transfer
  /// @param newPendingAdmin New pending admin
  function setPendingAdmin(address newPendingAdmin) public {
    require(msg.sender == address(this), "call must come from Timelock.");
    pendingAdmin = newPendingAdmin;
    emit NewPendingAdmin(pendingAdmin);
  }

  /// @notice Accepts transfer of admin rights
  function acceptAdmin() public {
    if(msg.sender != pendingAdmin) revert NotPendingAdmin();
    admin = msg.sender;
    pendingAdmin = address(0);
    emit NewAdmin(admin);
  }

  /// @notice Sets the Timelock delay
  function setDelay(uint256 _delay) public {
    require(msg.sender == address(this), "call must come from Timelock.");
    if(_delay < MINIMUM_DELAY || delay > MAXIMUM_DELAY) revert InvalidDelay();
    delay = _delay;
    emit NewDelay(delay);
  }

}