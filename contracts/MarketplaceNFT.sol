// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; // Use a recent compatible version

// Make sure you have run: npm install @openzeppelin/contracts
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MarketplaceNFT
 * @dev A single ERC721 contract for minting marketplace items using a manual counter.
 * Uses Ownable for minting control and ERC721URIStorage for metadata.
 * Token IDs are sequential and auto-incrementing.
 */
contract MarketplaceNFT is ERC721URIStorage, Ownable {
    // Manual Counter for sequential Token IDs
    uint256 private _nextTokenId;

    /**
     * @dev Sets up the contract, initializes the owner, name, and symbol.
     * The deploying address becomes the initial owner.
     */
    constructor(address initialOwner, string memory _name, string memory _symbol)
        ERC721(_name, _symbol) // Initialize ERC721 name and symbol
        Ownable(initialOwner) // Set the initial owner (your server's wallet)
    {
        // _nextTokenId defaults to 0. First token minted will have ID 0.
        // Uncomment next line if you want IDs to start from 1.
        // _nextTokenId = 1;
    }

    /**
     * @dev Mints a new NFT with the next sequential ID to the `to` address.
     * Sets the token URI for metadata.
     * Requirements:
     * - Only the contract owner (set during deployment) can call this function.
     * @param to The address to receive the newly minted NFT.
     * @param tokenURI_ The URI pointing to the NFT's metadata JSON (e.g., "ipfs://...").
     * @return The ID of the newly minted token.
     */
    function mintItem(address to, string memory tokenURI_)
        public
        onlyOwner // Modifier from Ownable, restricts access
        returns (uint256)
    {
        // Use the current counter value as the ID for the new token
        uint256 newTokenId = _nextTokenId;

        // Mint the token
        _safeMint(to, newTokenId);

        // Set the metadata URI for the minted token
        _setTokenURI(newTokenId, tokenURI_);

        // Increment the counter for the *next* mint operation
        _nextTokenId++;

        // Return the ID of the token that was just minted
        return newTokenId;
    }

    /**
     * @dev Returns the ID that will be assigned to the next token minted. Useful for front-end prediction.
     */
    function getNextTokenId() public view returns (uint256) {
        return _nextTokenId;
    }

    // --- Overrides ---

    // Removed the explicit _burn override as it wasn't adding custom logic
    // and caused compilation errors with non-virtual base function.
    // The standard burn functionality is inherited.

    /**
     * @dev See {ERC721URIStorage-tokenURI}.
     * Override required because the function exists in multiple base contracts.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override // Simplified override specifier
        returns (string memory)
    {
        // The existence check is handled within super.tokenURI()
        return super.tokenURI(tokenId);
    }

    /**
     * @dev See {ERC721-supportsInterface}.
     * Override required because the function exists in multiple base contracts.
     */
     function supportsInterface(bytes4 interfaceId)
        public
        view
        override // Simplified override specifier
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
