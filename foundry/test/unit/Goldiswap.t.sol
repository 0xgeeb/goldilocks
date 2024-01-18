//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Test.sol";
import { LibRLP } from "../../lib/solady/src/utils/LibRLP.sol";
import { Honey } from "../../src/mock/Honey.sol";
import { Goldiswap } from "../../src/core/Goldiswap.sol";
import { Borrow } from "../../src/core/Borrow.sol";
import { Porridge } from "../../src/core/Porridge.sol";
import { Goldilend } from "../../src/core/Goldilend.sol";

contract GAMMTest is Test {

  using LibRLP for address;

  Honey honey;
  Goldiswap goldiswap;
  Borrow borrow;
  Porridge porridge;

  uint256 txAmount = 10e18;
  // uint256 costOf10Locks = 5641049601535046139648;
  uint256 costOf10Locks = 5627518081751651091792;
  // uint256 proceedsof10Locks = 5300673535135953225736;
  uint256 proceedsof10Locks = 5313319664425536973008;

  bytes4 NotMultisigSelector = 0xf05e412b;
  bytes4 NotPorridgeSelector = 0x0da7dbfb;
  bytes4 NotBorrowSelector = 0x5a2d193d;
  bytes4 ExcessiveSlippageSelector = 0x97c7f537;

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
    honey.approve(address(goldiswap), type(uint256).max / 2);
    _;
  }

  modifier dealLocks() {
    deal(address(goldiswap), address(this), txAmount);
    _;
  }

  modifier dealGammHoney() {
    deal(address(honey), address(goldiswap), type(uint256).max);
    _;
  }

  function testNotMultisig() public {
    vm.prank(address(0x01));
    vm.expectRevert(NotMultisigSelector);
    goldiswap.injectLiquidity(69e18, 69e18);
  }

  function testNotPorridge() public {
    vm.expectRevert(NotPorridgeSelector);
    goldiswap.porridgeMint(address(0x01), 69e18);
  }

  function testNotBorrow() public {
    vm.expectRevert(NotBorrowSelector);
    goldiswap.borrowTransfer(address(0x01), 69e18, 69e18);
  }

  function testExcessiveSlippageBuy() public {
    vm.expectRevert(ExcessiveSlippageSelector);
    goldiswap.buy(69e18, 0);
  }

  function testExcessiveSlippageSell() public {
    vm.expectRevert(ExcessiveSlippageSelector);
    goldiswap.sell(69e18, type(uint256).max);
  }

  function testLocksName() public {
    assertEq(goldiswap.name(), "Locks Token");
  }

  function testLocksSymbol() public {
    assertEq(goldiswap.symbol(), "LOCKS");
  }

  function testFloorPrice() public {
    uint256 floorPrice = goldiswap.floorPrice();
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
    vm.store(address(goldiswap), bytes32(uint256(0)), bytes32(uint256(23457745e18)));
    vm.store(address(goldiswap), bytes32(uint256(1)), bytes32(uint256(8340957e18)));
    vm.store(address(goldiswap), bytes32(uint256(2)), bytes32(uint256(4374e18)));
    uint256 floorPrice = goldiswap.floorPrice();
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
    uint256 marketPrice = goldiswap.marketPrice();
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
    vm.store(address(goldiswap), bytes32(uint256(0)), bytes32(uint256(23457745e18)));
    vm.store(address(goldiswap), bytes32(uint256(1)), bytes32(uint256(8340957e18)));
    vm.store(address(goldiswap), bytes32(uint256(2)), bytes32(uint256(4374e18)));
    uint256 marketPrice = goldiswap.marketPrice();
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
    goldiswap.buy(txAmount, type(uint256).max);

    uint256 userLocksBalance = goldiswap.balanceOf(address(this));
    uint256 userHoneyBalance = honey.balanceOf(address(this));

    assertEq(userLocksBalance, txAmount);
    assertEq(userHoneyBalance, (type(uint256).max / 2) - costOf10Locks);
  }

  function testSell() public dealLocks dealGammHoney {
    goldiswap.sell(txAmount, 0);

    uint256 userLocksBalance = goldiswap.balanceOf(address(this));
    uint256 userHoneyBalance = honey.balanceOf(address(this));

    assertEq(userLocksBalance, 0);
    assertEq(userHoneyBalance, proceedsof10Locks);
  }

  function testRedeemed() public dealLocks dealGammHoney {
    goldiswap.redeem(txAmount);

    uint256 userLocksBalance = goldiswap.balanceOf(address(this));
    uint256 userHoneyBalance = honey.balanceOf(address(this));
    uint256 floorPriceof10Locks = goldiswap.floorPrice() * 10;

    assertEq(userLocksBalance, 0);
    assertEq(userHoneyBalance, floorPriceof10Locks);
  }

  function testSuccessfulTransfer() public dealLocks {
    // bytes4(keccak256(bytes('transfer(address,uint256)')));
    (bool success, bytes memory data) = address(goldiswap).call(abi.encodeWithSelector(0xa9059cbb, address(0x01), 5e18));
    require(data.length == 0 || abi.decode(data, (bool)), 'transfer failed');
    assertEq(true, success);
    assertEq(goldiswap.balanceOf(address(0x01)), 5e18);
  }

  function testFloorReduce() public {
    vm.store(address(goldiswap), bytes32(uint256(0)), bytes32(uint256(12424533327755417665454800)));
    vm.store(address(goldiswap), bytes32(uint256(1)), bytes32(uint256(6069210257394481945730874)));
    vm.store(address(goldiswap), bytes32(uint256(2)), bytes32(uint256(8402860035123450385400)));
    vm.store(address(goldiswap), bytes32(uint256(4)), bytes32(uint256(1692551675)));

    deal(address(honey), address(this), 1251210488977958997148919);
    deal(address(goldiswap), address(this), 543082473864185130000);
    deal(address(honey), address(goldiswap), 16442576931719627115185675);

    vm.warp(1692836841);
    goldiswap.sell(5000000000000000000, 9886383387107016000000);

    assertEq(goldiswap.targetRatio(), 348118083333333333);
  }

  function testMaxFloorReduce() public {
    vm.store(address(goldiswap), bytes32(uint256(0)), bytes32(uint256(12424533327755417665454800)));
    vm.store(address(goldiswap), bytes32(uint256(1)), bytes32(uint256(6069210257394481945730874)));
    vm.store(address(goldiswap), bytes32(uint256(2)), bytes32(uint256(8402860035123450385400)));
    vm.store(address(goldiswap), bytes32(uint256(4)), bytes32(uint256(1692551675)));

    deal(address(honey), address(this), 1251210488977958997148919);
    deal(address(goldiswap), address(this), 543082473864185130000);
    deal(address(honey), address(goldiswap), 16442576931719627115185675);

    vm.warp(1693936841);
    goldiswap.sell(5000000000000000000, 9886383387107016000000);

    assertEq(goldiswap.targetRatio(), 342000000000000000);
  }

  function testInjectLiquidity() public {
    uint256 fsltemp = goldiswap.fsl();
    uint256 psltemp = goldiswap.psl();
    uint256 injected = 69e18;
    deal(address(honey), address(this), injected * 2);
    honey.approve(address(goldiswap), injected * 2);
    goldiswap.injectLiquidity(injected, injected);

    assertEq(goldiswap.fsl(), fsltemp + injected);
    assertEq(goldiswap.psl(), psltemp + injected);
    assertEq(honey.balanceOf(address(goldiswap)), injected * 2);
  }

  function testSetMultisigFail() public {
    vm.prank(address(0x69));
    vm.expectRevert(NotMultisigSelector);
    goldiswap.setMultisig(address(0x69));
  }

  function testSetMultisig() public {
    goldiswap.setMultisig(address(0x69));
    
    assertEq(goldiswap.multisig(), address(0x69));
  }

  function testDrainGamm() public {
    uint256 milly = 1000000e18;
    deal(address(honey), address(this), milly);
    honey.approve(address(goldiswap), milly);
    deal(address(honey), address(goldiswap), milly);

    uint256 beforeGammLocks = goldiswap.balanceOf(address(goldiswap));
    uint256 beforeGammHoney = honey.balanceOf(address(goldiswap));
    uint256 beforeUserLocks = goldiswap.balanceOf(address(this));
    uint256 beforeUserHoney = honey.balanceOf(address(this));
    console.log("before: goldiswap $LOCKS balance", beforeGammLocks);
    console.log("before: goldiswap $HONEY balance", beforeGammHoney);
    console.log("before: user $LOCKS balance", beforeUserLocks);
    console.log("before: user $HONEY balance", beforeUserHoney);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");



    goldiswap.buy(10e18, type(uint256).max);



    uint256 afterGammLocks = goldiswap.balanceOf(address(goldiswap));
    uint256 afterGammHoney = honey.balanceOf(address(goldiswap));
    uint256 afterUserLocks = goldiswap.balanceOf(address(this));
    uint256 afterUserHoney = honey.balanceOf(address(this));
    console.log("after: goldiswap $LOCKS balance", afterGammLocks);
    console.log("after: goldiswap $HONEY balance", afterGammHoney);
    console.log("after: user $LOCKS balance", afterUserLocks);
    console.log("after: user $HONEY balance", afterUserHoney);
    console.log(beforeUserHoney - afterUserHoney);
  }

}