//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { FixedPointMathLib } from "../lib/solady/src/utils/FixedPointMathLib.sol";
import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { ILocks } from "./interfaces/ILocks.sol";


/// @title AMM
/// @author @0xgeeb
/// @author @kingkongshearer
/// @dev Goldilocks AMM
contract AMM {

  using FixedPointMathLib for uint256;

  IERC20 honey;
  ILocks ilocks;
  
  uint256 public fsl = 700000e18;
  uint256 public psl = 200000e18;
  uint256 public targetRatio = 360e15;
  uint256 public supply = 1000e18;
  uint256 public lastFloorRaise;
  uint256 public lastFloorDecrease;
  address public adminAddress;
  address public locksAddress;
  uint256 internal constant WAD = 1e18;

  constructor(address _locksAddress, address _adminAddress) {
    ilocks = ILocks(_locksAddress);
    adminAddress = _adminAddress;
    locksAddress = _locksAddress;
    lastFloorRaise = block.timestamp;
  }

  error MulWadFailed();
  error DivWadFailed();

  event Buy(address indexed user, uint256 amount);
  event Sale(address indexed user, uint256 amount);
  event Redeem(address indexed user, uint256 amount);

  modifier onlyAdmin() {
    require(msg.sender == adminAddress, "not admin");
    _;
  }

  modifier onlyLocks() {
    require(msg.sender == locksAddress, "not locks");
    _;
  }

  function floorPrice() external view returns (uint256) {
    return _floorPrice(fsl, supply);
  }

  function marketPrice() external view returns (uint256) {
    return _marketPrice(fsl, psl, supply);
  }

  function initialize(uint256 _fsl, uint256 _psl) external onlyLocks {
    fsl = _fsl;
    psl = _psl;
  }

  /// @dev calculates price of and mints $LOCKS tokens
  function buy(uint256 _amount, uint256 _maxAmount) public returns (uint256, uint256) {
    uint256 _supply = supply;
    // require(_amount <= _supply / 20, "price impact too large");
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
      _purchasePrice += _mulWad(_market, _leftover);
      _supply += _leftover;
      if (_psl * 100 >= _fsl * 50) {
        _fsl += _mulWad(_market, _leftover);
      }
      else {
        _psl += _mulWad((_market - _floor), _leftover);
        _fsl += _mulWad(_floor, _leftover);
      }
    }
    uint256 _tax = (_purchasePrice / 1000) * 3;
    fsl = _fsl + _tax;
    psl = _psl;
    supply = _supply;
    require(_purchasePrice + _tax <= _maxAmount, "too much slippage");
    honey.transferFrom(msg.sender, address(this), _purchasePrice + _tax);
    ilocks.ammMint(msg.sender, _amount);
    _floorRaise();
    emit Buy(msg.sender, _amount);
    return (_marketPrice(_fsl + _tax, _psl, _supply), _floorPrice(_fsl + _tax, _supply));
  }

  /// @dev calculates price of and burns $LOCKS tokens
  function sell(uint256 _amount, uint256 _minAmount) public returns (uint256, uint256) {
    uint256 _supply = supply;
    // require(_amount <= _supply / 20, "price impact too large");
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
      _saleAmount += _mulWad(_market, _leftover);
      _psl -= _mulWad((_market - _floor), _leftover);
      _fsl -= _mulWad(_floor, _leftover); 
      _supply -= _leftover;
    }
    uint256 _tax = (_saleAmount / 1000) * 53;
    require(_saleAmount - _tax >= _minAmount, "too much slippage");
    honey.transfer(msg.sender, _saleAmount - _tax);
    ilocks.ammBurn(msg.sender, _amount);
    fsl = _fsl + _tax;
    psl = _psl;
    supply = _supply;
    emit Sale(msg.sender, _amount);
    return (_marketPrice(fsl, psl, supply), _floorPrice(fsl, supply));
  }

  /// @dev burns $LOCKS tokens to receive floor value
  function redeem(uint256 _amount) public {
    require(_amount > 0, "cannot redeem zero");
    require(IERC20(locksAddress).balanceOf(msg.sender) >= _amount, "insufficient balance");
    uint256 _rawTotal = (_amount * ((fsl * 1e18) / supply)) / 1e18;
    supply -= _amount;
    fsl -= _rawTotal;
    ilocks.ammBurn(msg.sender, _amount);
    honey.transfer(msg.sender, _rawTotal);
    _floorRaise();
    emit Redeem(msg.sender, _amount);
  }

  /// @dev calculates floor price of $LOCKS
  function _floorPrice(uint256 _fsl, uint256 _supply) internal pure returns (uint256) {
    return _divWad(_fsl, _supply);
  }
  
  /// @dev calculates market price of $LOCKS
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
  

  /// @dev if necessary, raises the target ratio 
  function _floorRaise() internal {
    if((psl * (1e18)) / fsl >= targetRatio) {
      uint256 _raiseAmount = (((psl * 1e18) / fsl) * (psl / 32)) / (1e18);
      psl -= _raiseAmount;
      fsl += _raiseAmount;
      targetRatio += targetRatio / 50;
      lastFloorRaise = block.timestamp;
    }
  }

  function _lowerThreshold() internal {
    uint256 _elapsedRaise = block.timestamp - lastFloorRaise;
    uint256 _elapsedDrop = block.timestamp - lastFloorDecrease;
    if (_elapsedRaise >= 86400 && _elapsedDrop >= 86400) {
      uint256 _decreaseFactor = _elapsedRaise / 86400;
      targetRatio -= (targetRatio * _decreaseFactor);
      lastFloorDecrease = block.timestamp;
    }
  }

  function setHoneyAddress(address _honeyAddress) external onlyAdmin {
    honey = IERC20(_honeyAddress);
  }

  function approveBorrowForHoney(address _borrowAddress) external onlyAdmin {
    honey.approve(_borrowAddress, 10000000e18);
  }

  function _mulWad(uint256 x, uint256 y) internal pure returns (uint256 z) {
    assembly {
      if mul(y, gt(x, div(not(0), y))) {            
        mstore(0x00, 0xbac65e5b)
        revert(0x1c, 0x04)
      }
      z := div(mul(x, y), WAD)
    }
  }

  function _divWad(uint256 x, uint256 y) internal pure returns (uint256 z) {
    /// @solidity memory-safe-assembly
    assembly {
      // Equivalent to `require(y != 0 && (WAD == 0 || x <= type(uint256).max / WAD))`.
      if iszero(mul(y, iszero(mul(WAD, gt(x, div(not(0), WAD)))))) {
        // Store the function selector of `DivWadFailed()`.
        mstore(0x00, 0x7c5f487d)
        // Revert with (offset, size).
        revert(0x1c, 0x04)
      }
      z := div(mul(x, WAD), y)
    }
  }

  function pow(uint256 x, uint256 y) internal pure returns (uint256 result) {
    // Calculate the first iteration of the loop in advance.
    result = y & 1 > 0 ? x : 1e18;

    // Equivalent to "for(y /= 2; y > 0; y /= 2)" but faster.
    for (y >>= 1; y > 0; y >>= 1) {
      x = _mulWad(x, x);

      // Equivalent to "y % 2 == 1" but faster.
      if (y & 1 > 0) {
        result = _mulWad(result, x);
      }
    }
  }

}