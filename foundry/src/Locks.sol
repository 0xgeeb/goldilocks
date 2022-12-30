//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { ERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { IAMM } from "./interfaces/IAMM.sol";

contract Locks is ERC20("Locks Token", "LOCKS") {

  uint256 public startTime;
  uint256 public totalContribution;
  uint256 public hardCap = 1000000e18;
  address public ammAddress;
  address public adminAddress;
  address public porridgeAddress;
  IERC20 honey;

  constructor(address _adminAddress) {
    adminAddress = _adminAddress;
  }

  modifier onlyAdmin() {
    require(msg.sender == adminAddress, "not admin");
    _;
  }

  modifier onlyAMM() {
    require(msg.sender == ammAddress, "not amm");
    _;
  }

  modifier onlyPorridge() {
    require(msg.sender == porridgeAddress, "not porridge");
    _;
  }

  function contribute(uint256 _amount) public {
    require(totalContribution + _amount <= hardCap, "hardcap hit");
    require(block.timestamp - startTime < 24 hours, "presale has already concluded");
    totalContribution += _amount;
    honey.transferFrom(msg.sender, address(this), _amount);
    _mint(msg.sender, _amount * 9/10);
  }

  function ammMint(address _to, uint256 _amount) external onlyAMM {
    _mint(_to, _amount);
  }

  function ammBurn(address _to, uint256 _amount) external onlyAMM {
    _burn(_to, _amount);
  }

  function porridgeMint(address _to, uint256 _amount) external onlyPorridge {
    _mint(_to, _amount);
  }

  function setup() public onlyAdmin {
    startTime = block.timestamp;
  }

  function transferToAMM(uint256 _fsl, uint256 _psl) public onlyAdmin {
    IAMM iamm = IAMM(ammAddress);
    honey.transfer(address(ammAddress), honey.balanceOf(address(this)));
    iamm.initialize(_fsl, _psl);
  }

  function setAmmAddress(address _ammAddress) public onlyAdmin {
    ammAddress = _ammAddress;
  }

  function setPorridgeAddress(address _porridgeAddress) public onlyAdmin {
    porridgeAddress = _porridgeAddress;
  }

  function setHoneyAddress(address _honeyAddress) public onlyAdmin {
    honey = IERC20(_honeyAddress);
  }

}