// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import { ERC721 } from "../../lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from "../../lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract BandBear is ERC721URIStorage {

  uint256 tokenId = 1;

  constructor() ERC721("Band Bears", "BAND") {}

  function mint(address user) external {
    _safeMint(user, tokenId);
    _setTokenURI(tokenId, "ipfs://QmNPDmViVc4mojbGwo9f5tAiAhaJ2vUicxkAZiYCfWNopT/1104");
    tokenId++;
  }

}