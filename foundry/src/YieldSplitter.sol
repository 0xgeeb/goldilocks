//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { IPrincipalToken } from "./interfaces/IPrincipalToken.sol";
import { IYieldToken } from "./interfaces/IYieldToken.sol";

contract YieldSplitter {

  IPrincipalToken pt;
  IYieldToken yt;
  IERC20 weth;
  IERC20 bera;
  
  address public adminAddress;
  
  uint256 startDate;
  uint256 endDate;
  uint256 ptSupply;
  uint256 ytSupply;

  constructor(uint256 _startDate, uint256 _endDate) {
    adminAddress = msg.sender;
    weth = IERC20(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
    // address for dai
    bera = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);
    startDate = _startDate;
    endDate = _endDate;
  }

  modifier onlyAdmin() {
    require(msg.sender == adminAddress, "not admin");
    _;
  }

  function deposit(uint256 _amount) public {
    require(endDate - block.timestamp >= 4 weeks, "insufficient time remaining");
    weth.transferFrom(msg.sender, address(this), _amount);
    pt.mint(msg.sender, _amount);
    ptSupply += _amount;
    uint256 _timeShare = ((endDate - block.timestamp)*1e18) / (endDate - startDate);
    uint256 _yieldShare = (_amount * _timeShare) / 1e18;
    yt.mint(msg.sender, _yieldShare);
    ytSupply += _yieldShare;
  }

  function withdraw(uint256 _amount) public {
    pt.burn(msg.sender, _amount);
    yt.burn(msg.sender, _amount);
    weth.transferFrom(address(this), msg.sender, _amount);
  }

  function redeemYield(uint256 _amount) public {
    require(block.timestamp >= endDate, "vault has not concluded");
    require(yt.balanceOf(msg.sender) >= _amount, "insufficient yield token balance");
    yt.burn(msg.sender, _amount);
    bera.transferFrom(address(this), msg.sender, (_amount / ytSupply) * (bera.balanceOf(address(this))));
  }

  function redeemOwnership(uint256 _amount) public {
    require(block.timestamp >= endDate, "vault has not concluded");
    pt.burn(msg.sender, _amount);
    weth.transferFrom(address(this), msg.sender, _amount);
  }

  function setUpTokens(address _ptAddress, address _ytAddress) public onlyAdmin {
    pt = IPrincipalToken(_ptAddress);
    yt = IYieldToken(_ytAddress);
    ptSupply = pt.totalSupply();
    ytSupply = yt.totalSupply();
  }

}