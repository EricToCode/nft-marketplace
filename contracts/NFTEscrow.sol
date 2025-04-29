// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol"; // Optional but good practice for holding NFTs
import "@openzeppelin/contracts/access/Ownable.sol"; // To manage marketplace fee address

/**
 * @title NFTEscrow
 * @dev Manages escrow for NFT sales, holding funds and facilitating transfer.
 */
contract NFTEscrow is ERC721Holder, Ownable {
    uint256 private _escrowIds; // Counter for unique escrow IDs

    // Marketplace fee details
    address private _marketplaceFeeAddress;
    uint256 private _marketplaceFeeAmount; // Fee in Wei (0.002 ETH)

    enum EscrowStatus { Created, Accepted, Released, Cancelled } // Added Cancelled

    struct Escrow {
        uint256 id;
        address payable buyer;
        address payable seller;
        address nftContractAddress;
        uint256 tokenId;
        uint256 offerAmount; // Amount seller receives (in Wei)
        uint256 totalAmountPaid; // Amount buyer paid (offer + fee) (in Wei)
        EscrowStatus status;
        bool sellerAccepted; // Flag to ensure seller accepts before release
    }

    // Mapping from escrow ID to Escrow details
    mapping(uint256 => Escrow) public escrows;

    // Events
    event EscrowCreated(uint256 indexed escrowId, address indexed buyer, address indexed seller, address nftContractAddress, uint256 tokenId, uint256 offerAmount, uint256 feeAmount);
    event EscrowAccepted(uint256 indexed escrowId);
    event EscrowReleased(uint256 indexed escrowId, address buyer, address seller, uint256 amountReleasedToSeller, uint256 feePaid);
    event EscrowCancelled(uint256 indexed escrowId); // Optional: If cancellation is implemented

    /**
     * @dev Sets the initial owner, marketplace fee address, and fee amount.
     * @param initialOwner Address of the contract deployer/owner.
     * @param initialMarketplaceFeeAddress Address to receive marketplace fees.
     * @param initialMarketplaceFeeAmount Fee amount in Wei (e.g., 2_000_000_000_000_000 for 0.002 ETH).
     */
    constructor(address initialOwner, address initialMarketplaceFeeAddress, uint256 initialMarketplaceFeeAmount) Ownable(initialOwner) {
        require(initialMarketplaceFeeAddress != address(0), "Marketplace address cannot be zero");
        _marketplaceFeeAddress = initialMarketplaceFeeAddress;
        _marketplaceFeeAmount = initialMarketplaceFeeAmount;
        // _escrowIds starts at 0
    }

    /**
     * @dev Creates a new escrow when a buyer places an offer.
     * Holds the buyer's funds (offer + fee).
     * @param _seller The address of the NFT owner/seller.
     * @param _nftContractAddress The address of the ERC721 NFT contract.
     * @param _tokenId The ID of the NFT being offered for.
     * @param _offerAmount The amount (in Wei) the buyer offers for the NFT.
     * @return escrowId The ID of the newly created escrow.
     */
    function createEscrow(
        address payable _seller,
        address _nftContractAddress,
        uint256 _tokenId,
        uint256 _offerAmount // Buyer specifies only the offer amount
    ) public payable returns (uint256) {
        require(_seller != address(0), "Seller cannot be zero address");
        require(_nftContractAddress != address(0), "NFT contract cannot be zero address");
        require(_offerAmount > 0, "Offer amount must be positive");

        uint256 requiredPayment = _offerAmount;
        require(msg.value == requiredPayment, "Incorrect ETH sent for offer");

        uint256 escrowId = _escrowIds;
        escrows[escrowId] = Escrow({
            id: escrowId,
            buyer: payable(msg.sender), // The caller is the buyer
            seller: _seller,
            nftContractAddress: _nftContractAddress,
            tokenId: _tokenId,
            offerAmount: _offerAmount,
            totalAmountPaid: msg.value, // Store the total amount paid
            status: EscrowStatus.Created,
            sellerAccepted: false
        });

        _escrowIds++;

        emit EscrowCreated(escrowId, msg.sender, _seller, _nftContractAddress, _tokenId, _offerAmount, _marketplaceFeeAmount);
        return escrowId;
    }

     /**
      * @dev Allows the seller to accept the offer, enabling the release process.
      * Important: Before calling this, the seller MUST have approved this escrow
      * contract to transfer the specific NFT via the NFT contract's `approve` function.
      * @param _escrowId The ID of the escrow to accept.
      */
     function acceptOffer(uint256 _escrowId) public {
         Escrow storage escrow = escrows[_escrowId];
         require(msg.sender == escrow.seller, "Only seller can accept");
         require(escrow.status == EscrowStatus.Created, "Escrow not in Created state");

         // Check if this contract is approved to transfer the NFT
         IERC721 nftContract = IERC721(escrow.nftContractAddress);
         require(nftContract.getApproved(escrow.tokenId) == address(this), "Escrow contract not approved to transfer NFT");

         escrow.sellerAccepted = true;
         escrow.status = EscrowStatus.Accepted; // Update status

         emit EscrowAccepted(_escrowId);
     }

    /**
     * @dev Allows the buyer to confirm receipt and release funds/NFT.
     * Transfers the offer amount to the seller, fee to marketplace, and NFT to buyer.
     * @param _escrowId The ID of the escrow to release.
     */
    function releaseFundsAndTransferNFT(uint256 _escrowId) public {
        Escrow storage escrow = escrows[_escrowId];

        require(msg.sender == escrow.buyer, "Only buyer can release funds");
        require(escrow.status == EscrowStatus.Accepted, "Escrow not accepted by seller yet"); // Must be accepted
        require(escrow.sellerAccepted, "Seller acceptance flag not set"); // Double check

        escrow.status = EscrowStatus.Released; // Mark as released immediately to prevent re-entrancy

        // 1. Transfer NFT from seller (via this contract) to buyer
        IERC721 nftContract = IERC721(escrow.nftContractAddress);
        // The escrow contract calls transferFrom because it was approved by the seller
        nftContract.safeTransferFrom(escrow.seller, escrow.buyer, escrow.tokenId);

        // 2. Transfer fee to marketplace
        (bool feeSuccess, ) = _marketplaceFeeAddress.call{value: _marketplaceFeeAmount}("");
        require(feeSuccess, "Fee transfer failed");

        // 3. Transfer offer amount to seller
        (bool sellerSuccess, ) = escrow.seller.call{value: escrow.offerAmount - _marketplaceFeeAmount}("");
        require(sellerSuccess, "Seller payment failed");

        emit EscrowReleased(_escrowId, escrow.buyer, escrow.seller, escrow.offerAmount, _marketplaceFeeAmount);
    }

    /**
     * @dev Allows the buyer or seller to cancel an escrow before it's accepted.
     * Returns the buyer's funds (the offer amount they initially paid).
     * @param _escrowId The ID of the escrow to cancel.
     */
    function cancelEscrow(uint256 _escrowId) public {
        Escrow storage escrow = escrows[_escrowId];

        // Allow cancellation only by buyer or seller
        require(msg.sender == escrow.buyer || msg.sender == escrow.seller, "Only buyer or seller can cancel");
        // Allow cancellation only if the offer hasn't been accepted yet
        require(escrow.status == EscrowStatus.Created, "Escrow not in Created state");

        escrow.status = EscrowStatus.Cancelled; // Set status to Cancelled

        // Return the full offer amount (which the buyer paid) back to the buyer
        (bool refundSuccess, ) = escrow.buyer.call{value: escrow.offerAmount}("");
        require(refundSuccess, "Buyer refund failed");

        emit EscrowCancelled(_escrowId);
    }

    // --- Functions to manage marketplace fee and address ---
    function setMarketplaceFeeAddress(address newAddress) public onlyOwner {
         require(newAddress != address(0), "Marketplace address cannot be zero");
        _marketplaceFeeAddress = newAddress;
    }

     function setMarketplaceFeeAmount(uint256 newFeeAmount) public onlyOwner {
        _marketplaceFeeAmount = newFeeAmount;
    }

    function getMarketplaceFeeAddress() public view returns (address) {
        return _marketplaceFeeAddress;
    }

    function getMarketplaceFeeAmount() public view returns (uint256) {
        return _marketplaceFeeAmount;
    }
}