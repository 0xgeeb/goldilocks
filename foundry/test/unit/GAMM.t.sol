//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Test.sol";
import { Honey } from "../src/mock/Honey.sol";
import { GAMM } from "../src/core/GAMM.sol";
import { Borrow } from "../src/core/Borrow.sol";
import { Porridge } from "../src/core/Porridge.sol";

contract GAMMTest is Test {

  Honey honey;
  GAMM gamm;
  Borrow borrow;
  Porridge porridge;

  uint256 txAmount = 10e18;
  uint256 costOf10Locks = 5641049601535046139648;
  uint256 proceedsof10Locks = 5300673535135953225736;

  bytes4 NotAdminSelector = 0x7bfa4b9f;
  bytes4 NotPorridgeSelector = 0x0da7dbfb;
  bytes4 NotBorrowSelector = 0x5a2d193d;
  bytes4 ExcessiveSlippageSelector = 0x97c7f537;

  function setUp() public {
    honey = new Honey();
    gamm = new GAMM(address(this), address(honey));
    borrow = new Borrow(address(gamm), address(this), address(honey));
    porridge = new Porridge(address(gamm), address(borrow), address(this), address(honey));

    gamm.setPorridgeAddress(address(porridge));
    gamm.setBorrowAddress(address(borrow));
    borrow.setPorridgeAddress(address(porridge));
  }

  modifier dealandApproveUserHoney() {
    deal(address(honey), address(this), type(uint256).max / 2);
    honey.approve(address(gamm), type(uint256).max / 2);
    _;
  }

  modifier dealLocks() {
    deal(address(gamm), address(this), txAmount);
    _;
  }

  modifier dealGammHoney() {
    deal(address(honey), address(gamm), type(uint256).max);
    _;
  }

  function testNotAdmin() public {
    vm.prank(address(0x01));
    vm.expectRevert(NotAdminSelector);
    gamm.injectLiquidity(69e18, 69e18);
  }

  function testNotPorridge() public {
    vm.expectRevert(NotPorridgeSelector);
    gamm.porridgeMint(address(0x01), 69e18);
  }

  function testNotBorrow() public {
    vm.expectRevert(NotBorrowSelector);
    gamm.borrowTransfer(address(0x01), 69e18, 69e18);
  }

  function testExcessiveSlippageBuy() public {
    vm.expectRevert(ExcessiveSlippageSelector);
    gamm.buy(69e18, 0);
  }

  function testExcessiveSlippageSell() public {
    vm.expectRevert(ExcessiveSlippageSelector);
    gamm.sell(69e18, type(uint256).max);
  }

  function testFloorPrice() public {
    uint256 floorPrice = gamm.floorPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "price_tests/floor_test/test.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonFloorPrice = abi.decode(result, (uint256));
    uint256 variance = pythonFloorPrice / 1000;
    assert(pythonFloorPrice + variance > floorPrice);
    assert(pythonFloorPrice - variance < floorPrice);
  }

  function testRandomFloorPrice() public {
    vm.store(address(gamm), bytes32(uint256(5)), bytes32(uint256(23457745e18)));
    vm.store(address(gamm), bytes32(uint256(6)), bytes32(uint256(8340957e18)));
    vm.store(address(gamm), bytes32(uint256(7)), bytes32(uint256(4374e18)));
    uint256 floorPrice = gamm.floorPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "price_tests/floor_test/random_test.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonFloorPrice = abi.decode(result, (uint256));
    uint256 variance = pythonFloorPrice / 1000;
    assert(pythonFloorPrice + variance > floorPrice);
    assert(pythonFloorPrice - variance < floorPrice);
  }

  function testMarketPrice() public {
    uint256 marketPrice = gamm.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "price_tests/market_test/test.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > marketPrice);
    assert(pythonMarketPrice - variance < marketPrice);
  }

  function testRandomMarketPrice() public {
    vm.store(address(gamm), bytes32(uint256(5)), bytes32(uint256(23457745e18)));
    vm.store(address(gamm), bytes32(uint256(6)), bytes32(uint256(8340957e18)));
    vm.store(address(gamm), bytes32(uint256(7)), bytes32(uint256(4374e18)));
    uint256 marketPrice = gamm.marketPrice();
    string[] memory inputs = new string[](2);
    inputs[0] = "python3";
    inputs[1] = "price_tests/market_test/random_test.py";
    bytes memory result = vm.ffi(inputs);
    uint256 pythonMarketPrice = abi.decode(result, (uint256));
    uint256 variance = pythonMarketPrice / 1000;
    assert(pythonMarketPrice + variance > marketPrice);
    assert(pythonMarketPrice - variance < marketPrice);
  }

  function testBuy() public dealandApproveUserHoney {
    gamm.buy(txAmount, type(uint256).max);

    uint256 userLocksBalance = gamm.balanceOf(address(this));
    uint256 userHoneyBalance = honey.balanceOf(address(this));

    assertEq(userLocksBalance, txAmount);
    assertEq(userHoneyBalance, (type(uint256).max / 2) - costOf10Locks);
  }

  function testSell() public dealLocks dealGammHoney {
    gamm.sell(txAmount, 0);

    uint256 userLocksBalance = gamm.balanceOf(address(this));
    uint256 userHoneyBalance = honey.balanceOf(address(this));

    assertEq(userLocksBalance, 0);
    assertEq(userHoneyBalance, proceedsof10Locks);
  }

  function testRedeemed() public dealLocks dealGammHoney{
    gamm.redeem(txAmount);

    uint256 userLocksBalance = gamm.balanceOf(address(this));
    uint256 userHoneyBalance = honey.balanceOf(address(this));
    uint256 floorPriceof10Locks = gamm.floorPrice() * 10;

    assertEq(userLocksBalance, 0);
    assertEq(userHoneyBalance, floorPriceof10Locks);
  }

  function testSuccessfulTransfer() public dealLocks {
    // bytes4(keccak256(bytes('transfer(address,uint256)')));
    (bool success, bytes memory data) = address(gamm).call(abi.encodeWithSelector(0xa9059cbb, address(0x01), 5e18));
    require(data.length == 0 || abi.decode(data, (bool)), 'transfer failed');
    assertEq(true, success);
    assertEq(gamm.balanceOf(address(0x01)), 5e18);
  }

  function testSetBorrowAddress() public {
    gamm.setBorrowAddress(address(borrow));

    assertEq(address(borrow), gamm.borrowAddress());
  }

    function testSetPorridgeAddress() public {
    gamm.setPorridgeAddress(address(porridge));

    assertEq(address(porridge), gamm.porridgeAddress());
  }

  function testFloorReduce() public {
    vm.store(address(gamm), bytes32(uint256(5)), bytes32(uint256(12424533327755417665454800)));
    vm.store(address(gamm), bytes32(uint256(6)), bytes32(uint256(6069210257394481945730874)));
    vm.store(address(gamm), bytes32(uint256(7)), bytes32(uint256(8402860035123450385400)));
    vm.store(address(gamm), bytes32(uint256(9)), bytes32(uint256(1692551675)));

    deal(address(honey), address(this), 1251210488977958997148919);
    deal(address(gamm), address(this), 543082473864185130000);
    deal(address(honey), address(gamm), 16442576931719627115185675);

    vm.warp(1692836841);
    gamm.sell(5000000000000000000, 9886383387107016000000);

    assertEq(gamm.targetRatio(), 348118083333333333);
  }

  function testMaxFloorReduce() public {
    vm.store(address(gamm), bytes32(uint256(5)), bytes32(uint256(12424533327755417665454800)));
    vm.store(address(gamm), bytes32(uint256(6)), bytes32(uint256(6069210257394481945730874)));
    vm.store(address(gamm), bytes32(uint256(7)), bytes32(uint256(8402860035123450385400)));
    vm.store(address(gamm), bytes32(uint256(9)), bytes32(uint256(1692551675)));

    deal(address(honey), address(this), 1251210488977958997148919);
    deal(address(gamm), address(this), 543082473864185130000);
    deal(address(honey), address(gamm), 16442576931719627115185675);

    vm.warp(1693936841);
    gamm.sell(5000000000000000000, 9886383387107016000000);

    assertEq(gamm.targetRatio(), 342000000000000000);
  }

  function testInjectLiquidity() public {
    uint256 fsltemp = gamm.fsl();
    uint256 psltemp = gamm.psl();
    uint256 injected = 69e18;
    deal(address(honey), address(this), injected * 2);
    honey.approve(address(gamm), injected * 2);
    gamm.injectLiquidity(injected, injected);

    assertEq(gamm.fsl(), fsltemp + injected);
    assertEq(gamm.psl(), psltemp + injected);
    assertEq(honey.balanceOf(address(gamm)), injected * 2);
  }

}