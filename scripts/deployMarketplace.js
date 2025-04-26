// scripts/deployMarketplace.js
const hre = require("hardhat");

async function main() {
  // Get the deployer signer (ensure it's configured in hardhat.config.js)
  // Make sure the deployer has Sepolia ETH for gas fees!
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Define constructor arguments (match your MarketplaceNFT.sol constructor)
  const initialOwner = deployer.address; // The deployer wallet becomes the contract owner
  const collectionName = "My Marketplace Items"; // Choose your collection name
  const collectionSymbol = "MMI"; // Choose your collection symbol

  console.log(`Initial Owner: ${initialOwner}`);
  console.log(`Collection Name: ${collectionName}`);
  console.log(`Collection Symbol: ${collectionSymbol}`);

  // Get the ContractFactory for your specific contract
  const MarketplaceNFT = await hre.ethers.getContractFactory("MarketplaceNFT");

  // Deploy the contract with constructor arguments
  console.log("Deploying MarketplaceNFT...");
  const marketplaceNFT = await MarketplaceNFT.deploy(
      initialOwner,
      collectionName,
      collectionSymbol
  );

  // --- FIX START: Wait for deployment confirmation correctly ---
  console.log(`Deployment transaction hash: ${marketplaceNFT.deploymentTransaction().hash}`);
  console.log("Waiting for contract deployment confirmation...");
  // Use waitForDeployment() instead of deployed()
  await marketplaceNFT.waitForDeployment();
  // --- FIX END ---

  const contractAddress = await marketplaceNFT.getAddress(); // Get the deployed contract address

  console.log(`✅ MarketplaceNFT deployed to: ${contractAddress} on network ${hre.network.name}`);
  console.log(`\n➡️ Add this address to your .env file as NFT_CONTRACT_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error); // Log the specific error
    process.exit(1);
  });
