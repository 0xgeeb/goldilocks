//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

//Importing ERC20 template
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

//Creates HLM token via ERC20 template, and a wrapper for the ERC20 template's _mint, _burn and totalSupply functions -- helium ust a placeholder name 
//Need to implement mechanism for allowing only the AMM and presale contracts to mint tokens, and allowing only the AMM and redemption contracts to burn tokens
contract HLMToken is ERC20, Ownable {

  address public ammAddress;
  address public redemptionAddress;

  constructor(address _ammAddress, address _redemptionAddress) ERC20("Helium", "HLM")  {
    ammAddress = _ammAddress;
    redemptionAddress = _redemptionAddress;
  }

  uint public Supply = totalSupply();

  modifier onlyAdmin() {
    require(msg.sender == ammAddress || msg.sender == redemptionAddress, "not authorized");
    _;
  }

  function mint(address to, uint256 amount) public onlyAdmin() {
    _mint(to, amount);
    //updates supply after minting
    Supply += amount;
    }

  function burn(address from, uint256 amount) public onlyAdmin() {
    _burn(from, amount);
    //updates supply after minting
    Supply -= amount;
    }
}