//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { INFT } from "./INFT.sol";
import { Bera } from "./Bera.sol";

contract BeraFaucet {

  address public bondbear;
  address public bandbear;
  address public honeycomb;
  address public beradrome;
  address public bera;

  constructor(
    address _bondbear,
    address _bandbear,
    address _honeycomb,
    address _beradrome,
    address _bera
  ) {
    bondbear = _bondbear;
    bandbear = _bandbear;
    honeycomb = _honeycomb;
    beradrome = _beradrome;
    bera = _bera;
  }

  function drip() external {
    INFT(bondbear).mint(msg.sender);
    INFT(bandbear).mint(msg.sender);
    INFT(honeycomb).mint(msg.sender);
    INFT(beradrome).mint(msg.sender);
    Bera(bera).mint(msg.sender, 1000000e18);
  }
}