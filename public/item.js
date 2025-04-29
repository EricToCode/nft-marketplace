const IPFS_GATEWAY_PREFIX = "https://gateway.pinata.cloud/ipfs/";

const ESCROW_CONTRACT_ADDRESS = '0xcF31cCad4Ada195A5DcB9b26D662e6Ae0aD32A1F'; 
const ESCROW_CONTRACT_ABI = [ { "inputs": [ { "internalType": "address", "name": "initialOwner", "type": "address" }, { "internalType": "address", "name": "initialMarketplaceFeeAddress", "type": "address" }, { "internalType": "uint256", "name": "initialMarketplaceFeeAmount", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "OwnableInvalidOwner", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "OwnableUnauthorizedAccount", "type": "error" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "escrowId", "type": "uint256" } ], "name": "EscrowAccepted", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "escrowId", "type": "uint256" } ], "name": "EscrowCancelled", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "escrowId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" }, { "indexed": true, "internalType": "address", "name": "seller", "type": "address" }, { "indexed": false, "internalType": "address", "name": "nftContractAddress", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "offerAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "feeAmount", "type": "uint256" } ], "name": "EscrowCreated", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "escrowId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "buyer", "type": "address" }, { "indexed": false, "internalType": "address", "name": "seller", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amountReleasedToSeller", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "feePaid", "type": "uint256" } ], "name": "EscrowReleased", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "inputs": [ { "internalType": "uint256", "name": "_escrowId", "type": "uint256" } ], "name": "acceptOffer", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_escrowId", "type": "uint256" } ], "name": "cancelEscrow", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address payable", "name": "_seller", "type": "address" }, { "internalType": "address", "name": "_nftContractAddress", "type": "address" }, { "internalType": "uint256", "name": "_tokenId", "type": "uint256" }, { "internalType": "uint256", "name": "_offerAmount", "type": "uint256" } ], "name": "createEscrow", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "escrows", "outputs": [ { "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "address payable", "name": "buyer", "type": "address" }, { "internalType": "address payable", "name": "seller", "type": "address" }, { "internalType": "address", "name": "nftContractAddress", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "uint256", "name": "offerAmount", "type": "uint256" }, { "internalType": "uint256", "name": "totalAmountPaid", "type": "uint256" }, { "internalType": "enum NFTEscrow.EscrowStatus", "name": "status", "type": "uint8" }, { "internalType": "bool", "name": "sellerAccepted", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getMarketplaceFeeAddress", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getMarketplaceFeeAmount", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "bytes", "name": "", "type": "bytes" } ], "name": "onERC721Received", "outputs": [ { "internalType": "bytes4", "name": "", "type": "bytes4" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_escrowId", "type": "uint256" } ], "name": "releaseFundsAndTransferNFT", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newAddress", "type": "address" } ], "name": "setMarketplaceFeeAddress", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "newFeeAmount", "type": "uint256" } ], "name": "setMarketplaceFeeAmount", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ];
const MARKETPLACE_FEE_ETH = "0.002";

fetch('/api/me').then(r => { if (r.status === 401) window.location = 'index.html'; });

let provider;
let signer;
let currentUser = null; 
let item = null; 

if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
} else {
    console.warn("MetaMask not detected. Blockchain interactions disabled.");
}

function getImageUrl(ipfsUri) {
    if (!ipfsUri || !ipfsUri.startsWith("ipfs://")) {
        return null;
    }
    const cid = ipfsUri.substring(7);
    return `${IPFS_GATEWAY_PREFIX}${cid}`;
}

// Fetch current user info
async function fetchCurrentUser() {
    try {
        const response = await fetch('/api/me');
        if (response.status === 401) { window.location = 'index.html'; return null; }
        if (!response.ok) { throw new Error('Failed to fetch user info'); }
        currentUser = await response.json();
        console.log("Current User:", currentUser);
    } catch (error) {
        console.error("Error fetching current user:", error);
        document.getElementById('info').innerHTML = `<p class="error-message">Error fetching user data. Please refresh.</p>`;
    }
}

// --- Function to handle placing an offer (NO Escrow Creation Here) ---
async function placeOffer() {
    const offerInput = document.getElementById('offerAmount');
    const statusDiv = document.getElementById('offer-status');
    const offerAmountEth = offerInput.value.trim();
    const offerButton = document.querySelector('#action-area button');

    if (offerButton) {
        offerButton.disabled = true;
        offerButton.textContent = 'Submitting...';
    }

    if (!item) { statusDiv.textContent = "Error: Item data not loaded."; if (offerButton) offerButton.disabled = false; return; }
    if (!currentUser || !currentUser.id) { statusDiv.textContent = "Error: Please log in first."; if (offerButton) offerButton.disabled = false; return; }

    if (!offerAmountEth || isNaN(parseFloat(offerAmountEth)) || parseFloat(offerAmountEth) <= 0) {
        statusDiv.textContent = "Please enter a valid positive offer amount in ETH.";
        statusDiv.className = 'error-message';
        if (offerButton) {
            offerButton.disabled = false; 
            offerButton.textContent = 'Place Offer';
        }
        return;
    }

    statusDiv.textContent = "Submitting offer to server...";
    statusDiv.className = '';

    try {

        const backendResponse = await fetch('/api/offers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                itemId: item.id,
                offerAmountEth: offerAmountEth
            })
        });

        const backendResult = await backendResponse.json();
        if (!backendResponse.ok || !backendResult.success) {
            throw new Error(`Failed to place offer: ${backendResult.error || 'Unknown backend error'}`);
        }

        statusDiv.textContent = "✅ Offer submitted! Waiting for seller response.";
        statusDiv.className = 'success-message';

        document.getElementById('action-area').innerHTML = '<p>Your offer has been placed and is awaiting seller review.</p>';

    } catch (error) {
        console.error("Offer submission failed:", error);
        statusDiv.textContent = `❌ Offer Submission Failed: ${error.message}`;
        statusDiv.className = 'error-message';

        if (offerButton) {
            offerButton.disabled = false;
            offerButton.textContent = 'Place Offer';
        }
    }
}

async function deleteListing() {
    const statusDiv = document.getElementById('offer-status');
    if (!item) { statusDiv.textContent = "Error: Item data not loaded."; return; }

    if (!confirm(`Are you sure you want to delete the listing for "${item.name}"? This cannot be undone.`)) {
        return;
    }

    statusDiv.textContent = "Deleting listing...";
    statusDiv.className = '';

    try {
        const response = await fetch(`/api/items/${item.id}`, {
            method: 'DELETE'
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || `HTTP error! status: ${response.status}`);
        }

        statusDiv.textContent = "Listing deleted successfully. Redirecting...";
        statusDiv.className = 'success-message';

        setTimeout(() => { window.location.href = 'browse.html'; }, 1000);

    } catch (error) {
        console.error("Failed to delete listing:", error);
        statusDiv.textContent = `❌ Deletion Failed: ${error.message}`;
        statusDiv.className = 'error-message';
    }
}


async function show() {
    const infoDiv = document.getElementById('info');
    const actionAreaDiv = document.getElementById('action-area');
    const statusDiv = document.getElementById('offer-status');
    const id = new URLSearchParams(location.search).get('id');

    actionAreaDiv.style.display = 'none'; 
    statusDiv.textContent = ''; 

    if (!id) { 
        infoDiv.innerHTML = '<p class="error-message">Error: No item ID specified.</p>';
        return;
     }

    // Fetch user info first
    await fetchCurrentUser();
    if (!currentUser) return;

    try {
        const response = await fetch(`/api/items/${id}`);
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
            throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
        }
        item = await response.json();
        console.log("Item owner user id:", item.user_id);

        if (!item || item.error) {
          throw new Error(item.error || 'Item not found.');
        }

        // Start building HTML
        let html = `<h1>${item.name || 'Unnamed Item'}</h1>`;
        html += `<p><strong>Category:</strong> ${item.category || 'N/A'}</p>`;
        html += `<p><strong>Status:</strong> ${item.status || 'N/A'}</p>`;
        if (item.description) html += `<p>${item.description}</p>`;

        html += '<div id="item-images">'; 
        const frontImageUrl = getImageUrl(item.front_image);
        const backImageUrl = getImageUrl(item.back_image);

        if (frontImageUrl) {
          html += `<img src="${frontImageUrl}" alt="Front image of ${item.name || 'item'}" title="Front View">`;
        } else {
          html += '<p><em>Front image not available.</em></p>';
        }
        if (backImageUrl) {
          html += `<img src="${backImageUrl}" alt="Back image of ${item.name || 'item'}" title="Back View">`;
        }
        html += '</div>';


        if (item.category === 'watches') {
          html += `<p><strong>Serial #:</strong> ${item.serial_number || 'N/A'}</p>`;
          html += `<p><strong>Case Color:</strong> ${item.case_color || 'N/A'}</p>`;
          html += `<p><strong>Dial Color:</strong> ${item.dial_color || 'N/A'}</p>`;
        } else if (item.category === 'pokemon') {
          html += `<p><strong>Rarity:</strong> ${item.rarity || 'N/A'}</p>`;
          html += `<p><strong>Set #:</strong> ${item.set_number || 'N/A'}</p>`;
        }


        html += `<p><strong>Owner:</strong> ${item.owner_username || 'N/A'}</p>`;

        if (item.contract_address && item.token_id) {
             html += `<p><strong>Contract:</strong> ${item.contract_address} <br><strong>Token ID:</strong> ${item.token_id}</p>`;
        }


        infoDiv.innerHTML = html; // Update the page content

        // --- Display Action Button ---
        actionAreaDiv.innerHTML = ''; // Clear previous actions
        if (item.status === 'listed') { // Only allow actions if listed
            if (currentUser.id === item.user_id) {
                // Current user is the owner
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete Listing';
                deleteButton.onclick = deleteListing; // Attach handler
                actionAreaDiv.appendChild(deleteButton);
            } else {
                // Current user is NOT the owner - show offer controls
                const offerLabel = document.createElement('label');
                offerLabel.htmlFor = 'offerAmount';
                offerLabel.textContent = 'Offer Amount (ETH):';
                actionAreaDiv.appendChild(offerLabel);

                const offerInput = document.createElement('input');
                offerInput.type = 'number';
                offerInput.id = 'offerAmount';
                offerInput.step = '0.0001'; 
                offerInput.min = '0.002';
                offerInput.placeholder = 'e.g., 0.05 (Minimum: 0.002)';
                actionAreaDiv.appendChild(offerInput);

                const offerButton = document.createElement('button');
                offerButton.textContent = 'Place Offer';
                offerButton.onclick = placeOffer;
                actionAreaDiv.appendChild(offerButton);
            }
            actionAreaDiv.style.display = 'block';
        } else {
                actionAreaDiv.innerHTML = `<p><em>This item is currently ${item.status} and cannot be purchased or deleted.</em></p>`;
                actionAreaDiv.style.display = 'block';
        }

    } catch (error) {
        console.error("Failed to load item details:", error);
        infoDiv.innerHTML = `<p class="error-message">Error loading item details: ${error.message}</p>`;
    }
}
show();