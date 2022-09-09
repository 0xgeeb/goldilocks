//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

//Importing ERC20 template
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";


//Creating Reward token via ERC20 template, and a wrapper for the ERC20 template's _mint, _burn and totalSupply functions
//Need to implement mechanism for allowing only the staking and farm contracts to mint tokens, and allowing only the realisation contract to burn tokens
contract RWDToken is ERC20, Ownable {

  address public ammAddress;
  address public redemptionAddress;


  constructor(address _ammAddress, address _redemptionAddress) ERC20("Reward", "RWD") {
    ammAddress = _ammAddress;
    redemptionAddress = _redemptionAddress;
  }

  uint public RWDSupply = totalSupply();

  modifier onlyAdmin() {
    require(msg.sender == ammAddress || msg.sender == redemptionAddress, "not authorized");
    _;
  }

  function RWDmint(address to, uint256 amount) public onlyAdmin() {
    _mint(to, amount);
    //updates supply after minting
    RWDSupply += amount;
  }

  function RWDBurn(address from, uint256 amount) public onlyAdmin() {
    _burn(from, amount);
    //updates supply after minting
    RWDSupply -= amount;
  }

}