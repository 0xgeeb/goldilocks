//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Test.sol";
import { Honey } from "../src/test/Honey.sol";
import { GAMM } from "../src/GAMM.sol";

contract GAMMPriceTest is Test {

  GAMM gamm;
  Honey honey;

  function setUp() public {
    honey = new Honey();
    gamm = new GAMM(address(honey), address(this));
    
    deal(address(honey), address(this), 10000000000000000e18, true);
    honey.approve(address(gamm), type(uint256).max);
  }

  function testStress() public {
    // locks.transferToAMM(1600000e18, 400000e18);
    // vm.store(address(gamm), bytes32(uint256(5)), bytes32(uint256(1000e18)));

    // (uint256 market0, uint256 floor0) = gamm.buy(1e18, type(uint256).max);

    // (uint256 market, uint256 floor) = gamm.buy(12e18, type(uint256).max);
    // console.log('market: ', market, 'floor: ', floor);
    // (uint256 market1, uint256 floor1) = gamm.buy(12e18, type(uint256).max);
    // console.log('market: ', market1, 'floor: ', floor1);
    // (uint256 market5, uint256 floor5) = gamm.buy(50e18, type(uint256).max);
    // console.log('market: ', market5, 'floor: ', floor5);
    // (uint256 market2, uint256 floor2) = gamm.buy(100e18, type(uint256).max);
    // console.log('market: ', market2, 'floor: ', floor2);
    // (uint256 market3, uint256 floor3) = gamm.buy(500e18, type(uint256).max);
    // console.log('market: ', market3, 'floor: ', floor3);
    // (uint256 market4, uint256 floor4) = gamm.buy(1000e18, type(uint256).max);
    // console.log('market: ', market4, 'floor: ', floor4);
      
  }

  function testPurchase1() public {
    // locks.transferToAMM(1600000e18, 400000e18);
    vm.store(address(gamm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
    uint256 bought;
    while (bought < 400) {
      gamm.buy(10e18, type(uint256).max);
      bought += 10;
    }
    uint256 solidityMarketPrice = gamm.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "../testing/amp_tests/purchase_tests/purchase_test1.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }

  function testPurchase2() public {
    // locks.transferToAMM(1600000e18, 400000e18);
    vm.store(address(gamm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
    uint256 bought;
    while(bought < 55e18) {
      gamm.buy(25e17, type(uint256).max);
      bought += 25e17;
    }
    uint256 solidityMarketPrice = gamm.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "../testing/amp_tests/purchase_tests/purchase_test2.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }

  function testPurchase3() public {
    // locks.transferToAMM(1600000e18, 400000e18);
    vm.store(address(gamm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
    uint256 bought;
    while(bought < 8000) {
      gamm.buy(40e18, type(uint256).max);
      bought += 40;
    }
    uint256 solidityMarketPrice = gamm.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "../testing/amp_tests/purchase_tests/purchase_test3.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }

  function testPurchase4() public {
    // locks.transferToAMM(8700000e18, 1900000e18);
    vm.store(address(gamm), bytes32(uint256(5)), bytes32(uint256(2364e18)));
    uint256 bought;
    while(bought < 8000) {
      gamm.buy(40e18, type(uint256).max);
      bought += 40;
    }
    uint256 solidityMarketPrice = gamm.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "../testing/amp_tests/purchase_tests/purchase_test4.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }
  
  function testMixed1() public {
    // locks.transferToAMM(1600000e18, 400000e18);
    vm.store(address(gamm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
    gamm.buy(38e18, type(uint256).max);
    gamm.sell(45e18, 0);
    gamm.sell(30e18, 0);
    gamm.buy(10e18, type(uint256).max);
    gamm.sell(20e18, 0);
    gamm.sell(10e18, 0);
    gamm.buy(15e18, type(uint256).max);
    gamm.sell(10e18, 0);
    gamm.sell(12e18, 0);
    gamm.buy(45e18, type(uint256).max);
    gamm.buy(8e18, type(uint256).max);
    gamm.sell(8e18, 0);
    gamm.buy(45e18, type(uint256).max);
    gamm.buy(45e18, type(uint256).max);
    gamm.buy(45e18, type(uint256).max);
    gamm.sell(25e18, 0);
    gamm.buy(45e18, type(uint256).max);
    gamm.buy(45e18, type(uint256).max);
    gamm.buy(12e18, type(uint256).max);
    gamm.sell(48e18, 0);
    uint256 solidityMarketPrice = gamm.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "../testing/amp_tests/mixed_tests/mixed_test1.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);    
  }

  function testMixed2() public {
    // locks.transferToAMM(1600000e18, 400000e18);
    vm.store(address(gamm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
    gamm.buy(65e17, type(uint256).max);
    gamm.redeem(71e17);
    gamm.buy(32e17, type(uint256).max);
    gamm.redeem(29e17);
    gamm.buy(5e18, type(uint256).max);
    gamm.sell(31e17, 0);
    gamm.buy(28e17, type(uint256).max);
    gamm.sell(6e18, 0);
    gamm.redeem(32e17);
    gamm.buy(4e18, type(uint256).max);
    gamm.buy(10e18, type(uint256).max);
    uint256 solidityMarketPrice = gamm.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "../testing/amp_tests/mixed_tests/mixed_test2.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }

  function testMixed3() public {
    // locks.transferToAMM(973000e18, 360000e18);
    vm.store(address(gamm), bytes32(uint256(5)), bytes32(uint256(6780e18)));
    gamm.buy(6523e17, type(uint256).max);
    gamm.redeem(719e17);
    gamm.buy(32e18, type(uint256).max);
    gamm.redeem(298e18);
    gamm.buy(53e18, type(uint256).max);
    gamm.sell(317e17, 0);
    gamm.buy(286e18, type(uint256).max);
    gamm.sell(651e17, 0);
    gamm.redeem(32e18);
    gamm.buy(47e17, type(uint256).max);
    gamm.buy(123e18, type(uint256).max);
    uint256 solidityMarketPrice = gamm.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "../testing/amp_tests/mixed_tests/mixed_test3.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }

  function testRedeem1() public {
    // locks.transferToAMM(1600000e18, 400000e18);
    vm.store(address(gamm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
    uint256 redeemed;
    while(redeemed < 400) {
      gamm.redeem(10e18);
      redeemed += 10;
    }
    uint256 solidityMarketPrice = gamm.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "../testing/amp_tests/redeem_tests/redeem_test1.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }

  function testRedeem2() public {
    // locks.transferToAMM(1600000e18, 400000e18);
    vm.store(address(gamm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
    uint256 redeemed;
    while(redeemed < 50e18) {
      gamm.redeem(25e17);
      redeemed += 25e17;
    }
    uint256 solidityMarketPrice = gamm.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "../testing/amp_tests/redeem_tests/redeem_test2.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }

  function testSale1() public {
    // locks.transferToAMM(1600000e18, 400000e18);
    vm.store(address(gamm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
    uint256 sold;
    while(sold < 900e18) {
      gamm.sell(10e18, 0);
      sold += 10e18;
    }
    uint256 solidityMarketPrice = gamm.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "../testing/amp_tests/sale_tests/sale_test1.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }

  function testSale2() public {
    // locks.transferToAMM(1600000e18, 400000e18);
    vm.store(address(gamm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
    uint256 sold;
    while(sold < 100e18) {
      gamm.sell(25e17, 0);
      sold += 25e17;
    }
    uint256 solidityMarketPrice = gamm.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "../testing/amp_tests/sale_tests/sale_test2.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }

  function testSale3() public {
    // locks.transferToAMM(800000e18, 200000e18);
    vm.store(address(gamm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
    uint256 sold;
    while(sold < 975e18) {
      gamm.sell(25e18, 0);
      sold += 25e18;
    }
    uint256 solidityMarketPrice = gamm.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "../testing/amp_tests/sale_tests/sale_test3.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);
  }

  function testSale4() public {
    // locks.transferToAMM(6300000e18, 3100000e18);
    vm.store(address(gamm), bytes32(uint256(5)), bytes32(uint256(3124e18)));
    uint256 sold;
    while(sold < 2000e18) {
      gamm.sell(285e17, 0);
      sold += 285e17;
    }
    uint256 solidityMarketPrice = gamm.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "../testing/amp_tests/sale_tests/sale_test4.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > solidityMarketPrice);
    assert(pythonMarketPrice - variance < solidityMarketPrice);    
  }

}