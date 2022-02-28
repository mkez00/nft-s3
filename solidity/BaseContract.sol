// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract BaseContract is ERC721URIStorage {

    address public Broker;
    uint256 public Value;

    constructor(string memory name_, string memory symbol_, string memory tokenURI_, address broker_) ERC721(name_, symbol_) payable {

        // Charging a small fee for storing data
        (bool sent, bytes memory data) = broker_.call{value: msg.value}("");
        require(sent, "Failed to send Ether");
        Broker = broker_;
        Value = msg.value;

        uint256 newNftTokenId = 1; //never more than one
        _safeMint(msg.sender, newNftTokenId);
        _setTokenURI(newNftTokenId, tokenURI_);
    }
}