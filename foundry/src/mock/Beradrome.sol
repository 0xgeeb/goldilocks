// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import { ERC721 } from "../../lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from "../../lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Beradrome is ERC721URIStorage {

  uint256 tokenId = 1;

  constructor() ERC721("Tour de Berance", "DROM") {}

  function mint() external {
    _safeMint(msg.sender, tokenId);
    _setTokenURI(tokenId, "ipfs://QmaqxDAW9ZYSpsZHGZboGwoKnmwfcunc5mK8iwCvPiYxGc/73");
    tokenId++;
  }

}