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


// todo maybe export this lib to a goldilockslibrary
import { FixedPointMathLib } from "../lib/solady/src/utils/FixedPointMathLib.sol";
import { SafeTransferLib } from "../lib/solady/src/utils/SafeTransferLib.sol";
import { ERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";


/// @title Goldilocks AMM (GAMM)
/// @notice Novel AMM & Facilitator of $LOCKS token 
/// @author geeb
/// @author ampnoob
contract GAMM is ERC20("Locks Token", "LOCKS") {

  using FixedPointMathLib for uint256;


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      STATE VARIABLES                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  //todo clean these up
  IERC20 honey;
  uint256 public fsl = 700000e18;
  uint256 public psl = 200000e18;
  uint256 public targetRatio = 360e15;
  uint256 public supply = 1000e18;
  uint256 public lastFloorRaise;
  uint256 public lastFloorDecrease;
  address public adminAddress;
  address public porridgeAddress;
  address public borrowAddress;
  uint256 internal constant WAD = 1e18;


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                          CONSTRUCTOR                       */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice Constructor of this contract
  /// @param _adminAddress Address of the GoldilocksDAO multisig
  constructor(address _adminAddress) {
    adminAddress = _adminAddress;
    lastFloorRaise = block.timestamp;
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
  /// @param _amount Amount of $LOCKS to buy
  /// @param _maxAmount Maximum amount of $HONEY to spend
  function buy(uint256 _amount, uint256 _maxAmount) external {
    uint256 _supply = supply;
    uint256 _leftover = _amount;
    uint256 _fsl = fsl;
    uint256 _psl = psl;
    uint256 _market;
    uint256 _floor;
    uint256 _purchasePrice;
    while(_leftover >= 1e18) {
      _market = soladyMarketPrice(_fsl, _psl, _supply);
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
      _market = soladyMarketPrice(_fsl, _psl, _supply);
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
    uint256 _tax = (_purchasePrice / 1000) * 3;
    fsl = _fsl + _tax;
    psl = _psl;
    supply = _supply;
    if(_purchasePrice + _tax > _maxAmount) revert ExcessiveSlippage();
    _floorRaise();
    honey.transferFrom(msg.sender, address(this), _purchasePrice + _tax);
    _mint(msg.sender, _amount);
    emit Buy(msg.sender, _amount);
  }

  /// @notice Sells $LOCKS tokens for $HONEY tokens
  /// @param _amount Amount of $LOCKS to sell
  /// @param _minAmount Minimum amount of $HONEY to receive
  function sell(uint256 _amount, uint256 _minAmount) external {
    uint256 _supply = supply;
    uint256 _leftover = _amount;
    uint256 _fsl = fsl;
    uint256 _psl = psl;
    uint256 _saleAmount;
    uint256 _market;
    uint256 _floor;
    while(_leftover >= 1e18) {
      _market = soladyMarketPrice(_fsl, _psl, _supply);
      _floor = _floorPrice(_fsl, _supply);
      _saleAmount += _market;
      _psl -= _market - _floor;
      _fsl -= _floor;
      _supply -= 1e18;
      _leftover -= 1e18;
    }
    if (_leftover > 0) {
      _market = soladyMarketPrice(_fsl, _psl, _supply);
      _floor = _floorPrice(_fsl, _supply);
      _saleAmount += FixedPointMathLib.mulWad(_market, _leftover);
      _psl -= FixedPointMathLib.mulWad((_market - _floor), _leftover);
      _fsl -= FixedPointMathLib.mulWad(_floor, _leftover); 
      _supply -= _leftover;
    }
    uint256 _tax = (_saleAmount / 1000) * 53;
    fsl = _fsl + _tax;
    psl = _psl;
    supply = _supply;
    if(_saleAmount - _tax < _minAmount) revert ExcessiveSlippage();
    _burn(msg.sender, _amount);
    honey.transfer(msg.sender, _saleAmount - _tax);
    emit Sale(msg.sender, _amount);
  }

  /// @notice Redeems $LOCKS tokens for floor value
  /// @param _amount Amount of $LOCKS to redeem
  function redeem(uint256 _amount) public {
    uint256 _rawTotal = (_amount * ((fsl * 1e18) / supply)) / 1e18;
    supply -= _amount;
    fsl -= _rawTotal;
    _floorRaise();
    _burn(msg.sender, _amount);
    honey.transfer(msg.sender, _rawTotal);
    emit Redeem(msg.sender, _amount);
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                      INTERNAL FUNCTIONS                    */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  /// @notice calculates floor price of $LOCKS
  /// @param _fsl Current fsl
  /// @param _supply Current supply
  /// @return $LOCKS floor price
  function _floorPrice(uint256 _fsl, uint256 _supply) internal pure returns (uint256) {
    return FixedPointMathLib.divWad(_fsl, _supply);
  }
  
  /// @notice calculates market price of $LOCKS
  /// @param _fsl Current fsl
  /// @param _psl Current psl
  /// @param _supply Current supply
  /// @return $LOCKS market price
  function _marketPrice(uint256 _fsl, uint256 _psl, uint256 _supply) internal pure returns (uint256) {
   uint256 factor1 = _psl * 1e10 / _supply;
   uint256 factor2 = ((_psl + _fsl) * 1e5) / _fsl;
   uint256 exponential = factor2**5;
   uint256 _floorPriceVariable = _fsl * 1e18 /_supply;
   return _floorPriceVariable + ((factor1 * exponential) / (1e17));
  }

  function soladyMarketPrice(uint256 _fsl, uint256 _psl, uint256 _supply) public pure returns (uint256) {
    uint256 allTogether = FixedPointMathLib.divWad(_fsl, _supply) + FixedPointMathLib.mulWad(FixedPointMathLib.divWad(_psl, _supply), pow(FixedPointMathLib.divWad(_psl + _fsl, _fsl), 5));
    return allTogether;
  }

  /// @notice If necessary, raises the target ratio 
  function _floorRaise() internal {
    if((psl * (1e18)) / fsl >= targetRatio) {
      uint256 _raiseAmount = (((psl * 1e18) / fsl) * (psl / 32)) / (1e18);
      psl -= _raiseAmount;
      fsl += _raiseAmount;
      targetRatio += targetRatio / 50;
      lastFloorRaise = block.timestamp;
    }
  }

  /// @notice If necessary, reduces the target ratio
  function _floorReduce() internal {
    uint256 _elapsedRaise = block.timestamp - lastFloorRaise;
    uint256 _elapsedDrop = block.timestamp - lastFloorDecrease;
    if (_elapsedRaise >= 86400 && _elapsedDrop >= 86400) {
      uint256 _decreaseFactor = _elapsedRaise / 86400;
      targetRatio -= (targetRatio * _decreaseFactor);
      lastFloorDecrease = block.timestamp;
    }
  }

  function _spendAllowance(address owner, address spender, uint256 amount) internal override {
    uint256 currentAllowance = allowance(owner, spender);
    if (currentAllowance != type(uint256).max) {
      require(currentAllowance >= amount, "ERC20: insufficient allowance");
      unchecked {
        _approve(owner, spender, currentAllowance - amount);
      }
    }
  }


  /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
  /*                   PERMISSIONED FUNCTIONS                   */
  /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


  function borrowTransfer(address to, uint256 amount) external onlyBorrow {
    // SafeTransferLib.safeTransfer(honeyAddress, to, amount);
  }


  /// @notice Porridge Contract will call this function when users realize $PRG tokens
  /// @param _to Recipient of minted $LOCKS tokens
  /// @param _amount Amount of minted $LOCKS tokens
  function porridgeMint(address _to, uint256 _amount) external onlyPorridge {
    _mint(_to, _amount);
  }

  /// @notice Sets address of $HONEY
  /// @param _honeyAddress Addresss of $HONEY
  function setHoneyAddress(address _honeyAddress) external onlyAdmin {
    honey = IERC20(_honeyAddress);
  }

  /// @notice Set address of Porridge contract
  /// @param _porridgeAddress Address of Porridge contract
  function setPorridgeAddress(address _porridgeAddress) external onlyAdmin {
    porridgeAddress = _porridgeAddress;
  }

  /// @notice Allows the Borrow contract to transfer this contract's $HONEY
  /// @param _borrowAddress Address of the Borrow contract
  function approveBorrowForHoney(address _borrowAddress) external onlyAdmin {
    honey.approve(_borrowAddress, 10000000e18);
  }

  function pow(uint256 x, uint256 y) internal pure returns (uint256 result) {
    result = y & 1 > 0 ? x : 1e18;
    for (y >>= 1; y > 0; y >>= 1) {
      x = FixedPointMathLib.mulWad(x, x);
      if (y & 1 > 0) {
        result = FixedPointMathLib.mulWad(result, x);
      }
    }
  }

}