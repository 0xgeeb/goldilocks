//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Test.sol";
import { LibRLP } from "../../lib/solady/src/utils/LibRLP.sol";
import { Honey } from "../../src/mock/Honey.sol";
import { Goldiswap } from "../../src/core/Goldiswap.sol";
import { Borrow } from "../../src/core/Borrow.sol";
import { Porridge } from "../../src/core/Porridge.sol";
import { Goldilend } from "../../src/core/Goldilend.sol";

contract GAMMPriceTest is Test {

  using LibRLP for address;

  Honey honey;
  Goldiswap goldiswap;
  Borrow borrow;
  Porridge porridge;

  function setUp() public {
    Porridge porridgeComputed = Porridge(address(this).computeAddress(4));
    Borrow borrowComputed = Borrow(address(this).computeAddress(3));
    Goldilend goldilendComputed = Goldilend(address(this).computeAddress(11));
    honey = new Honey();
    goldiswap = new Goldiswap(address(this), address(porridgeComputed), address(borrowComputed), address(honey));
    borrow = new Borrow(address(goldiswap), address(porridgeComputed), address(honey));
    porridge = new Porridge(address(goldiswap), address(borrow), address(goldilendComputed), address(honey));
  }

  modifier dealandApproveUserHoney() {
    deal(address(honey), address(this), type(uint256).max / 2);
    honey.approve(address(goldiswap), type(uint256).max);
    _;
  }

  modifier dealUserLocks() {
    deal(address(goldiswap), address(this), type(uint256).max / 2);
    _;
  }

  modifier dealGammHoney() {
    deal(address(honey), address(goldiswap), type(uint256).max / 2);
    _;
  }

  function testPurchase1() public dealandApproveUserHoney {
    uint256 bought;
    while (bought < 400) {
      goldiswap.buy(10e18, type(uint256).max);
      bought += 10;
    }
    uint256 solidityMarketPrice = goldiswap.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "price_tests/purchase_tests/purchase_test1.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }

  function testPurchase2() public dealandApproveUserHoney {
    uint256 bought;
    while(bought < 55e18) {
      goldiswap.buy(25e17, type(uint256).max);
      bought += 25e17;
    }
    uint256 solidityMarketPrice = goldiswap.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "price_tests/purchase_tests/purchase_test2.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }

  function testPurchase3() public dealandApproveUserHoney {
    uint256 bought;
    while(bought < 8000) {
      goldiswap.buy(40e18, type(uint256).max);
      bought += 40;
    }
    uint256 solidityMarketPrice = goldiswap.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "price_tests/purchase_tests/purchase_test3.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }

  function testPurchase4() public dealandApproveUserHoney {
    vm.store(address(goldiswap), bytes32(uint256(0)), bytes32(uint256(8700000e18)));
    vm.store(address(goldiswap), bytes32(uint256(1)), bytes32(uint256(1900000e18)));
    vm.store(address(goldiswap), bytes32(uint256(2)), bytes32(uint256(2364e18)));
    uint256 bought;
    while(bought < 8000) {
      goldiswap.buy(40e18, type(uint256).max);
      bought += 40;
    }
    uint256 solidityMarketPrice = goldiswap.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "price_tests/purchase_tests/purchase_test4.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }

  function testMixed1() public dealandApproveUserHoney dealUserLocks dealGammHoney {
    vm.store(address(goldiswap), bytes32(uint256(0x05345cdf77eb68f44c)), bytes32(uint256(100e18)));
    goldiswap.buy(38e18, type(uint256).max);
    goldiswap.sell(45e18, 0);
    goldiswap.sell(30e18, 0);
    goldiswap.buy(10e18, type(uint256).max);
    goldiswap.sell(20e18, 0);
    goldiswap.sell(10e18, 0);
    goldiswap.buy(15e18, type(uint256).max);
    goldiswap.sell(10e18, 0);
    goldiswap.sell(12e18, 0);
    goldiswap.buy(45e18, type(uint256).max);
    goldiswap.buy(8e18, type(uint256).max);
    goldiswap.sell(8e18, 0);
    goldiswap.buy(45e18, type(uint256).max);
    goldiswap.buy(45e18, type(uint256).max);
    goldiswap.buy(45e18, type(uint256).max);
    goldiswap.sell(25e18, 0);
    goldiswap.buy(45e18, type(uint256).max);
    goldiswap.buy(45e18, type(uint256).max);
    goldiswap.buy(12e18, type(uint256).max);
    goldiswap.sell(48e18, 0);
    uint256 solidityMarketPrice = goldiswap.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "price_tests/mixed_tests/mixed_test1.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);    
  }

  function testMixed2() public dealandApproveUserHoney dealUserLocks dealGammHoney {
    vm.store(address(goldiswap), bytes32(uint256(0x05345cdf77eb68f44c)), bytes32(uint256(100e18)));
    goldiswap.buy(65e17, type(uint256).max);
    goldiswap.redeem(71e17);
    goldiswap.buy(32e17, type(uint256).max);
    goldiswap.redeem(29e17);
    goldiswap.buy(5e18, type(uint256).max);
    goldiswap.sell(31e17, 0);
    goldiswap.buy(28e17, type(uint256).max);
    goldiswap.sell(6e18, 0);
    goldiswap.redeem(32e17);
    goldiswap.buy(4e18, type(uint256).max);
    goldiswap.buy(10e18, type(uint256).max);
    uint256 solidityMarketPrice = goldiswap.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "price_tests/mixed_tests/mixed_test2.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }

  function testMixed3() public dealandApproveUserHoney dealUserLocks dealGammHoney {
    vm.store(address(goldiswap), bytes32(uint256(0x05345cdf77eb68f44c)), bytes32(uint256(100e18)));
    vm.store(address(goldiswap), bytes32(uint256(0)), bytes32(uint256(973000e18)));
    vm.store(address(goldiswap), bytes32(uint256(1)), bytes32(uint256(360000e18)));
    vm.store(address(goldiswap), bytes32(uint256(2)), bytes32(uint256(6780e18)));
    goldiswap.buy(6523e17, type(uint256).max);
    goldiswap.redeem(719e17);
    goldiswap.buy(32e18, type(uint256).max);
    goldiswap.redeem(298e18);
    goldiswap.buy(53e18, type(uint256).max);
    goldiswap.sell(317e17, 0);
    goldiswap.buy(286e18, type(uint256).max);
    goldiswap.sell(651e17, 0);
    goldiswap.redeem(32e18);
    goldiswap.buy(47e17, type(uint256).max);
    goldiswap.buy(123e18, type(uint256).max);
    uint256 solidityMarketPrice = goldiswap.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "price_tests/mixed_tests/mixed_test3.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }

  function testRedeem1() public dealUserLocks dealGammHoney {
    vm.store(address(goldiswap), bytes32(uint256(2)), bytes32(uint256(5000e18)));
    uint256 redeemed;
    while(redeemed < 400) {
      goldiswap.redeem(10e18);
      redeemed += 10;
    }
    uint256 solidityMarketPrice = goldiswap.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "price_tests/redeem_tests/redeem_test1.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }

  function testRedeem2() public dealUserLocks dealGammHoney {
    vm.store(address(goldiswap), bytes32(uint256(2)), bytes32(uint256(5000e18)));
    uint256 redeemed;
    while(redeemed < 50e18) {
      goldiswap.redeem(25e17);
      redeemed += 25e17;
    }
    uint256 solidityMarketPrice = goldiswap.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "price_tests/redeem_tests/redeem_test2.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }

  function testSale1() public dealUserLocks dealGammHoney {
    vm.store(address(goldiswap), bytes32(uint256(2)), bytes32(uint256(5000e18)));
    uint256 sold;
    while(sold < 900e18) {
      goldiswap.sell(10e18, 0);
      sold += 10e18;
    }
    uint256 solidityMarketPrice = goldiswap.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "price_tests/sale_tests/sale_test1.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }

  function testSale2() public dealUserLocks dealGammHoney {
    vm.store(address(goldiswap), bytes32(uint256(2)), bytes32(uint256(5000e18)));
    uint256 sold;
    while(sold < 100e18) {
      goldiswap.sell(25e17, 0);
      sold += 25e17;
    }
    uint256 solidityMarketPrice = goldiswap.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "price_tests/sale_tests/sale_test2.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }

  function testSale3() public dealUserLocks dealGammHoney {
    vm.store(address(goldiswap), bytes32(uint256(2)), bytes32(uint256(25000e18)));
    vm.store(address(goldiswap), bytes32(uint256(0)), bytes32(uint256(800000e18)));
    vm.store(address(goldiswap), bytes32(uint256(1)), bytes32(uint256(200000e18)));
    vm.store(address(goldiswap), bytes32(uint256(2)), bytes32(uint256(1000e18)));
    uint256 sold;
    while(sold < 975e18) {
      goldiswap.sell(25e18, 0);
      sold += 25e18;
    }
    uint256 solidityMarketPrice = goldiswap.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "price_tests/sale_tests/sale_test3.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }

  function testSale4() public dealUserLocks dealGammHoney {
    vm.store(address(goldiswap), bytes32(uint256(2)), bytes32(uint256(25000e18)));
    vm.store(address(goldiswap), bytes32(uint256(0)), bytes32(uint256(6300000e18)));
    vm.store(address(goldiswap), bytes32(uint256(1)), bytes32(uint256(3100000e18)));
    vm.store(address(goldiswap), bytes32(uint256(2)), bytes32(uint256(3124e18)));
    uint256 sold;
    while(sold < 2000e18) {
      goldiswap.sell(285e17, 0);
      sold += 285e17;
    }
    uint256 solidityMarketPrice = goldiswap.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "price_tests/sale_tests/sale_test4.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);    
  }

}