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

  function soladyMarketPrice() external view returns (uint256) {
    uint256 _floorPriceHere = _divWad(fsl, supply);
    uint256 firstSecondHalf = _divWad(psl, supply);
    uint256 secondSecondHalf = _divWad(psl + fsl, fsl);
    uint256 sshPow = secondSecondHalf / 1000;
    sshPow = sshPow**3;
    sshPow = sshPow * 1000;
    return sshPow;
    // uint256 allTogether = _floorPriceHere + (firstSecondHalf * sshPow);
    // return allTogether;
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
    assembly {
      if iszero(mul(y, iszero(mul(WAD, gt(x, div(not(0), WAD)))))) {
        mstore(0x00, 0x7c5f487d)
        revert(0x1c, 0x04)
      }
      z := div(mul(x, WAD), y)
    }
  }

  function _powWad(int256 x, int256 y) internal pure returns (int256) {
    // Using `ln(x)` means `x` must be greater than 0.
    return expWad((lnWad(x) * y) / int256(WAD));
  }

  function expWad(int256 x) internal pure returns (int256 r) {
    unchecked {
      // When the result is < 0.5 we return zero. This happens when
      // x <= floor(log(0.5e18) * 1e18) ~ -42e18
      if (x <= -42139678854452767551) return r;

      /// @solidity memory-safe-assembly
      assembly {
        // When the result is > (2**255 - 1) / 1e18 we can not represent it as an
        // int. This happens when x >= floor(log((2**255 - 1) / 1e18) * 1e18) ~ 135.
        if iszero(slt(x, 135305999368893231589)) {
          // Store the function selector of `ExpOverflow()`.
          mstore(0x00, 0xa37bfec9)
          // Revert with (offset, size).
          revert(0x1c, 0x04)
        }
      }

      // x is now in the range (-42, 136) * 1e18. Convert to (-42, 136) * 2**96
      // for more intermediate precision and a binary basis. This base conversion
      // is a multiplication by 1e18 / 2**96 = 5**18 / 2**78.
      x = (x << 78) / 5 ** 18;

      // Reduce range of x to (-½ ln 2, ½ ln 2) * 2**96 by factoring out powers
      // of two such that exp(x) = exp(x') * 2**k, where k is an integer.
      // Solving this gives k = round(x / log(2)) and x' = x - k * log(2).
      int256 k = ((x << 96) / 54916777467707473351141471128 + 2 ** 95) >> 96;
      x = x - k * 54916777467707473351141471128;

      // k is in the range [-61, 195].

      // Evaluate using a (6, 7)-term rational approximation.
      // p is made monic, we'll multiply by a scale factor later.
      int256 y = x + 1346386616545796478920950773328;
      y = ((y * x) >> 96) + 57155421227552351082224309758442;
      int256 p = y + x - 94201549194550492254356042504812;
      p = ((p * y) >> 96) + 28719021644029726153956944680412240;
      p = p * x + (4385272521454847904659076985693276 << 96);

      // We leave p in 2**192 basis so we don't need to scale it back up for the division.
      int256 q = x - 2855989394907223263936484059900;
      q = ((q * x) >> 96) + 50020603652535783019961831881945;
      q = ((q * x) >> 96) - 533845033583426703283633433725380;
      q = ((q * x) >> 96) + 3604857256930695427073651918091429;
      q = ((q * x) >> 96) - 14423608567350463180887372962807573;
      q = ((q * x) >> 96) + 26449188498355588339934803723976023;

      /// @solidity memory-safe-assembly
      assembly {
        // Div in assembly because solidity adds a zero check despite the unchecked.
        // The q polynomial won't have zeros in the domain as all its roots are complex.
        // No scaling is necessary because p is already 2**96 too large.
        r := sdiv(p, q)
      }

      // r should be in the range (0.09, 0.25) * 2**96.

      // We now need to multiply r by:
      // * the scale factor s = ~6.031367120.
      // * the 2**k factor from the range reduction.
      // * the 1e18 / 2**96 factor for base conversion.
      // We do this all at once, with an intermediate result in 2**213
      // basis, so the final right shift is always by a positive amount.
      r = int256(
        (uint256(r) * 3822833074963236453042738258902158003155416615667) >> uint256(195 - k)
      );
    }
  }

  function lnWad(int256 x) internal pure returns (int256 r) {
    unchecked {
      /// @solidity memory-safe-assembly
      assembly {
        if iszero(sgt(x, 0)) {
          // Store the function selector of `LnWadUndefined()`.
          mstore(0x00, 0x1615e638)
          // Revert with (offset, size).
          revert(0x1c, 0x04)
        }
      }

      // We want to convert x from 10**18 fixed point to 2**96 fixed point.
      // We do this by multiplying by 2**96 / 10**18. But since
      // ln(x * C) = ln(x) + ln(C), we can simply do nothing here
      // and add ln(2**96 / 10**18) at the end.

      // Compute k = log2(x) - 96.
      int256 k;
      /// @solidity memory-safe-assembly
      assembly {
        let v := x
        k := shl(7, lt(0xffffffffffffffffffffffffffffffff, v))
        k := or(k, shl(6, lt(0xffffffffffffffff, shr(k, v))))
        k := or(k, shl(5, lt(0xffffffff, shr(k, v))))

        // For the remaining 32 bits, use a De Bruijn lookup.
        // See: https://graphics.stanford.edu/~seander/bithacks.html
        v := shr(k, v)
        v := or(v, shr(1, v))
        v := or(v, shr(2, v))
        v := or(v, shr(4, v))
        v := or(v, shr(8, v))
        v := or(v, shr(16, v))

        // forgefmt: disable-next-item
        k := sub(or(k, byte(shr(251, mul(v, shl(224, 0x07c4acdd))),
          0x0009010a0d15021d0b0e10121619031e080c141c0f111807131b17061a05041f)), 96)
      }

      // Reduce range of x to (1, 2) * 2**96
      // ln(2^k * x) = k * ln(2) + ln(x)
      x <<= uint256(159 - k);
      x = int256(uint256(x) >> 159);

      // Evaluate using a (8, 8)-term rational approximation.
      // p is made monic, we will multiply by a scale factor later.
      int256 p = x + 3273285459638523848632254066296;
      p = ((p * x) >> 96) + 24828157081833163892658089445524;
      p = ((p * x) >> 96) + 43456485725739037958740375743393;
      p = ((p * x) >> 96) - 11111509109440967052023855526967;
      p = ((p * x) >> 96) - 45023709667254063763336534515857;
      p = ((p * x) >> 96) - 14706773417378608786704636184526;
      p = p * x - (795164235651350426258249787498 << 96);

      // We leave p in 2**192 basis so we don't need to scale it back up for the division.
      // q is monic by convention.
      int256 q = x + 5573035233440673466300451813936;
      q = ((q * x) >> 96) + 71694874799317883764090561454958;
      q = ((q * x) >> 96) + 283447036172924575727196451306956;
      q = ((q * x) >> 96) + 401686690394027663651624208769553;
      q = ((q * x) >> 96) + 204048457590392012362485061816622;
      q = ((q * x) >> 96) + 31853899698501571402653359427138;
      q = ((q * x) >> 96) + 909429971244387300277376558375;
      /// @solidity memory-safe-assembly
      assembly {
      // Div in assembly because solidity adds a zero check despite the unchecked.
      // The q polynomial is known not to have zeros in the domain.
      // No scaling required because p is already 2**96 too large.
        r := sdiv(p, q)
      }

      // r is in the range (0, 0.125) * 2**96

      // Finalization, we need to:
      // * multiply by the scale factor s = 5.549…
      // * add ln(2**96 / 10**18)
      // * add k * ln(2)
      // * multiply by 10**18 / 2**96 = 5**18 >> 78

      // mul s * 5e18 * 2**96, base is now 5**18 * 2**192
      r *= 1677202110996718588342820967067443963516166;
      // add ln(2) * k * 5e18 * 2**192
      r += 16597577552685614221487285958193947469193820559219878177908093499208371 * k;
      // add ln(2**96 / 10**18) * 5e18 * 2**192
      r += 600920179829731861736702779321621459595472258049074101567377883020018308;
      // base conversion: mul 2**18 / 2**192
      r >>= 174;
    }
  }

}