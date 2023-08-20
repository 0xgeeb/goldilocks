//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Test.sol";
import { Goldilend } from "../src/core/Goldilend.sol";

contract BorrowTest is Test {

  Goldilend goldilend;

  function setUp() public {
    uint256 size = 69;
    address bera = address(0x01);
    address prg = address(0x02);
    address admin = address(0x03);
    address[] memory nfts = new address[](2);
    nfts[0] = address(0x04);
    nfts[1] = address(0x05);
    uint8[] memory boosts = new uint8[](2);
    boosts[0] = 6;
    boosts[1] = 9;
    goldilend = new Goldilend(
      size,
      bera,
      prg,
      admin,
      nfts,
      boosts
    );
  }

}