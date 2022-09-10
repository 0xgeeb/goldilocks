//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

// need to change allocations mappings to merkle tree hash system
// do not think tokenDecimals is correct way to do that, need to change
// need to change onlyAdmin() modifier

contract HLMToken is ERC20("Helium", "HLM") {

  address public ammAddress;
  address public redemptionAddress;
  uint256 public startTime;
  uint256 public totalContribution;
  uint256 public tokenDecimals = 10**18;
  uint256 hardCap = 1000000*tokenDecimals;
  uint256 softCap = hardCap / 10;
  IERC20 usdc;

  mapping(address => uint256) public allocations;

  constructor(address _ammAddress, address _redemptionAddress) {
    ammAddress = _ammAddress;
    redemptionAddress = _redemptionAddress;
    usdc = IERC20(0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8);
  }

  event Contribution(address indexed user, uint256 indexed amountPaid, uint256 indexed amountRecieved);
  event Realise(address indexed user, uint256 indexed amountRealised);

  modifier onlyAdmin() {
    require(msg.sender == ammAddress || msg.sender == redemptionAddress, "not authorized");
    _;
  }

  function usdcBalance(address _user) public view returns (uint256) {
    return usdc.balanceOf(_user);
  }

  function usdcAllowance(address _user) public view returns (uint256) {
    return usdc.allowance(_user, address(this));
  }

  function mint(address _to, uint256 _amount) public onlyAdmin() {
    _mint(_to, _amount);
  }

  function burn(address _from, uint256 _amount) public onlyAdmin() {
    _burn(_from, _amount);
  }

  function setup() public onlyAdmin() {
    startTime = block.timestamp;
  }

  function contribute (uint256 _amount) public {
    uint256 amount = _amount * tokenDecimals;
    require(_amount <= allocations[msg.sender],"insufficient allocations");
    require(totalContribution + _amount <= hardCap, "hardcap hit");
    require(usdcBalance(msg.sender) >= _amount && usdcAllowance(msg.sender) >= _amount, "insufficient funds/allowance");
    require(block.timestamp - startTime < 24 hours, "presale has already concluded");
    allocations[msg.sender] -= _amount;
    usdc.transferFrom(msg.sender, address(this), _amount);
    _mint(msg.sender, amount*9/10);
    totalContribution += amount;
  }

}