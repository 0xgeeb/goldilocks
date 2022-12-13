//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/forge-std/src/Test.sol";
import "../src/Locks.sol";
import "../src/AMM.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract LocksTest is Test {

  Locks locks;
  AMM amm;
  IERC20 honey;
  address adminAddress = 0xFB38050d2dEF04c1bb5Ff21096d50cD992418be3;

  function setUp() public {
    locks = new Locks(adminAddress);
    amm = new AMM(address(locks), address(this));
    honey = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);
  }

  function testHardCap() public {
    vm.expectRevert(bytes("hardcap hit"));
    locks.contribute(1000001e18);
  }

  function testMint() public {
    vm.prank(adminAddress);
    locks.setAmmAddress(address(amm));
    vm.prank(address(amm));
    locks.ammMint(msg.sender, 100e18);
    assertEq(locks.totalSupply(), 100e18);
    assertEq(locks.balanceOf(msg.sender), 100e18);
  }

  function testBurn() public {
    vm.prank(adminAddress);
    locks.setAmmAddress(address(amm));
    vm.prank(address(amm));
    locks.ammMint(msg.sender, 100e18);
    vm.prank(address(amm));
    locks.ammBurn(msg.sender, 100e18);
    assertEq(locks.totalSupply(), 0);
    assertEq(locks.balanceOf(msg.sender), 0);
  }

  function testOnlyAdmin() public {
    vm.expectRevert(bytes("not admin"));
    locks.setPorridgeAddress(address(this));
  }

  function testOnlyAMM() public {
    vm.expectRevert(bytes("not amm"));
    locks.ammMint(msg.sender, 100e18);
  }

  function testTransferToAMM() public {
    deal(address(honey), address(locks), 1000000e18, true);
    vm.prank(adminAddress);
    locks.setAmmAddress(address(amm));
    vm.prank(adminAddress);
    locks.transferToAMM(1600000e18, 400000e18);
    assertEq(honey.balanceOf(address(amm)), 1000000e18);
    assertEq(honey.balanceOf(address(locks)), 0);
    assertEq(amm.fsl(), 1600000e18);
    assertEq(amm.psl(), 400000e18);
  }

}