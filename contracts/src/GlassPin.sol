// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title GlassPin
 * @dev A contract for creating, voting, and pinning digital assets (GlassPins) with metadata stored on-chain.
 */
contract GlassPin is ERC721URIStorage {
    // Mapping to store votes for each token ID
    mapping(uint256 => uint256) public tokenVotes;
    
    // Mapping to check if an address has voted on a specific token ID
    mapping(address => mapping(uint256 => bool)) public hasVoted;

    // Mapping to store the number of pins for each token ID
    mapping(uint256 => uint256) public tokenPins;
    
    // Mapping to check if an address has pinned a specific token ID
    mapping(address => mapping(uint256 => bool)) public hasPinnedToken;

    // Using OpenZeppelin's Counters library for token ID management
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Modifier to ensure the token exists
    modifier tokenExists(uint256 tokenId) {
        require(_exists(tokenId), "GlassPin: Token does not exist");
        _;
    }

    constructor() ERC721("GlassPin", "GPN") {}

    /**
     * @dev Creates a new GlassPin token and assigns it to the creator.
     * @param creator The address of the token creator.
     * @param tokenURI The metadata URI for the GlassPin.
     * @return tokenId The ID of the newly created GlassPin.
     */
    function createGlassPin(
        address creator,
        string memory tokenURI
    ) public returns (uint256 tokenId) {
        tokenId = _tokenIdCounter.current();
        _safeMint(creator, tokenId);
        _setTokenURI(tokenId, tokenURI);
        _tokenIdCounter.increment();
    }

    /**
     * @dev Allows a user to vote for a specific GlassPin.
     * @param tokenId The ID of the GlassPin being voted on.
     */
    function vote(uint256 tokenId) public tokenExists(tokenId) {
        require(!hasVoted[msg.sender][tokenId], "GlassPin: Already voted");
        tokenVotes[tokenId] += 1;
        hasVoted[msg.sender][tokenId] = true;
    }

    /**
     * @dev Allows a user to remove their vote from a specific GlassPin.
     * @param tokenId The ID of the GlassPin being downvoted.
     */
    function downvote(uint256 tokenId) public tokenExists(tokenId) {
        require(hasVoted[msg.sender][tokenId], "GlassPin: No previous vote");
        require(tokenVotes[tokenId] > 0, "GlassPin: No votes to remove");
        tokenVotes[tokenId] -= 1;
        hasVoted[msg.sender][tokenId] = false;
    }

    /**
     * @dev Returns the total number of votes for a specific GlassPin.
     * @param tokenId The ID of the GlassPin.
     * @return The total number of votes.
     */
    function getVotes(uint256 tokenId) public view returns (uint256) {
        return tokenVotes[tokenId];
    }

    /**
     * @dev Checks if a user has voted for a specific GlassPin.
     * @param voter The address of the voter.
     * @param tokenId The ID of the GlassPin.
     * @return True if the user has voted, false otherwise.
     */
    function hasUserVoted(
        address voter,
        uint256 tokenId
    ) public view returns (bool) {
        return hasVoted[voter][tokenId];
    }

    /**
     * @dev Pins a specific GlassPin to a user's collection.
     * @param tokenId The ID of the GlassPin being pinned.
     */
    function pin(uint256 tokenId) public tokenExists(tokenId) {
        require(!hasPinnedToken[msg.sender][tokenId], "GlassPin: Already pinned");
        tokenPins[tokenId] += 1;
        hasPinnedToken[msg.sender][tokenId] = true;
    }

    /**
     * @dev Unpins a specific GlassPin from a user's collection.
     * @param tokenId The ID of the GlassPin being unpinned.
     */
    function unpin(uint256 tokenId) public tokenExists(tokenId) {
        require(hasPinnedToken[msg.sender][tokenId], "GlassPin: Not pinned");
        require(tokenPins[tokenId] > 0, "GlassPin: No pins to remove");
        tokenPins[tokenId] -= 1;
        hasPinnedToken[msg.sender][tokenId] = false;
    }

    /**
     * @dev Returns the total number of pins for a specific GlassPin.
     * @param tokenId The ID of the GlassPin.
     * @return The total number of pins.
     */
    function getPins(uint256 tokenId) public view returns (uint256) {
        return tokenPins[tokenId];
    }

    /**
     * @dev Checks if a user has pinned a specific GlassPin.
     * @param pinner The address of the user.
     * @param tokenId The ID of the GlassPin.
     * @return True if the user has pinned the GlassPin, false otherwise.
     */
    function hasUserPinned(
        address pinner,
        uint256 tokenId
    ) public view returns (bool) {
        return hasPinnedToken[pinner][tokenId];
    }

    /**
     * @dev Gets the total number of tokens created.
     * @return The current token ID count.
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
}
