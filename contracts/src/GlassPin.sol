// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GlassPin is ERC721URIStorage {
    mapping(uint => uint) public votes;
    mapping(address => mapping(uint => bool)) public voted;

    mapping(uint => uint) public pins;
    mapping(address => mapping(uint => bool)) public hasPinned;

    using Counters for Counters.Counter;
    Counters.Counter private tokenIdCounter;

    constructor() ERC721("GlassPin", "MP") {}

    function createGlassPin(
        address creator,
        string memory tokenURI
    ) public returns (uint256 tokenId) {
        tokenId = tokenIdCounter.current();
        _safeMint(creator, tokenId);
        _setTokenURI(tokenId, tokenURI);
        tokenIdCounter.increment();
    }

    function vote(uint tokenId) public {
        require(!voted[msg.sender][tokenId], "GlassPin: already voted");

        votes[tokenId] += 1;
        voted[msg.sender][tokenId] = true;
    }

    function downvote(uint tokenId) public {
        require(voted[msg.sender][tokenId], "GlassPin: has not voted");

        votes[tokenId] -= 1;
        voted[msg.sender][tokenId] = false;
    }

    function getVotes(uint tokenId) public view returns (uint) {
        return votes[tokenId];
    }

    function getVoted(address voter, uint tokenId) public view returns (bool) {
        return voted[voter][tokenId];
    }
    

    function pin(uint tokenId) public {
        pins[tokenId] += 1;
        hasPinned[msg.sender][tokenId] = true;
    }

    function unpin(uint tokenId) public {
        require(hasPinned[msg.sender][tokenId], "GlassPin: has not pinned");

        pins[tokenId] -= 1;
        hasPinned[msg.sender][tokenId] = false;
    }

    function getPins(uint tokenId) public view returns (uint) {
        return pins[tokenId];
    }

    function getHasPinned(
        address pinner,
        uint tokenId
    ) public view returns (bool) {
        return hasPinned[pinner][tokenId];
    }
}
