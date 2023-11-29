//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Test.sol";
import { LibRLP } from "../../lib/solady/src/utils/LibRLP.sol";
import { Honey } from "../../src/mock/Honey.sol";
import { GAMM } from "../../src/core/GAMM.sol";
import { Borrow } from "../../src/core/Borrow.sol";
import { Porridge } from "../../src/core/Porridge.sol";
import { LGE } from "../../src/governance/LGE.sol";

contract LGETest is Test {

  using LibRLP for address;

  Honey honey;
  GAMM gamm;
  LGE lge;

  bytes4 NotWhitelistedSelector = 0x584a7938;
  bytes4 NotMultisigSelector = 0xf05e412b;
  bytes4 NotClaimPeriodSelector = 0xb1c53a4e;
  bytes4 HardcapHitSelector = 0xd9510a48;
  bytes4 PresaleOverSelector = 0xffbd072b;
  bytes4 ExcessiveContributionSelector = 0x6a0edc0d;
  bytes4 NoContributionSelector = 0x65c7efcc;
  address whitelisted = 0x1C541e05a5A640755B3F1B2434dB4e8096b8322f;
  bytes32 root = 0x5b7879adb5297db6f1d7cfd57c317229c136825f2ea2575d976b472fff662f7b;

  function setUp() public {
    Porridge porridgeComputed = Porridge(address(this).computeAddress(4));
    Borrow borrowComputed = Borrow(address(this).computeAddress(5));
    LGE lgeComputed = LGE(address(this).computeAddress(3));
    honey = new Honey();
    gamm = new GAMM(address(this), address(porridgeComputed), address(borrowComputed), address(lgeComputed), address(honey));
    lge = new LGE(address(honey), address(gamm), address(this), root);
  }

  function proofy() public pure returns (bytes32[] memory) {
    bytes32[] memory proof = new bytes32[](6);
    proof[0] = 0xb7b19092bad498eae34230a9e14c8ce3d9d85b2bb91212108c9d47d1948acfeb;
    proof[1] = 0x1f957db768cd7253fad82a8a30755840d536fb0ffca7c5c73fe9d815b1bc2f2f;
    proof[2] = 0x924862b314bd38813a325167aca7caee16318f07303bd8e9f81bbe5808575fbf;
    proof[3] = 0xe5076a139576746fd34a0fd9c21222dc274a909421fcbaa332a5af7272b6dcb1;
    proof[4] = 0x148c730f8169681c1ebfb5626eb20af3d2351445463a1fdc5d0b116c62dc58c8;
    proof[5] = 0x5712507eeb3d7b48e5876f21fc871656c2379464b480c8e89c50c2a1e8f58ac5;
    return proof;
  }

  function testNotWhitelisted() public {
    uint256 amt = 10e18;
    bytes32[] memory proof = proofy();
    vm.expectRevert(NotWhitelistedSelector);
    lge.contribute(amt, proof);
  }

  function testNotMultisig() public {
    vm.prank(whitelisted);
    vm.expectRevert(NotMultisigSelector);
    lge.initiate();
  }

  function testNotClaimPeriod() public {
    vm.expectRevert(NotClaimPeriodSelector);
    lge.claim();
  }

  function testNotClaimPeriodInitiate() public {
    vm.expectRevert(NotClaimPeriodSelector);
    lge.initiate();
  }

  function testHardcapHit() public {
    vm.store(address(lge), bytes32(uint256(1)), bytes32(uint256(500000e18)));
    uint256 amt = 10e18;
    bytes32[] memory proof = proofy();
    vm.prank(whitelisted);
    vm.expectRevert(HardcapHitSelector);
    lge.contribute(amt, proof);
  }

  function testPresaleOver() public {
    uint256 amt = 10e18;
    bytes32[] memory proof = proofy();
    vm.prank(whitelisted);
    vm.warp(block.timestamp + 25 hours);
    vm.expectRevert(PresaleOverSelector);
    lge.contribute(amt, proof);
  }

  function testExcessiveContribution() public {
    uint256 amt = 200001e18;
    bytes32[] memory proof = proofy();
    vm.warp(block.timestamp + 7 hours);
    vm.expectRevert(ExcessiveContributionSelector);
    lge.contribute(amt, proof);
  }

  function testNoContribution() public {
    vm.warp(block.timestamp + 25 hours);
    lge.initiate();
    vm.expectRevert(NoContributionSelector);
    lge.claim();
  }

  function testContribute() public {
    uint256 amt = 10e18;
    bytes32[] memory proof = proofy();
    deal(address(honey), whitelisted, amt);
    vm.prank(whitelisted);
    honey.approve(address(lge), amt);
    vm.prank(whitelisted);
    lge.contribute(amt, proof);

    assertEq(lge.contributions(whitelisted), amt);
    assertEq(lge.totalContribution(), amt);
    assertEq(honey.balanceOf(whitelisted), 0);
    assertEq(honey.balanceOf(address(lge)), amt);
  }

  function testClaimLocks() public {
    uint256 amt = 10e18;
    bytes32[] memory proof = proofy();
    deal(address(honey), whitelisted, amt);
    vm.prank(whitelisted);
    honey.approve(address(lge), amt);
    vm.prank(whitelisted);
    lge.contribute(amt, proof);
    vm.warp(block.timestamp + 25 hours);
    lge.initiate();
    vm.prank(whitelisted);
    lge.claim();

    assertEq(lge.contributions(whitelisted), 0);
    assertEq(gamm.balanceOf(whitelisted), 7000e18);
    assertEq(gamm.balanceOf(address(this)), 3000e18);
    assertEq(gamm.totalSupply(), 10000e18);
  }

  function testInitiateMaxRaise() public {
    vm.store(address(lge), bytes32(uint256(1)), bytes32(uint256(500000e18)));
    deal(address(honey), address(lge), 500000e18);
    vm.warp(block.timestamp + 25 hours);
    lge.initiate();

    assertEq(450000e18, honey.balanceOf(address(gamm)));
    assertEq(50000e18, honey.balanceOf(address(this)));
    assertEq(7000e18, gamm.balanceOf(address(lge)));
    assertEq(3000e18, gamm.balanceOf(address(this)));
    assertEq(375000e18, gamm.fsl());
    assertEq(75000e18, gamm.psl());
  }

  function testSetMultisigFail() public {
    vm.prank(address(0x69));
    vm.expectRevert(NotMultisigSelector);
    lge.setMultisig(address(0x69));
  }

  function testSetMultisig() public {
    lge.setMultisig(address(0x69));
    
    assertEq(lge.multisig(), address(0x69));
  }

}