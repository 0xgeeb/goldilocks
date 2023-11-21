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

  function setUp() public {
    Porridge porridgeComputed = Porridge(address(this).computeAddress(4));
    Borrow borrowComputed = Borrow(address(this).computeAddress(5));
    LGE lgeComputed = LGE(address(this).computeAddress(3));
    honey = new Honey();
    gamm = new GAMM(address(this), address(porridgeComputed), address(borrowComputed), address(lgeComputed), address(honey));
    lge = new LGE(address(honey), address(gamm), address(this));
  }

  function testContribute() public {

  }

  function testClaim() public {

  }

  function testInitiate() public {
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

}