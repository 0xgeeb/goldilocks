//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "../lib/openzeppelin-contracts/contracts/utils/cryptography/MerkleProof.sol";

contract MyToken is ERC721("My Token", "MYT") {
    
  bytes32 public root;

  constructor(bytes32 _root) {
    root = _root;
  }

  function mint(address _to, uint256 _amount, bytes32[] memory _proof) public {
    require(isValid(_proof, keccak256(abi.encodePacked(msg.sender))), "not in allowList");
    _safeMint(_to, _amount);
  }

  function isValid(bytes32[] memory _proof, bytes32 _leaf) public view returns (bool) {
    return MerkleProof.verify(_proof, root, _leaf);
  }

}