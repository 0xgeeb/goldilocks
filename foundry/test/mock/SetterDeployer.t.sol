//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Test.sol";
import { LibRLP } from "../../lib/solady/src/utils/LibRLP.sol";
import { Reader } from "../../src/mock/Reader.sol";
import { Writer } from "../../src/mock/Writer.sol";

contract SetterDeployerTest is Test {

  using LibRLP for address;

  function testDeploy() public {
    Reader readerComputed = Reader(address(this).computeAddress(2));
    Writer writer = new Writer(address(readerComputed));
    Reader reader = new Reader(address(writer));
    require(reader == readerComputed, "no sanity");

    console.log(address(reader));
    console.log(writer.reader());

    console.log(address(writer));
    console.log(reader.writer());
  }


}