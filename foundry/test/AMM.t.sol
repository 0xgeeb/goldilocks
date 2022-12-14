//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Test.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "../src/AMM.sol";
import "../src/Locks.sol";

contract AMMTest is Test {

  AMM amm;
  Locks locks;
  IERC20 honey;

  function setUp() public {
    locks = new Locks(address(this));
    amm = new AMM(address(locks), address(this));
    honey = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);
    deal(address(honey), address(this), 1000000e18, true);
    deal(address(locks), address(this), 1000000e18, true);
    deal(address(honey), address(locks), 1000000e18, true);
    locks.setAmmAddress(address(amm));
  }

  function testPurchase1() public {
    locks.transferToAMM(1600000e18, 400000e18);
    vm.store(address(amm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
    uint256 bought;
    while (bought < 400) {
      amm.buy(10e18);
      bought += 10;
    }
    uint256 solidityMarketPrice = amm._marketPrice(amm.fsl(), amm.psl(), amm.supply());
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
    locks.transferToAMM(1600000e18, 400000e18);
    vm.store(address(amm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
    uint256 bought;
    while(bought < 55e18) {
      amm.buy(25e17);
      bought += 25e17;
    }
    uint256 solidityMarketPrice = amm._marketPrice(amm.fsl(), amm.psl(), amm.supply());
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
    locks.transferToAMM(1600000e18, 400000e18);
    vm.store(address(amm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
    uint256 bought;
    while(bought < 8000) {
      amm.buy(40e18);
      bought += 40;
    }
    uint256 solidityMarketPrice = amm._marketPrice(amm.fsl(), amm.psl(), amm.supply());
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
    locks.transferToAMM(8700000e18, 1900000e18);
    vm.store(address(amm), bytes32(uint256(5)), bytes32(uint256(2364e18)));
    uint256 bought;
    while(bought < 8000) {
      amm.buy(40e18);
      bought += 40;
    }
    uint256 solidityMarketPrice = amm._marketPrice(amm.fsl(), amm.psl(), amm.supply());
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
    locks.transferToAMM(1600000e18, 400000e18);
    vm.store(address(amm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
    amm.buy(38e18);
    amm.sell(45e18);
    amm.sell(30e18);
    amm.buy(10e18);
    amm.sell(20e18);
    amm.sell(10e18);
    amm.buy(15e18);
    amm.sell(10e18);
    amm.sell(12e18);
    amm.buy(45e18);
    amm.buy(8e18);
    amm.sell(8e18);
    amm.buy(45e18);
    amm.buy(45e18);
    amm.buy(45e18);
    amm.sell(25e18);
    amm.buy(45e18);
    amm.buy(45e18);
    amm.buy(12e18);
    amm.sell(48e18);
    uint256 solidityMarketPrice = amm._marketPrice(amm.fsl(), amm.psl(), amm.supply());
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
    locks.transferToAMM(1600000e18, 400000e18);
    vm.store(address(amm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
    amm.buy(65e17);
    amm.redeem(71e17);
    amm.buy(32e17);
    amm.redeem(29e17);
    amm.buy(5e18);
    amm.sell(31e17);
    amm.buy(28e17);
    amm.sell(6e18);
    amm.redeem(32e17);
    amm.buy(4e18);
    amm.buy(10e18);
    uint256 solidityMarketPrice = amm._marketPrice(amm.fsl(), amm.psl(), amm.supply());
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
    locks.transferToAMM(973000e18, 360000e18);
    vm.store(address(amm), bytes32(uint256(5)), bytes32(uint256(6780e18)));
    amm.buy(6523e17);
    amm.redeem(719e17);
    amm.buy(32e18);
    amm.redeem(298e18);
    amm.buy(53e18);
    amm.sell(317e17);
    amm.buy(286e18);
    amm.sell(651e17);
    amm.redeem(32e18);
    amm.buy(47e17);
    amm.buy(123e18);
    uint256 solidityMarketPrice = amm._marketPrice(amm.fsl(), amm.psl(), amm.supply());
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
    locks.transferToAMM(1600000e18, 400000e18);
    vm.store(address(amm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
    uint256 redeemed;
    while(redeemed < 400) {
      amm.redeem(10e18);
      redeemed += 10;
    }
    uint256 solidityMarketPrice = amm._marketPrice(amm.fsl(), amm.psl(), amm.supply());
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
    locks.transferToAMM(1600000e18, 400000e18);
    vm.store(address(amm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
    uint256 redeemed;
    while(redeemed < 50e18) {
      amm.redeem(25e17);
      redeemed += 25e17;
    }
    uint256 solidityMarketPrice = amm._marketPrice(amm.fsl(), amm.psl(), amm.supply());
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
    locks.transferToAMM(1600000e18, 400000e18);
    vm.store(address(amm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
    uint256 sold;
    while(sold < 900e18) {
      amm.sell(10e18);
      sold += 10e18;
    }
    uint256 solidityMarketPrice = amm._marketPrice(amm.fsl(), amm.psl(), amm.supply());
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
    locks.transferToAMM(1600000e18, 400000e18);
    vm.store(address(amm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
    uint256 sold;
    while(sold < 100e18) {
      amm.sell(25e17);
      sold += 25e17;
    }
    uint256 solidityMarketPrice = amm._marketPrice(amm.fsl(), amm.psl(), amm.supply());
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
    locks.transferToAMM(800000e18, 200000e18);
    vm.store(address(amm), bytes32(uint256(5)), bytes32(uint256(1000e18)));
    uint256 sold;
    while(sold < 975e18) {
      amm.sell(25e18);
      sold += 25e18;
    }
    uint256 solidityMarketPrice = amm._marketPrice(amm.fsl(), amm.psl(), amm.supply());
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
    locks.transferToAMM(6300000e18, 3100000e18);
    vm.store(address(amm), bytes32(uint256(5)), bytes32(uint256(3124e18)));
    uint256 sold;
    while(sold < 2000e18) {
      amm.sell(285e17);
      sold += 285e17;
    }
    uint256 solidityMarketPrice = amm._marketPrice(amm.fsl(), amm.psl(), amm.supply());
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