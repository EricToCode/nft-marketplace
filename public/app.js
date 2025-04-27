// Shared frontend logic
// --- ADD: Escrow Contract Address and ABIs ---
const ESCROW_CONTRACT_ADDRESS = '0xcF31cCad4Ada195A5DcB9b26D662e6Ae0aD32A1F';
const ESCROW_CONTRACT_ABI = [ { "inputs": [ { "internalType": "address", "name": "initialOwner", "type": "address" }, { "internalType": "address", "name": "initialMarketplaceFeeAddress", "type": "address" }, { "internalType": "uint256", "name": "initialMarketplaceFeeAmount", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "OwnableInvalidOwner", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "OwnableUnauthorizedAccount", "type": "error" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "escrowId", "type": "uint256" } ], "name": "EscrowAccepted", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "escrowId", "type": "uint256" } ], "name": "EscrowCancelled", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "escrowId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" }, { "indexed": true, "internalType": "address", "name": "seller", "type": "address" }, { "indexed": false, "internalType": "address", "name": "nftContractAddress", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "offerAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "feeAmount", "type": "uint256" } ], "name": "EscrowCreated", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "escrowId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "buyer", "type": "address" }, { "indexed": false, "internalType": "address", "name": "seller", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amountReleasedToSeller", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "feePaid", "type": "uint256" } ], "name": "EscrowReleased", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "inputs": [ { "internalType": "uint256", "name": "_escrowId", "type": "uint256" } ], "name": "acceptOffer", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_escrowId", "type": "uint256" } ], "name": "cancelEscrow", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address payable", "name": "_seller", "type": "address" }, { "internalType": "address", "name": "_nftContractAddress", "type": "address" }, { "internalType": "uint256", "name": "_tokenId", "type": "uint256" }, { "internalType": "uint256", "name": "_offerAmount", "type": "uint256" } ], "name": "createEscrow", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "escrows", "outputs": [ { "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "address payable", "name": "buyer", "type": "address" }, { "internalType": "address payable", "name": "seller", "type": "address" }, { "internalType": "address", "name": "nftContractAddress", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "uint256", "name": "offerAmount", "type": "uint256" }, { "internalType": "uint256", "name": "totalAmountPaid", "type": "uint256" }, { "internalType": "enum NFTEscrow.EscrowStatus", "name": "status", "type": "uint8" }, { "internalType": "bool", "name": "sellerAccepted", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getMarketplaceFeeAddress", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getMarketplaceFeeAmount", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "bytes", "name": "", "type": "bytes" } ], "name": "onERC721Received", "outputs": [ { "internalType": "bytes4", "name": "", "type": "bytes4" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_escrowId", "type": "uint256" } ], "name": "releaseFundsAndTransferNFT", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newAddress", "type": "address" } ], "name": "setMarketplaceFeeAddress", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "newFeeAmount", "type": "uint256" } ], "name": "setMarketplaceFeeAmount", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ];
const NFT_CONTRACT_ABI = [ { "inputs": [ { "internalType": "address", "name": "initialOwner", "type": "address" }, { "internalType": "string", "name": "_name", "type": "string" }, { "internalType": "string", "name": "_symbol", "type": "string" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "address", "name": "owner", "type": "address" } ], "name": "ERC721IncorrectOwner", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "ERC721InsufficientApproval", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "approver", "type": "address" } ], "name": "ERC721InvalidApprover", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "operator", "type": "address" } ], "name": "ERC721InvalidOperator", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "ERC721InvalidOwner", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "receiver", "type": "address" } ], "name": "ERC721InvalidReceiver", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" } ], "name": "ERC721InvalidSender", "type": "error" }, { "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "ERC721NonexistentToken", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "OwnableInvalidOwner", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "OwnableUnauthorizedAccount", "type": "error" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "approved", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "approved", "type": "bool" } ], "name": "ApprovalForAll", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "_fromTokenId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_toTokenId", "type": "uint256" } ], "name": "BatchMetadataUpdate", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "_tokenId", "type": "uint256" } ], "name": "MetadataUpdate", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "getApproved", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getNextTokenId", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "operator", "type": "address" } ], "name": "isApprovedForAll", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "string", "name": "tokenURI_", "type": "string" } ], "name": "mintItem", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "ownerOf", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" } ], "name": "setApprovalForAll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" } ], "name": "supportsInterface", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "tokenURI", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ];

let provider;
let signer;
let currentUser = null; // Store current user {id, username, wallet}

if (window.ethereum) {
    try {
        // Explicitly connect to Sepolia via MetaMask's injected provider
        provider = new ethers.providers.Web3Provider(window.ethereum, 'sepolia');
        signer = provider.getSigner();
        console.log("Ethers provider initialized for Sepolia.");

        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
            console.log('MetaMask account changed:', accounts);
            if (currentUser && accounts.length > 0) {
                 document.getElementById('wallet-address').innerText = accounts[0];
                 fetch('/api/connect-wallet', {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({ address: accounts[0] })
                 }).then(res => {
                     if(res.ok) {
                         currentUser.wallet = accounts[0];
                         signer = provider.getSigner(); // Update signer
                         console.log("Wallet reconnected with new account:", accounts[0]);
                         loadOffers(); // Reload offers
                     } else { console.error("Failed to update backend with new wallet address."); }
                 }).catch(err => console.error("Error updating backend wallet:", err));
            } else if (accounts.length === 0) {
                 console.log("MetaMask disconnected.");
                 document.getElementById('wallet-address').innerText = 'Not Connected';
                 if (currentUser) currentUser.wallet = null;
                 signer = null; // Clear signer
                 loadOffers(); // Reload offers
            }
        });

        // Listen for network changes
        window.ethereum.on('chainChanged', (chainId) => {
            console.log('MetaMask network changed:', chainId);
            window.location.reload(); // Reload page to re-initialize
        });

    } catch (error) {
        console.error("Error initializing Ethers provider:", error);
        alert("Could not initialize connection to Ethereum wallet. Please ensure MetaMask is installed and configured correctly.");
    }
} else {
    console.warn("MetaMask not detected.");
    alert("MetaMask is not installed. Please install MetaMask to use blockchain features.");
}


async function onLogin() {
  // Verify session and show wallet UI
  const me = await fetch('/api/me');
  if (me.status === 401) return;
  const { username, wallet } = await me.json();
  document.getElementById('display-user').innerText = username;
  document.getElementById('auth').style.display   = 'none';
  document.getElementById('wallet').style.display = 'block';
  document.getElementById('incoming-offers').style.display = 'block';
  document.getElementById('outgoing-offers').style.display = 'block';

  // Update the wallet address display if a wallet is already connected
  if (wallet) {
    document.getElementById('wallet-address').innerText = wallet;
  } else {
    document.getElementById('wallet-address').innerText = 'Not Connected';
  }

  await loadOffers();
}

document.getElementById('btnRegister').onclick = async () => {
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ username, password })
  });
  if (res.ok) return onLogin();
  document.getElementById('error').innerText = 'Registration failed';
};

document.getElementById('btnLogin').onclick = async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ username, password })
  });
  if (res.ok) return onLogin();
  document.getElementById('error').innerText = 'Login failed';
};

document.getElementById('btnConnect').onclick = async () => {
  if (!window.ethereum) return alert('Please install MetaMask.');
  const [address] = await window.ethereum.request({ method: 'eth_requestAccounts' });
  document.getElementById('wallet-address').innerText = address;
  await fetch('/api/connect-wallet', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ address })
  });
};

// Auto-run on index.html load
if (document.getElementById('auth')) {
  onLogin();
}

// --- ADD: Function to handle Seller Accepting Offer ---
async function acceptOffer(offerId, escrow_id, nftContractAddress, tokenId, statusElementId) {
    const statusDiv = document.getElementById(statusElementId);
    // --- Check provider and signer ---
    if (!provider || !signer) {
        statusDiv.textContent = "Error: MetaMask connection issue. Please ensure wallet is connected and refresh.";
        statusDiv.className = 'status-message error-message';
        return;
    }
    // --- Check contract addresses and ABIs ---
    if (!ESCROW_CONTRACT_ADDRESS || ESCROW_CONTRACT_ADDRESS === "YOUR_DEPLOYED_ESCROW_CONTRACT_ADDRESS") {
        statusDiv.textContent = "Error: Escrow contract address not configured in app.js.";
        statusDiv.className = 'status-message error-message';
        return;
    }
     if (!ethers.utils.isAddress(ESCROW_CONTRACT_ADDRESS)) {
        statusDiv.textContent = `Error: Invalid Escrow contract address format: ${ESCROW_CONTRACT_ADDRESS}`;
        statusDiv.className = 'status-message error-message';
        return;
    }
    if (!ethers.utils.isAddress(nftContractAddress)) {
        statusDiv.textContent = `Error: Invalid NFT contract address format passed: ${nftContractAddress}`;
        statusDiv.className = 'status-message error-message';
        return;
    }
    if (!ESCROW_CONTRACT_ABI || ESCROW_CONTRACT_ABI.length === 0) {
        statusDiv.textContent = "Error: Escrow contract ABI not configured.";
        statusDiv.className = 'status-message error-message';
        return;
    }
    if (!NFT_CONTRACT_ABI || NFT_CONTRACT_ABI.length === 0) {
        statusDiv.textContent = "Error: NFT contract ABI not configured.";
        statusDiv.className = 'status-message error-message';
        return;
    }

    statusDiv.textContent = "Processing acceptance...";
    statusDiv.className = 'status-message';

    try {
        // --- Get a potentially refreshed signer instance ---
        // Although the global signer should work, this ensu    res we use the latest state
        const currentSigner = provider.getSigner();
        const signerAddress = await currentSigner.getAddress();
        console.log(`Accepting offer ${offerId} using signer: ${signerAddress}`);

        // 1. Prompt seller to approve NFT transfer to Escrow contract
        statusDiv.innerHTML = `<b>Action Required:</b> Please approve the Escrow contract (${ESCROW_CONTRACT_ADDRESS}) to transfer your NFT (Token ID: ${tokenId}) using MetaMask.`;

        // --- Instantiate NFT Contract ---
        const nftContract = new ethers.Contract(nftContractAddress, NFT_CONTRACT_ABI, currentSigner); // Use currentSigner

        // --- Check current approval status (optional but good practice) ---
        const currentApproval = await nftContract.getApproved(tokenId);
        console.log(`Current approval for token ${tokenId}: ${currentApproval}`);
        if (currentApproval.toLowerCase() !== ESCROW_CONTRACT_ADDRESS.toLowerCase()) {
            console.log(`Approving Escrow contract (${ESCROW_CONTRACT_ADDRESS}) for token ${tokenId}...`);
            const approveTx = await nftContract.approve(ESCROW_CONTRACT_ADDRESS, tokenId);
            statusDiv.textContent = `Approval transaction sent (${approveTx.hash}). Waiting for confirmation...`;
            await approveTx.wait(1); // Wait for 1 confirmation
            statusDiv.textContent = "NFT transfer approved!";
        } else {
             statusDiv.textContent = "NFT transfer already approved.";
             console.log(`Escrow contract already approved for token ${tokenId}.`);
        }

        statusDiv.textContent = "Now confirming acceptance with Escrow contract...";

        // 2. Call acceptOffer on Escrow Contract
        // --- Instantiate Escrow Contract ---
         const escrowContract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_CONTRACT_ABI, currentSigner); // Use currentSigner

         console.log(`Calling acceptOffer on ${ESCROW_CONTRACT_ADDRESS} for escrowId ${offerId}...`);
         const acceptTx = await escrowContract.acceptOffer(escrow_id); // Assuming offerId is the escrowId

         statusDiv.textContent = `Acceptance transaction sent (${acceptTx.hash}). Waiting for confirmation...`;
         await acceptTx.wait(1); // Wait for 1 confirmation
         statusDiv.textContent = "Escrow acceptance confirmed on blockchain! Updating server status...";


        // 3. Update backend status
        const response = await fetch(`/api/offers/${offerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'accept' }) // Server will set status to 'processing'
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            // Log the error but proceed since the blockchain part succeeded
            console.error(`Backend update failed: ${result.error || 'Unknown server error'}`);
            statusDiv.textContent = `⚠️ Offer accepted on blockchain, but server update failed. Status might be inconsistent.`;
            statusDiv.className = 'status-message error-message'; // Use error style as a warning
        } else {
            statusDiv.textContent = `✅ Offer accepted! Waiting for buyer to confirm receipt.`;
            statusDiv.className = 'status-message success-message';
        }

        // Reload offers to reflect the change regardless of backend update success
        loadOffers();

    } catch (error) {
        console.error("Accept offer failed:", error);
        // Provide more specific feedback if possible
        let errorMessage = error.reason || error.message || "An unknown error occurred.";
        // Check if it's the ENS error again, despite the fix attempt
        if (error.code === 'UNSUPPORTED_OPERATION' && error.operation === 'getResolver') {
            errorMessage = `Network does not support ENS (getResolver failed). Check MetaMask network and RPC connection. (${error.message})`;
        } else if (error.code === 'ACTION_REJECTED') {
             errorMessage = "Transaction rejected in MetaMask.";
        } else if (error.error?.message) { // Check for nested error messages (common with contract reverts)
             errorMessage = error.error.message;
        }
        statusDiv.textContent = `❌ Acceptance Failed: ${errorMessage}`;
        statusDiv.className = 'status-message error-message';
    }
}

// --- ADD: Function to handle Seller Declining Offer ---
async function declineOffer(offerId, escrow_id, statusElementId) {
    const statusDiv = document.getElementById(statusElementId);
    statusDiv.textContent = "Declining offer...";
    statusDiv.className = 'status-message';

    try {
       // 1. Call backend API to update status to 'declined'
       const response = await fetch(`/api/offers/${offerId}`, {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ action: 'decline' })
       });
       const result = await response.json();
       if (!response.ok || !result.success) {
           // If backend fails, don't proceed to contract cancellation
           throw new Error(result.error || `Failed to update offer status on server.`);
       }

       statusDiv.textContent = `Offer declined on server. Now cancelling on blockchain...`;

       // **** ADDED: Call cancelOffer to refund buyer via contract ****
       // Note: This assumes the seller declining also triggers the refund.
       // The cancelOffer function handles the contract interaction and UI updates.
       await cancelOffer(escrow_id, statusElementId, true); // Pass true to indicate it's part of decline flow
       // The final status message will be set by cancelOffer upon completion/failure.
       // loadOffers() is called within cancelOffer.
       // **** END ADDED ****

    } catch (error) {
        console.error("Decline offer process failed:", error);
        statusDiv.textContent = `❌ Decline Failed: ${error.message}`;
        statusDiv.className = 'status-message error-message';
        // Reload offers even on failure to ensure UI consistency
        loadOffers();
    }
}

 // --- ADD: Function to handle Buyer Confirming Receipt ---
 async function confirmReceipt(offerId, escrowId, statusElementId) {
     const statusDiv = document.getElementById(statusElementId);
     if (!provider || !signer) { statusDiv.textContent = "Error: MetaMask connection issue."; return; }
     if (!ESCROW_CONTRACT_ADDRESS || ESCROW_CONTRACT_ADDRESS === "YOUR_DEPLOYED_ESCROW_CONTRACT_ADDRESS") { statusDiv.textContent = "Error: Escrow contract address not configured."; return; }
     if (ESCROW_CONTRACT_ABI.length === 0) { statusDiv.textContent = "Error: Escrow contract ABI not configured."; return; }
     if (escrowId === undefined || escrowId === null) { statusDiv.textContent = "Error: Missing Escrow ID for this offer."; return;}


     statusDiv.textContent = "Preparing release transaction...";
     statusDiv.className = 'status-message';

     try {
         // Instantiate the Escrow Contract
         const escrowContract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_CONTRACT_ABI, signer);

         statusDiv.textContent = "Please confirm the transaction in MetaMask to release funds and receive NFT...";

         // Call the release function
         const tx = await escrowContract.releaseFundsAndTransferNFT(escrowId);

         statusDiv.textContent = `Release transaction sent (${tx.hash}). Waiting for confirmation...`;
         console.log("Release Escrow Tx:", tx);

         const receipt = await tx.wait(1); // Wait for 1 confirmation
         console.log("Transaction confirmed:", receipt);
         statusDiv.textContent = "Blockchain release successful! Updating server status...";

         // --- Call backend API to update status to fulfilled ---
         const backendResponse = await fetch(`/api/offers/${offerId}`, {
             method: 'PUT',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ action: 'confirmReceived' })
         });

         const backendResult = await backendResponse.json();
         if (!backendResponse.ok || !backendResult.success) {
             // Log error but proceed, blockchain tx succeeded
             console.error(`Failed to update offer status on server: ${backendResult.error || 'Unknown backend error'}`);
             statusDiv.textContent = `⚠️ Blockchain transaction succeeded, but server update failed. Please contact support if needed.`;
             statusDiv.className = 'status-message error-message'; // Use error style for warning
         } else {
            statusDiv.textContent = "✅ Transaction complete! Item received and funds released.";
            statusDiv.className = 'status-message success-message';
         }

         // Reload offers to remove this one from active lists
         loadOffers();

     } catch (error) {
         console.error("Confirm receipt failed:", error);
         statusDiv.textContent = `❌ Confirmation Failed: ${error.reason || error.message}`;
         statusDiv.className = 'status-message error-message';
     }
 }

async function cancelOffer(offerId, statusElementId, calledFromDecline = false) {
    const statusDiv = document.getElementById(statusElementId);
    // Basic checks
    if (!provider || !signer) {
        statusDiv.textContent = "Error: MetaMask connection issue.";
        statusDiv.className = 'status-message error-message';
        return; // Indicate failure if called from decline
    }
    if (!ESCROW_CONTRACT_ADDRESS || !ethers.utils.isAddress(ESCROW_CONTRACT_ADDRESS)) {
        statusDiv.textContent = "Error: Escrow contract address not configured or invalid.";
        statusDiv.className = 'status-message error-message';
        return;
    }
    if (!ESCROW_CONTRACT_ABI || ESCROW_CONTRACT_ABI.length === 0) {
        statusDiv.textContent = "Error: Escrow contract ABI not configured.";
        statusDiv.className = 'status-message error-message';
        return;
    }
     if (offerId === undefined || offerId === null || isNaN(parseInt(offerId))) {
         statusDiv.textContent = "Error: Invalid Offer ID for cancellation.";
         statusDiv.className = 'status-message error-message';
         return;
     }

    // Don't overwrite "Declining..." message if called from declineOffer
    if (!calledFromDecline) {
        statusDiv.textContent = "Processing cancellation...";
        statusDiv.className = 'status-message';
    }

    try {
        // Get signer and contract instance
        const currentSigner = provider.getSigner();
        const signerAddress = await currentSigner.getAddress();
        console.log(`DEBUG: Attempting to cancel offer ${offerId} using signer address: ${signerAddress}`);
        const escrowContract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_CONTRACT_ABI, currentSigner);

        statusDiv.textContent = "Please confirm the cancellation transaction in MetaMask...";

        // Call the cancelEscrow function on the contract
        console.log(`DEBUG: Calling cancelEscrow on ${ESCROW_CONTRACT_ADDRESS} for escrowId ${offerId}...`);
        const tx = await escrowContract.cancelEscrow(offerId); // offerId is the escrowId

        statusDiv.textContent = `Cancellation transaction sent (${tx.hash}). Waiting for confirmation...`;
        await tx.wait(1);

        // Success message depends on how it was called
        if (calledFromDecline) {
             statusDiv.textContent = "✅ Offer declined & funds returned to buyer.";
        } else {
             statusDiv.textContent = "✅ Offer cancelled successfully. Funds returned to buyer.";
        }
        statusDiv.className = 'status-message success-message';

        // Reload offers to reflect the change
        loadOffers();
        return true; // Indicate success if called from decline

    } catch (error) {
        console.error("Cancel offer failed:", error);
        let errorMessage = error.reason || error.message || "An unknown error occurred.";
        if (error.code === 'ACTION_REJECTED') {
            errorMessage = "Transaction rejected in MetaMask.";
        } else if (error.error?.message) {
            errorMessage = error.error.message;
        } else if (errorMessage.includes("Escrow not in Created state")) {
            errorMessage = "Offer cannot be cancelled as it has already been accepted or processed.";
        } else if (errorMessage.includes("Only buyer or seller can cancel")) {
            errorMessage = "You are not authorized to cancel this offer.";
        }
        // Update status message based on how it was called
        if (calledFromDecline) {
             statusDiv.textContent = `❌ Decline successful on server, but blockchain cancellation failed: ${errorMessage}`;
        } else {
             statusDiv.textContent = `❌ Cancellation Failed: ${errorMessage}`;
        }
        statusDiv.className = 'status-message error-message';
        loadOffers(); // Reload offers even on failure
        return false; // Indicate failure if called from decline
    }
}

// --- ADD: Function to load and display offers ---
async function loadOffers() {
    const incomingList = document.getElementById('incoming-list');
    const outgoingList = document.getElementById('outgoing-list');
    const noIncoming = document.getElementById('no-incoming');
    const noOutgoing = document.getElementById('no-outgoing');

    if (!incomingList || !outgoingList || !noIncoming || !noOutgoing) {
        console.error("Offer list elements not found.");
        return;
    }

    incomingList.innerHTML = '';
    outgoingList.innerHTML = '';
    noIncoming.style.display = 'block';
    noOutgoing.style.display = 'block';

    try {
        const response = await fetch('/api/offers');
        if (!response.ok) {
             const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
             if (response.status === 401) {
                 console.log("User not logged in, cannot load offers.");
                 document.getElementById('incoming-offers').style.display = 'none';
                 document.getElementById('outgoing-offers').style.display = 'none';
                 return;
             }
             throw new Error(errorData.error || `Failed to fetch offers: ${response.statusText}`);
        }
        const offers = await response.json();

        if (offers && offers.length > 0) {
            offers.forEach(offer => {
                if (offer.offer_id === undefined || !offer.item_name || offer.offer_amount_eth === undefined || !offer.user_role) {
                    console.warn("Skipping incomplete offer data:", offer);
                    return;
                }

                const li = document.createElement('li');
                li.className = 'offer-item';
                const statusElementId = `offer-status-${offer.offer_id}`;

                const imageUrl = offer.item_image ? `https://gateway.pinata.cloud/ipfs/${offer.item_image.replace('ipfs://', '')}` : 'https://placehold.co/60x60/eee/ccc?text=No+Image';
                const imageHtml = `<img src="${imageUrl}" alt="${offer.item_name}" class="offer-item-image" onerror="this.src='https://placehold.co/60x60/eee/ccc?text=Error'; this.onerror=null;">`;

                let detailsHtml = `<div class="offer-details">
                    ${imageHtml}
                    <div>
                        <strong>${offer.item_name}</strong> (${offer.item_category || 'N/A'})<br>
                        <span>Offer: ${offer.offer_amount_eth} ETH</span><br>`;

                let actionsHtml = '<div class="offer-actions">';
                let statusMessageHtml = `<div id="${statusElementId}" class="status-message"></div>`;

                // --- Seller's View ---
                if (offer.user_role === 'seller') {
                    noIncoming.style.display = 'none';
                    detailsHtml += `<span>Buyer: ${offer.buyer_username || 'Unknown'}</span>`;
                    if (offer.offer_status === 'active') { // 'active' on backend corresponds to 'Created' in contract
                        if (offer.item_contract_address && offer.item_token_id !== undefined) {
                             actionsHtml += `<button onclick="acceptOffer(${offer.offer_id}, ${offer.escrow_id}, '${offer.item_contract_address}', ${offer.item_token_id}, '${statusElementId}')">Accept</button>`;
                        } else {
                             actionsHtml += `<span class="status-error">Cannot accept (missing NFT details)</span>`;
                        }
                        // **** MODIFIED: Call declineOffer which now handles cancellation ****
                        actionsHtml += `<button onclick="declineOffer(${offer.offer_id}, ${offer.escrow_id}, '${statusElementId}')">Decline</button>`;
                        // **** REMOVED Seller Cancel Button - Decline handles it ****
                        // actionsHtml += `<button class="cancel-button" onclick="cancelOffer(${offer.offer_id}, '${statusElementId}')">Cancel</button>`;
                    } else if (offer.offer_status === 'processing' || offer.offer_status === 'accepted') {
                         actionsHtml += `<span class="status-processing">Accepted (Waiting for buyer confirmation)</span>`;
                    } else {
                         actionsHtml += `<span class="status-${offer.offer_status}">Status: ${offer.offer_status}</span>`; // Show declined, fulfilled, etc.
                    }
                }
                // --- Buyer's View ---
                else { // User is buyer
                    noOutgoing.style.display = 'none';
                    detailsHtml += `<span>Seller: ${offer.seller_username || 'Unknown'}</span>`;
                    if (offer.offer_status === 'active') { // 'active' on backend corresponds to 'Created' in contract
                        actionsHtml += `<span class="status-active">Offer Pending Seller</span>`;
                        // **** ADDED: Cancel Button for Buyer ****
                        actionsHtml += `<button class="cancel-button" onclick="declineOffer(${offer.offer_id}, ${offer.escrow_id}, '${statusElementId}')">Cancel Offer</button>`;
                    } else if (offer.offer_status === 'processing' || offer.offer_status === 'accepted') {
                        if (offer.escrow_id !== undefined && offer.escrow_id !== null) {
                            actionsHtml += `<button onclick="confirmReceipt(${offer.offer_id}, ${offer.escrow_id}, '${statusElementId}')">Confirm Item Received</button>`;
                        } else {
                            actionsHtml += `<span class="status-error">Cannot confirm receipt (missing escrow ID)</span>`;
                        }
                    } else {
                         actionsHtml += `<span class="status-${offer.offer_status}">Status: ${offer.offer_status}</span>`; // Show declined, fulfilled, etc.
                    }
                }

                detailsHtml += `</div></div>`;
                actionsHtml += `</div>`;
                li.innerHTML = detailsHtml + actionsHtml + statusMessageHtml;

                if (offer.user_role === 'seller') {
                    incomingList.appendChild(li);
                } else {
                    outgoingList.appendChild(li);
                }
            });
        }
    } catch (error) {
        console.error("Error loading offers:", error);
        noIncoming.style.display = 'none';
        noOutgoing.style.display = 'none';
        incomingList.innerHTML = `<li>Error loading incoming offers: ${error.message}</li>`;
        outgoingList.innerHTML = `<li>Error loading outgoing offers: ${error.message}</li>`;
    }
}

async function onLogout() {
    console.log("Logging out...");
    try {
        // Call the backend API to destroy the session
        const res = await fetch('/api/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // No body needed usually, unless you send CSRF tokens etc.
        });

        if (!res.ok) {
            // Log error but proceed with client-side logout anyway
            console.error("Server logout failed:", res.status, await res.text());
        }

    } catch (error) {
        console.error("Error during logout fetch:", error);
        // Proceed with client-side logout even if fetch fails
    } finally {
        // Always redirect to index.html after attempting logout
        window.location.href = 'index.html';
        // Clear local state (optional, as redirect handles UI)
        currentUser = null;
    }
}

// --- Initial Load ---
// Use DOMContentLoaded to ensure HTML elements are available before attaching listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    // Ensure the button exists before assigning the listener
    const logoutButton = document.getElementById('btnLogout');
    if (logoutButton) {
        logoutButton.onclick = onLogout; // Assign the onLogout function directly
        console.log("Logout button .onclick listener attached.");
    } else {
        console.warn("Logout button ('btnLogout') not found on initial DOM load.");
    }
});