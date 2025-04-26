const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const ethers = require('ethers');
const axios = require('axios'); // Keep axios if needed elsewhere, fetch used for metadata
const path = require('path');
const multer = require('multer'); // For handling file uploads
const pinataSDK = require('@pinata/sdk'); // Pinata SDK for IPFS
const fs = require('fs'); // File system module for reading uploaded files
require('dotenv').config(); // Load environment variables from .env file

const app = express();

// --- Configuration ---
const PINATA_JWT = process.env.PINATA_JWT;
let pinata = null;

if (!PINATA_JWT) {
    console.warn("Warning: PINATA_JWT not found in environment variables. IPFS uploads will fail.");
} else {
    try {
        const PINATA_API_KEY = process.env.PINATA_API_KEY;
        const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

        if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
             console.warn("Warning: PINATA_API_KEY or PINATA_SECRET_API_KEY not found for @pinata/sdk. IPFS uploads will fail.");
        } else {
            pinata = new pinataSDK(PINATA_API_KEY, PINATA_SECRET_API_KEY);
            console.log("Pinata SDK (@pinata/sdk) initialized with API Key/Secret.");
        }

    } catch (sdkError) {
        console.error("CRITICAL ERROR: Failed to initialize Pinata SDK (@pinata/sdk).", sdkError);
        pinata = null; // Ensure pinata is null if initialization fails
    }
}

// Ethereum Sepolia Configuration (Ensure these are set in your .env file)
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com/"; // Default public node
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY; // Private key of the wallet deploying contracts
if (!DEPLOYER_PRIVATE_KEY) {
    console.warn("Warning: DEPLOYER_PRIVATE_KEY not found in environment variables. Contract deployment will fail.");
}
const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
const signer = DEPLOYER_PRIVATE_KEY ? new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider) : null; // Wallet to pay for deployment/minting gas

// Load the single, pre-deployed contract address from environment variables
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
if (!NFT_CONTRACT_ADDRESS || !ethers.isAddress(NFT_CONTRACT_ADDRESS)) {
     console.error("CRITICAL ERROR: NFT_CONTRACT_ADDRESS is missing or invalid in .env file. Server cannot mint.");
     // Optionally exit the process if this is critical: process.exit(1);
} else {
    console.log(`Using NFT Contract Address: ${NFT_CONTRACT_ADDRESS}`);
}

// Load ABI from the *new* MarketplaceNFT contract JSON artifact
let marketplaceContractJson;
try {
    // Make sure MarketplaceNFT.json (from compiling MarketplaceNFT.sol) is in the project root
    marketplaceContractJson = require('./MarketplaceNFT.json');
    if (!marketplaceContractJson || !marketplaceContractJson.abi) {
        throw new Error("ABI missing from MarketplaceNFT.json");
    }
    console.log("MarketplaceNFT ABI loaded successfully.");
} catch (error) {
    console.error("CRITICAL ERROR loading ./MarketplaceNFT.json. Ensure the file exists and is valid.", error);
    marketplaceContractJson = null; // Set to null to prevent errors later if loading failed
    // Optionally exit the process: process.exit(1);
}

// Multer Configuration (Store temporary uploads in 'uploads/' directory)
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){ // Create uploads directory if it doesn't exist
    fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Files will be saved in the 'uploads' directory
    },
    filename: function (req, file, cb) {
        // Create a unique filename to avoid collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- Middleware ---
// Body Parser for JSON payloads
app.use(bodyParser.json());
// Session Management
app.use(session({ secret: 'replace_this_with_a_strong_secret!', resave: false, saveUninitialized: false }));
// Serve Static Files (HTML, CSS, JS from 'public' directory)
app.use(express.static(path.join(__dirname, 'public')));

// --- Constants ---
const CATEGORIES = ['watches', 'pokemon']; // Supported categories
// const IPFS_GATEWAY_PREFIX = "https://ipfs.io/ipfs/"; // ipfs.io block web scripts
const IPFS_GATEWAY_PREFIX = "https://gateway.pinata.cloud/ipfs/"

// --- Database Setup ---
const db = new sqlite3.Database('./db.sqlite', (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

// Initialize Database Schema
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        wallet TEXT
    )`, (err) => { if (err) console.error("Error creating users table:", err.message); });

    // Check if items table exists before potentially dropping it
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='items'", (err, row) => {
        if (err) {
            console.error("Error checking for items table:", err.message);
            return;
        }
        // Uncomment the following line ONLY if you are SURE you want to reset the items table on every server start
        // if (row) { db.run(`DROP TABLE items`, (err) => { if(err) console.error("Error dropping items table:", err.message); else console.log("Dropped existing items table."); }); }

        // Create items table if it doesn't exist (or after dropping)
        db.run(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            category TEXT NOT NULL,
            contract_address TEXT,
            token_id TEXT,
            name TEXT,
            description TEXT,
            front_image TEXT, -- Store IPFS URI or CID
            back_image TEXT,  -- Store IPFS URI or CID
            serial_number TEXT, -- Watch specific
            case_color TEXT,    -- Watch specific
            dial_color TEXT,    -- Watch specific
            rarity TEXT,        -- Pokemon specific
            set_number TEXT,    -- Pokemon specific
            status TEXT DEFAULT 'listed', -- e.g., 'listed', 'minted', 'sold'
            metadata_ipfs_hash TEXT, -- Store metadata CID
            token_uri TEXT,          -- Store full token URI
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`, (err) => { if (err) console.error("Error creating items table:", err.message); else console.log("Items table ready."); });
    });
});


// --- Helper Functions ---
// Authentication Middleware
function ensureLoggedIn(req, res, next) {
    if (!req.session.user) {
        console.log("Access denied: Login required.");
        return res.status(401).json({ error: 'Login required' });
    }
    next();
}

// Function to safely delete uploaded files after processing
function cleanupFiles(files) {
    if (!files) return;
    const filePaths = [];
    if (files.frontImage && files.frontImage[0]) filePaths.push(files.frontImage[0].path);
    if (files.backImage && files.backImage[0]) filePaths.push(files.backImage[0].path);

    filePaths.forEach(filePath => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Error deleting temporary file ${filePath}:`, err);
            } else {
                // console.log(`Deleted temporary file: ${filePath}`); // Optional: uncomment for debugging
            }
        });
    });
}

// --- API Routes ---

// User Registration
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    // NOTE: In production, hash passwords using bcrypt before storing!
    db.run(`INSERT INTO users(username, password) VALUES(?, ?)`, [username, password], function (err) {
        if (err) {
            console.error("Registration error:", err.message);
            return res.status(400).json({ error: 'Username likely taken' });
        }
        req.session.user = { id: this.lastID, username: username };
        req.session.wallet = null; // Initialize wallet as null
        console.log(`User registered: ${username} (ID: ${this.lastID})`);
        return res.json({ success: true });
    });
});

// User Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // NOTE: In production, compare hashed passwords!
    db.get(`SELECT id, username, wallet FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
        if (err) {
            console.error("Login DB error:", err.message);
            return res.status(500).json({ error: "Database error during login." });
        }
        if (!row) {
            console.log(`Login failed for username: ${username}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        req.session.user = { id: row.id, username: row.username };
        req.session.wallet = row.wallet; // Load wallet address from DB into session
        console.log(`User logged in: ${row.username} (ID: ${row.id}), Wallet: ${row.wallet || 'Not Connected'}`);
        return res.json({ success: true });
    });
});

// Get Current User Info
app.get('/api/me', ensureLoggedIn, (req, res) => {
    // Fetch latest wallet info from DB in case it changed elsewhere
    db.get(`SELECT wallet FROM users WHERE id = ?`, [req.session.user.id], (err, row) => {
        if (err) {
            console.error("Error fetching user wallet:", err.message);
            // Still return session data, but log the error
            return res.json({
                id: req.session.user.id,
                username: req.session.user.username,
                wallet: req.session.wallet // Use session wallet as fallback
            });
        }
        const currentWallet = row ? row.wallet : null;
        req.session.wallet = currentWallet; // Update session wallet
        res.json({
            id: req.session.user.id,
            username: req.session.user.username,
            wallet: currentWallet
        });
    });
});

// Connect Wallet Address
app.post('/api/connect-wallet', ensureLoggedIn, (req, res) => {
    const { address } = req.body;
    const userId = req.session.user.id;
    if (!ethers.isAddress(address)) { // Validate address format
        return res.status(400).json({ error: 'Invalid Ethereum address format' });
    }
    db.run(`UPDATE users SET wallet = ? WHERE id = ?`, [address, userId], function (err) {
        if (err) {
            console.error(`Error updating wallet for user ${userId}:`, err.message);
            return res.status(500).json({ error: "Failed to update wallet address." });
        }
        if (this.changes === 0) {
            // This shouldn't happen if ensureLoggedIn works, but good practice
            console.warn(`Wallet connect attempt failed: User ID ${userId} not found.`);
            return res.status(404).json({ error: "User not found." });
        }
        req.session.wallet = address; // Update session
        console.log(`Wallet ${address} connected for user: ${req.session.user.username}`);
        return res.json({ success: true });
    });
});

// Get Categories
app.get('/api/categories', (req, res) => { // No login required to see categories
    res.json(CATEGORIES);
});


// List an *Existing* NFT (Fetch metadata and save)
app.post('/api/items', ensureLoggedIn, async (req, res) => {
    const { category, contractAddress, tokenId } = req.body;
    const userWallet = req.session.wallet;
    const userId = req.session.user.id;

    // --- 1. Validation ---
    if (!userWallet) return res.status(400).json({ error: 'Please connect your wallet first.' });
    if (!CATEGORIES.includes(category)) return res.status(400).json({ error: 'Unsupported category.' });
    if (!contractAddress || !tokenId) return res.status(400).json({ error: 'Contract address and Token ID are required.' });
    if (!ethers.isAddress(contractAddress)) return res.status(400).json({ error: 'Invalid contract address format.' });
    // Basic check for tokenId format (can be improved)
     if (isNaN(parseInt(tokenId)) || BigInt(tokenId) < 0) {
        return res.status(400).json({ error: 'Invalid Token ID format.' });
    }

    console.log(`Listing request: User ${userId}, Category ${category}, Contract ${contractAddress}, TokenID ${tokenId}`);

    try {
        // --- 2. Verify Ownership on Sepolia ---
        const erc721Abi = [
            'function ownerOf(uint256 tokenId) view returns (address)',
            'function tokenURI(uint256 tokenId) view returns (string)'
        ];
        const nftContract = new ethers.Contract(contractAddress, erc721Abi, provider); // Use the global provider

        let owner;
        try {
            owner = await nftContract.ownerOf(tokenId);
            console.log(`Token ${tokenId} owner on-chain: ${owner}`);
        } catch (error) {
            console.error(`Error calling ownerOf for ${contractAddress} / ${tokenId}:`, error.message);
            // Distinguish between token not existing and other errors
            if (error.message.includes('invalid token ID') || error.message.includes('URI query for nonexistent token')) {
                 return res.status(404).json({ error: 'Token ID does not exist on this contract.' });
            }
            return res.status(400).json({ error: 'Could not verify token ownership. Check contract address and Token ID.' });
        }

        if (owner.toLowerCase() !== userWallet.toLowerCase()) {
            console.warn(`Ownership mismatch: On-chain owner ${owner}, User wallet ${userWallet}`);
            return res.status(403).json({ error: 'You do not own this token according to the blockchain.' });
        }
        console.log(`Ownership confirmed for wallet: ${userWallet}`);

        // --- 3. Fetch Metadata ---
        let tokenUri;
        try {
            tokenUri = await nftContract.tokenURI(tokenId);
            console.log(`Fetched Token URI: ${tokenUri}`);
        } catch (error) {
            console.error(`Error calling tokenURI for ${contractAddress} / ${tokenId}:`, error.message);
            return res.status(500).json({ error: 'Failed to fetch token URI from the contract.' });
        }

        let metadata;
        try {
            if (tokenUri.startsWith("data:application/json;base64,")) {
                const base64String = tokenUri.substring("data:application/json;base64,".length);
                const jsonString = Buffer.from(base64String, 'base64').toString('utf-8');
                metadata = JSON.parse(jsonString);
                console.log("Decoded base64 metadata.");
            } else {
                let metadataUrl = tokenUri;
                if (tokenUri.startsWith("ipfs://")) {
                    metadataUrl = `${IPFS_GATEWAY_PREFIX}${tokenUri.substring(7)}`;
                    console.log(`Fetching metadata from IPFS Gateway: ${metadataUrl}`);
                } else if (!tokenUri.startsWith("http")) {
                     console.warn(`Unsupported token URI format: ${tokenUri}`);
                     return res.status(400).json({ error: `Cannot fetch metadata from unsupported URI format: ${tokenUri}` });
                } else {
                    console.log(`Fetching metadata from URL: ${metadataUrl}`);
                }
                // Use axios (or built-in fetch if Node v18+)
                const response = await axios.get(metadataUrl, { timeout: 10000 }); // 10 second timeout
                metadata = response.data;
                console.log("Fetched metadata from URL.");
            }

            if (!metadata) throw new Error("Metadata content is empty or invalid.");

        } catch (error) {
            console.error(`Failed to fetch or parse metadata from ${tokenUri}:`);
            // Log more details if it's an Axios error
            if (error.response) {
                // Request made and server responded with a status code outside the 2xx range
                console.error('Axios Response Error Status:', error.response.status);
                console.error('Axios Response Error Data:', error.response.data);
            } else if (error.request) {
                // Request was made but no response was received
                console.error('Axios No Response Error:', error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Axios Setup/General Error Message:', error.message);
            }
             // Log the original error message as well
             console.error('Original Error Message:', error.message);
            return res.status(500).json({ error: 'Failed to fetch or parse NFT metadata.' , details: error.message }); // Include details
        }

        // --- 4. Extract Data from Metadata ---
        const name = metadata.name || 'N/A';
        const description = metadata.description || '';
        let front_image = '', back_image = '';
        // Handle different image field possibilities
        if (Array.isArray(metadata.images) && metadata.images.length > 0) {
            front_image = metadata.images[0] || '';
            back_image = metadata.images[1] || '';
        } else if (typeof metadata.image === 'string') {
            front_image = metadata.image;
        } else if (typeof metadata.image_url === 'string') {
             front_image = metadata.image_url;
        }
        // Normalize IPFS links if needed (optional, depends if you store full URL or just CID)
        // if (front_image.startsWith(IPFS_GATEWAY_PREFIX)) front_image = `ipfs://${front_image.substring(IPFS_GATEWAY_PREFIX.length)}`;
        // if (back_image.startsWith(IPFS_GATEWAY_PREFIX)) back_image = `ipfs://${back_image.substring(IPFS_GATEWAY_PREFIX.length)}`;

        let serial_number = '', case_color = '', dial_color = '', rarity = '', set_number = '';
        if (Array.isArray(metadata.attributes)) {
            metadata.attributes.forEach(a => {
                if (a && typeof a.trait_type === 'string') {
                    const trait = a.trait_type.toLowerCase().trim();
                    const value = String(a.value || ''); // Ensure value is a string
                    if (category === 'watches') {
                        if (trait === 'serialnumber' || trait === 'serial number') serial_number = value;
                        else if (trait === 'case color') case_color = value;
                        else if (trait === 'dial color') dial_color = value;
                    } else if (category === 'pokemon') {
                        if (trait === 'rarity') rarity = value;
                        else if (trait === 'set number') set_number = value;
                    }
                }
            });
        }
         console.log("Extracted metadata:", { name, description, front_image, back_image, serial_number, case_color, dial_color, rarity, set_number });

        // --- 5. Save to Database ---
        // Check if this specific NFT is already listed by this user
        db.get(`SELECT id FROM items WHERE contract_address = ? AND token_id = ? AND user_id = ?`,
            [contractAddress, tokenId, userId], (err, existingItem) => {
            if (err) {
                console.error("DB error checking for existing item:", err.message);
                return res.status(500).json({ error: "Database error checking listing." });
            }
            if (existingItem) {
                console.log(`Item ${contractAddress}/${tokenId} already listed by user ${userId}.`);
                return res.status(409).json({ error: 'You have already listed this NFT.' });
            }

            // Insert new listing
            const insertSql = `
                INSERT INTO items (
                    user_id, category, contract_address, token_id, name, description,
                    front_image, back_image, serial_number, case_color, dial_color,
                    rarity, set_number, status, token_uri
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                userId, category, contractAddress, tokenId, name, description,
                front_image, back_image, serial_number, case_color, dial_color,
                rarity, set_number, 'listed', tokenUri // Save the original token URI
            ];

            db.run(insertSql, params, function (err) {
                if (err) {
                    console.error("DB error inserting new item:", err.message);
                    return res.status(500).json({ error: 'Failed to save listing to database.' });
                }
                console.log(`New item listed successfully with ID: ${this.lastID}`);
                return res.json({ success: true, id: this.lastID });
            });
        });

    } catch (error) {
        console.error("Unexpected error during item listing:", error);
        return res.status(500).json({ error: 'An unexpected error occurred while listing the item.' });
    }
});


// Browse Items (Get basic list)
app.get('/api/items', (req, res) => {
    // Select only essential fields for browsing efficiency
    db.all(`SELECT id, category, name, status, front_image, contract_address, token_id FROM items WHERE status = 'listed'`, [], (err, rows) => {
        if (err) {
            console.error("Error fetching items:", err.message);
            return res.status(500).json({ error: "Failed to retrieve items." });
        }
        res.json(rows);
    });
});

// Get Item Detail
app.get('/api/items/:id', (req, res) => {
    const itemId = req.params.id;
    // Select all fields for the detail view
    db.get(`SELECT i.*, u.username as owner_username FROM items i JOIN users u ON i.user_id = u.id WHERE i.id = ?`, [itemId], (err, row) => {
        if (err) {
            console.error(`Error fetching item detail for ID ${itemId}:`, err.message);
            return res.status(500).json({ error: "Failed to retrieve item details." });
        }
        if (!row) {
            return res.status(404).json({ error: 'Item not found.' });
        }
        res.json(row);
    });
});


// ==========================================================================
// == Minting New NFT Logic (Using Single Pre-deployed Contract) ==
// ==========================================================================
app.post('/api/mint-nft', ensureLoggedIn, upload.fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'backImage', maxCount: 1 }
]), async (req, res) => {

    const userWallet = req.session.wallet;
    const userId = req.session.user.id;
    let frontIpfsHash, backIpfsHash, metadataIpfsHash, tokenURI;

    // --- 1. Preliminary Checks ---
    if (!userWallet) { /* ... */ }
    // --- CHANGE: Check if @pinata/sdk is initialized ---
    if (!pinata) {
        cleanupFiles(req.files);
        // Added note about API Keys
        return res.status(500).json({ error: 'Server configuration error: Pinata SDK not initialized. Check API Key/Secret.' });
    }
    // --- END CHANGE ---
    if (!signer) { /* ... */ }
    if (!NFT_CONTRACT_ADDRESS) { /* ... */ }
    if (!marketplaceContractJson) { /* ... */ }

    console.log(`\n--- Starting NFT Mint Request for User ID: ${userId}, Wallet: ${userWallet} ---`);
    console.log(`Using pre-deployed contract: ${NFT_CONTRACT_ADDRESS}`);

    try {
        // --- 2. Extract & Validate Input Data --- (Keep as is)
        const {
            name, description, category, // Common fields
            serialNumber, caseColor, dialColor, // Watch fields
            rarity, setNumber // Pokemon fields
        } = req.body;
        const frontFile = req.files?.frontImage?.[0];
        const backFile = req.files?.backImage?.[0];
        /* ... logging and validation ... */
        if (!frontFile.path || !fs.existsSync(frontFile.path)) { /* ... */ }
        if (!backFile.path || !fs.existsSync(backFile.path)) { /* ... */ }

        // --- Category-specific validation ---
        if (category === 'watches') {
            if (!serialNumber || !caseColor || !dialColor) {
                throw new Error('Missing required watch fields: serialNumber, caseColor, dialColor.');
            }
            console.log("Watch inputs validated.");
        } else if (category === 'pokemon') {
            if (!rarity || !setNumber) {
                throw new Error('Missing required Pokémon fields: rarity, setNumber.');
            }
            console.log("Pokémon inputs validated.");
        }

        // --- 3. Upload Images to IPFS via Pinata ---
        console.log("Uploading images to Pinata using @pinata/sdk...");
        try {
            // --- CHANGE: Use pinFileToIPFS method ---
            const frontStream = fs.createReadStream(frontFile.path);
            const frontPinOptions = {
                pinataMetadata: { name: `WatchFront_${name.replace(/\s+/g, '_')}_${Date.now()}${path.extname(frontFile.originalname)}` }
                // pinataOptions: { cidVersion: 1 } // Optional: Use CID v1
            };
            const frontResult = await pinata.pinFileToIPFS(frontStream, frontPinOptions);
            frontIpfsHash = frontResult?.IpfsHash; // Extract IpfsHash
            if (!frontIpfsHash) throw new Error("Pinata pinFileToIPFS for front image returned invalid hash.");
            console.log(`Front image uploaded: ${frontIpfsHash}`);

            const backStream = fs.createReadStream(backFile.path);
            const backPinOptions = {
                 pinataMetadata: { name: `WatchBack_${name.replace(/\s+/g, '_')}_${Date.now()}${path.extname(backFile.originalname)}` }
            };
            const backResult = await pinata.pinFileToIPFS(backStream, backPinOptions);
            backIpfsHash = backResult?.IpfsHash; // Extract IpfsHash
            if (!backIpfsHash) throw new Error("Pinata pinFileToIPFS for back image returned invalid hash.");
            console.log(`Back image uploaded: ${backIpfsHash}`);
            // --- END CHANGE ---
        } catch (pinError) {
            console.error("Error uploading images to Pinata:", pinError.message || pinError);
            // --- CHANGE: Check for API Key specific errors ---
            if (pinError.message?.includes('Authentication failed') || pinError.message?.includes('Invalid authentication')) {
                 throw new Error('Failed to upload images to IPFS: Invalid Pinata API Key or Secret.');
            } else if (pinError.response?.data?.error) {
                 console.error("Pinata API Error:", pinError.response.data.error);
                 throw new Error(`Failed to upload images to IPFS: ${pinError.response.data.error}`);
            } else {
                 throw new Error(`Failed to upload images to IPFS. ${pinError.message}`);
            }
            // --- END CHANGE ---
        }

        // --- 4. Create Metadata JSON ---
        console.log("Creating metadata JSON...");
        const metadata = {
            name: name,
            description: description,
            images: [
                `ipfs://${frontIpfsHash}`,
                `ipfs://${backIpfsHash}`
            ],
            attributes: [] // Initialize attributes array
        };

        // Add attributes based on category
        if (category === 'watches') {
            metadata.attributes.push(
                { "trait_type": "SerialNumber", "value": serialNumber },
                { "trait_type": "Case Color", "value": caseColor },
                { "trait_type": "Dial Color", "value": dialColor }
            );
        } else if (category === 'pokemon') {
            metadata.attributes.push(
                { "trait_type": "Rarity", "value": rarity },
                { "trait_type": "Set Number", "value": setNumber }
            );
        }
        console.log("Metadata created:", JSON.stringify(metadata, null, 2));

        // --- 5. Upload Metadata JSON to IPFS via Pinata ---
        console.log("Uploading metadata to Pinata using @pinata/sdk...");
        try {
            const metaPinOptions = {
                pinataMetadata: { name: `Metadata_${name.replace(/\s+/g, '_')}_${Date.now()}.json` }
                // pinataOptions: { cidVersion: 1 } // Optional
            };
            const metadataResult = await pinata.pinJSONToIPFS(metadata, metaPinOptions);
            metadataIpfsHash = metadataResult?.IpfsHash; // Extract IpfsHash
            if (!metadataIpfsHash) throw new Error("Pinata pinJSONToIPFS for metadata returned invalid hash.");
            tokenURI = `ipfs://${metadataIpfsHash}`;
            console.log(`Metadata uploaded: ${metadataIpfsHash}`);
            console.log(`Token URI: ${tokenURI}`);

        } catch (pinError) {
            console.error("Error uploading metadata to Pinata:", pinError.message || pinError);
             // --- Check for API Key specific errors ---
             if (pinError.message?.includes('Authentication failed') || pinError.message?.includes('Invalid authentication')) {
                 throw new Error('Failed to upload metadata to IPFS: Invalid Pinata API Key or Secret.');
            } else if (pinError.response?.data?.error) {
                 console.error("Pinata API Error:", pinError.response.data.error);
                 throw new Error(`Failed to upload metadata to IPFS: ${pinError.response.data.error}`);
            } else {
                 throw new Error(`Failed to upload metadata to IPFS. ${pinError.message}`);
            }
        }

        // --- Pre-Mint Validation --- (Keep as is)
        if (!tokenURI || !userWallet || !ethers.isAddress(userWallet)) { /* ... */ }

        // --- 6. Mint NFT by Calling the Pre-deployed Contract --- (Keep as is)
        console.log(`Preparing to mint NFT on contract ${NFT_CONTRACT_ADDRESS}...`);
        let mintTransaction;
        let newlyMintedTokenId;
        try {
            const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, marketplaceContractJson.abi, signer);
            mintTransaction = await nftContract.mintItem(userWallet, tokenURI);
            const receipt = await mintTransaction.wait(1);
            /* ... parse logs to get newlyMintedTokenId ... */
            const transferEventInterface = new ethers.Interface(marketplaceContractJson.abi);
            const transferEventLog = receipt.logs.find(log => log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef');
            if (transferEventLog) {
                 const parsedLog = transferEventInterface.parseLog(transferEventLog);
                 if (parsedLog && parsedLog.args && parsedLog.args.tokenId !== undefined) {
                    newlyMintedTokenId = parsedLog.args.tokenId.toString();
                    console.log(`Successfully minted Token ID: ${newlyMintedTokenId} (from event logs)`);
                 } else { throw new Error("Mint transaction succeeded but could not parse Token ID from logs."); }
            } else { throw new Error("Mint transaction succeeded but could not parse Token ID from logs."); }

        } catch (mintError) {
            /* ... error handling ... */
             console.error("\n--- ERROR DURING NFT MINTING TRANSACTION ---");
             console.error(mintError);
             let errMsg = "Failed to mint NFT via contract call.";
             if (mintError.reason) { errMsg = `Contract reverted: ${mintError.reason}`; }
             else if (mintError.code === 'INSUFFICIENT_FUNDS') { errMsg = "Insufficient funds for minting gas fees."; }
             else if (mintError.message) { errMsg = mintError.message; }
             return res.status(500).json({ error: errMsg, details: mintError.message });
        }

        // --- 7. Log Minted NFT Details (Instead of Saving to DB) ---
        console.log("\n--- NFT Minted Successfully (Not Saved to DB) ---");
        console.log(`  Recipient Wallet: ${userWallet}`);
        console.log(`  Contract Address: ${NFT_CONTRACT_ADDRESS}`);
        console.log(`  Token ID: ${newlyMintedTokenId}`);
        console.log(`  Token URI: ${tokenURI}`);
        console.log(`  Metadata CID: ${metadataIpfsHash}`);
        console.log(`  Front Image CID: ${frontIpfsHash}`);
        console.log(`  Back Image CID: ${backIpfsHash}`);
        console.log(`  Transaction Hash: ${mintTransaction.hash}`);
        console.log(`  Item Name: ${name}`); // Log other details if needed
        console.log(`  Description: ${description}`);
        if (category === 'watches') {
            console.log(`  Serial Number: ${serialNumber}`);
            console.log(`  Case Color: ${caseColor}`);
            console.log(`  Dial Color: ${dialColor}`);
        } else if (category === 'pokemon') {
            console.log(`  Rarity: ${rarity}`);
            console.log(`  Set Number: ${setNumber}`);
        }

        console.log("--------------------------------------------------");

    } catch (error) { // Catch errors from validation, Pinata uploads, or pre-mint checks
        console.error("\n--- ERROR DURING NFT MINTING PROCESS (Before Transaction) ---");
        console.error(error);
        cleanupFiles(req.files);
        return res.status(500).json({
            error: "Failed to process NFT minting request.",
            details: error.message
        });
    }
});


// --- Server Startup ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Closed the database connection.');
        process.exit(0);
    });
});
