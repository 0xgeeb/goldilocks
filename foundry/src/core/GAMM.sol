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
// =================================== Goldilocks AMM (GAMM) ====================================
// ==============================================================================================


import { FixedPointMathLib } from "../../lib/solady/src/utils/FixedPointMathLib.sol";
import { SafeTransferLib } from "../../lib/solady/src/utils/SafeTransferLib.sol";
import { ERC20 } from "../../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";


/// @title Goldilocks AMM (GAMM)
/// @notice Novel AMM & Facilitator of $LOCKS token 
/// @author geeb
/// @author ampnoob
contract GAMM is ERC20("Locks Token", "LOCKS") {


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      STATE VARIABLES                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  uint256 public fsl = 1400000e18;
  uint256 public psl = 400000e18;
  uint256 public supply = 5000e18;
  
  uint256 public targetRatio = 360e15;
  uint256 public immutable DAYS_SECONDS = 86400;

  uint256 public lastFloorRaise;
  uint256 public lastFloorDecrease;

  address public porridgeAddress;
  address public borrowAddress;
  address public honeyAddress;
  address public adminAddress;


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                          CONSTRUCTOR                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Constructor of this contract
  /// @param _adminAddress Address of the GoldilocksDAO multisig
  constructor(address _honeyAddress, address _adminAddress) {
    honeyAddress = _honeyAddress;
    adminAddress = _adminAddress;
    lastFloorRaise = block.timestamp;
    lastFloorDecrease = block.timestamp;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           ERRORS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  error NotAdmin();
  error NotPorridge();
  error NotBorrow();
  error ExcessiveSlippage();


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                           EVENTS                           */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  event Buy(address indexed user, uint256 amount);
  event Sale(address indexed user, uint256 amount);
  event Redeem(address indexed user, uint256 amount);


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                         MODIFIERS                          */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Ensures msg.sender is the admin address
  modifier onlyAdmin() {
    if(msg.sender != adminAddress) revert NotAdmin();
    _;
  }

  /// @notice Ensures msg.sender is the porridge address
  modifier onlyPorridge() {
    if(msg.sender != porridgeAddress) revert NotPorridge();
    _;
  }

  /// @notice Ensures msg.sender is the borrow address
  modifier onlyBorrow() {
    if(msg.sender != borrowAddress) revert NotBorrow();
    _;
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                       VIEW FUNCTIONS                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice View the $LOCKS floor price
  /// @return $LOCKS floor price
  function floorPrice() external view returns (uint256) {
    return _floorPrice(fsl, supply);
  }

  /// @notice View the $LOCKS market price
  /// @return $LOCKS market price
  function marketPrice() external view returns (uint256) {
    return _marketPrice(fsl, psl, supply);
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                    EXTERNAL FUNCTIONS                      */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Purchases $LOCKS tokens with $HONEY tokens
  /// @param amount Amount of $LOCKS to buy
  /// @param maxAmount Maximum amount of $HONEY to spend
  function buy(uint256 amount, uint256 maxAmount) external {
    uint256 _supply = supply;
    uint256 _fsl = fsl;
    uint256 _psl = psl;
    (
      uint256 __psl, 
      uint256 __fsl, 
      uint256 __supply, 
      uint256 __purchasePrice
    ) = _buyLoop(_psl, _fsl, _supply, amount);
    uint256 tax = (__purchasePrice / 1000) * 3;
    if(__purchasePrice + tax > maxAmount) revert ExcessiveSlippage();
    fsl = __fsl + tax;
    psl = __psl;
    supply = __supply;
    _floorRaise();
    SafeTransferLib.safeTransferFrom(honeyAddress, msg.sender, address(this), __purchasePrice + tax);
    _mint(msg.sender, amount);
    emit Buy(msg.sender, amount);
  }

  /// @notice Sells $LOCKS tokens for $HONEY tokens
  /// @param amount Amount of $LOCKS to sell
  /// @param minAmount Minimum amount of $HONEY to receive
  function sell(uint256 amount, uint256 minAmount) external {
    uint256 _supply = supply;
    uint256 _fsl = fsl;
    uint256 _psl = psl;
    (
      uint256 __psl,
      uint256 __fsl,
      uint256 __supply,
      uint256 __saleAmount
    ) = _sellLoop(_psl, _fsl, _supply, amount);
    uint256 tax = (__saleAmount / 1000) * 53;
    if(__saleAmount - tax < minAmount) revert ExcessiveSlippage();
    fsl = __fsl + tax;
    psl = __psl;
    supply = __supply;
    // _floorReduce();
    _burn(msg.sender, amount);
    SafeTransferLib.safeTransfer(honeyAddress, msg.sender, __saleAmount - tax);
    emit Sale(msg.sender, amount);
  }

  /// @notice Redeems $LOCKS tokens for floor value
  /// @param amount Amount of $LOCKS to redeem
  function redeem(uint256 amount) public {
    uint256 _rawTotal = FixedPointMathLib.mulWad(amount, _floorPrice(fsl, supply));
    supply -= amount;
    fsl -= _rawTotal;
    _floorRaise();
    _burn(msg.sender, amount);
    SafeTransferLib.safeTransfer(honeyAddress, msg.sender, _rawTotal);
    emit Redeem(msg.sender, amount);
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      INTERNAL FUNCTIONS                    */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Calculates floor price of $LOCKS
  /// @param _fsl Current fsl
  /// @param _supply Current supply
  /// @return floor $LOCKS floor price
  function _floorPrice(uint256 _fsl, uint256 _supply) internal pure returns (uint256 floor) {
    floor = FixedPointMathLib.divWad(_fsl, _supply);
  }
  
  /// @notice Calculates market price of $LOCKS
  /// @param _fsl Current fsl
  /// @param _psl Current psl
  /// @param _supply Current supply
  /// @return market $LOCKS market price
  function _marketPrice(uint256 _fsl, uint256 _psl, uint256 _supply) internal pure returns (uint256 market) {
    market = FixedPointMathLib.divWad(_fsl, _supply) + FixedPointMathLib.mulWad(FixedPointMathLib.divWad(_psl, _supply), _pow(FixedPointMathLib.divWad(_psl + _fsl, _fsl), 5));
  }

  /// @notice Loops through the amount of $LOCKS tokens to purchase and calculates purchase price
  /// @param _psl Temporary variable for PSL
  /// @param _fsl Temporary variable for FSL
  /// @param _supply Temporary variable for Supply
  /// @param _leftover Temporary variable for amount of $LOCKS tokens to purchase
  /// @return (PSL, FSL, supply and purchase price)
  function _buyLoop(uint256 _psl, uint256 _fsl, uint256 _supply, uint256 _leftover) internal pure returns (uint256, uint256, uint256, uint256) {
    uint256 _market;
    uint256 _floor;
    uint256 _purchasePrice;
    while(_leftover >= 1e18) {
      _market = _marketPrice(_fsl, _psl, _supply);
      _floor = _floorPrice(_fsl, _supply);
      _purchasePrice += _market;
      _supply += 1e18;
      if (_psl * 100 >= _fsl * 50) {
        _fsl += _market;
      }
      else {
        _psl += _market - _floor;
        _fsl += _floor;
      }
      _leftover -= 1e18;
    }
    if (_leftover > 0) {
      _market = _marketPrice(_fsl, _psl, _supply);
      _floor = _floorPrice(_fsl, _supply);
      _purchasePrice += FixedPointMathLib.mulWad(_market, _leftover);
      _supply += _leftover;
      if (_psl * 100 >= _fsl * 50) {
        _fsl += FixedPointMathLib.mulWad(_market, _leftover);
      }
      else {
        _psl += FixedPointMathLib.mulWad((_market - _floor), _leftover);
        _fsl += FixedPointMathLib.mulWad(_floor, _leftover);
      }
    }
    return (_psl, _fsl, _supply, _purchasePrice);
  }

  /// @notice Loops through the amount of $LOCKS tokens to sell and calculates sale amount
  /// @param _psl Temporary variable for PSL
  /// @param _fsl Temporary variable for FSL
  /// @param _supply Temporary variable for Supply
  /// @param _leftover Temporary variable for amount of $LOCKS tokens to sell
  /// @return (PSL, FSL, supply and sale amount)
  function _sellLoop(uint256 _psl, uint256 _fsl, uint256 _supply, uint256 _leftover) internal pure returns (uint256, uint256, uint256, uint256) {
    uint256 _market;
    uint256 _floor;
    uint256 _saleAmount;
    while(_leftover >= 1e18) {
      _market = _marketPrice(_fsl, _psl, _supply);
      _floor = _floorPrice(_fsl, _supply);
      _saleAmount += _market;
      _psl -= _market - _floor;
      _fsl -= _floor;
      _supply -= 1e18;
      _leftover -= 1e18;
    }
    if (_leftover > 0) {
      _market = _marketPrice(_fsl, _psl, _supply);
      _floor = _floorPrice(_fsl, _supply);
      _saleAmount += FixedPointMathLib.mulWad(_market, _leftover);
      _psl -= FixedPointMathLib.mulWad((_market - _floor), _leftover);
      _fsl -= FixedPointMathLib.mulWad(_floor, _leftover); 
      _supply -= _leftover;
    }
    return (_psl, _fsl, _supply, _saleAmount);
  }

  /// @notice Raises x to the power of y, from PRBMath
  /// @param x Base number
  /// @param y Exponent
  /// @return result Calculated value
  function _pow(uint256 x, uint256 y) internal pure returns (uint256 result) {
    result = y & 1 > 0 ? x : 1e18;
    for (y >>= 1; y > 0; y >>= 1) {
      x = FixedPointMathLib.mulWad(x, x);
      if (y & 1 > 0) {
        result = FixedPointMathLib.mulWad(result, x);
      }
    }
  }

  /// @notice If targetRatio is exceeded, raise the FSL 
  function _floorRaise() internal {
    if(FixedPointMathLib.divWad(psl, fsl) >= targetRatio) {
      uint256 raiseAmount = FixedPointMathLib.mulWad(FixedPointMathLib.divWad(psl, fsl), psl / 32);
      psl -= raiseAmount;
      fsl += raiseAmount;
      targetRatio += targetRatio / 50;
      lastFloorRaise = block.timestamp;
    }
  }

  //todo: fix the math here
  /// @notice If a day has elapsed since, reduces the FSL
  function _floorReduce() external returns (uint256) {
    uint256 elapsedRaise = block.timestamp - lastFloorRaise;
    uint256 elapsedDrop = block.timestamp - lastFloorDecrease;
      uint256 decreaseFactor = FixedPointMathLib.divWad(elapsedRaise*1e18, DAYS_SECONDS*1e18);
    if (elapsedRaise >= DAYS_SECONDS && elapsedDrop >= DAYS_SECONDS) {
      // targetRatio -= (targetRatio * decreaseFactor);
      lastFloorDecrease = block.timestamp;
    }
    return FixedPointMathLib.mulWad(targetRatio / 100, 100e18 - decreaseFactor);
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                   PERMISSIONED FUNCTIONS                   */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Transfers $HONEY to user who is borrowing against their locks
  /// @param to Address to transfer $HONEY to
  /// @param amount Amount of $HONEY to transfer
  /// @param fee Fee that is sent to treasury
  function borrowTransfer(address to, uint256 amount, uint256 fee) external onlyBorrow {
    SafeTransferLib.safeTransfer(honeyAddress, to, amount - fee);
    SafeTransferLib.safeTransfer(honeyAddress, adminAddress, fee);
  }

  /// @notice Porridge contract will call this function when users realize $PRG tokens
  /// @param to Recipient of minted $LOCKS tokens
  /// @param amount Amount of minted $LOCKS tokens
  function porridgeMint(address to, uint256 amount) external onlyPorridge {
    _mint(to, amount);
  }

  /// @notice Set address of Porridge contract
  /// @param _porridgeAddress Address of Porridge contract
  function setPorridgeAddress(address _porridgeAddress) external onlyAdmin {
    porridgeAddress = _porridgeAddress;
  }

  /// @notice Set address of Borrow contract
  /// @param _borrowAddress Address of Borrow contract
  function setBorrowAddress(address _borrowAddress) external onlyAdmin {
    borrowAddress = _borrowAddress;
  }

}