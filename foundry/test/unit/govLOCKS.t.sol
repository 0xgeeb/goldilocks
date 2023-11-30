//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Test.sol";
import { LibRLP } from "../../lib/solady/src/utils/LibRLP.sol";
import { Honey } from "../../src/mock/Honey.sol";
import { GAMM } from "../../src/core/GAMM.sol";
import { Borrow } from "../../src/core/Borrow.sol";
import { Porridge } from "../../src/core/Porridge.sol";
import { GoldiGovernor } from "../../src/governance/GoldiGovernor.sol";
import { Timelock } from "../../src/governance/Timelock.sol";
import { LGE } from "../../src/governance/LGE.sol";
import { govLOCKS } from "../../src/governance/govLOCKS.sol";

contract govLOCKSTest is Test {

  using LibRLP for address;

  Honey honey;
  GAMM gamm;
  GoldiGovernor goldigov;
  Timelock timelock;
  govLOCKS govlocks;

  function setUp() public {
    Porridge porridgeComputed = Porridge(address(this).computeAddress(4));
    Borrow borrowComputed = Borrow(address(this).computeAddress(3));
    LGE lgeComputed = LGE(address(this).computeAddress(5));
    GoldiGovernor goldigovComputed = GoldiGovernor(address(this).computeAddress(4));
    honey = new Honey();
    gamm = new GAMM(address(this), address(porridgeComputed), address(borrowComputed), address(lgeComputed), address(honey));
    timelock = new Timelock(address(goldigovComputed), 5 days);
    goldigov = new GoldiGovernor(address(timelock), address(gamm), address(this), 5761, 69, 1000000e18);
    govlocks = new govLOCKS(address(gamm), address(goldigov));
  }

  function testHello() public {
    console.log("Hello");
  }

}