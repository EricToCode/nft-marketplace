// scripts/deployEscrow.js
const hre = require("hardhat");
const ethers = hre.ethers; // Get ethers from Hardhat Runtime Environment

async function main() {
  // Get the deployer signer (ensure it's configured in hardhat.config.js)
  // Make sure the deployer has Sepolia ETH for gas fees!
  const [deployer] = await ethers.getSigners();
  console.log("Deploying Escrow contract with account:", deployer.address);

  // --- CONFIGURATION ---
  const initialOwner = deployer.address; // The deployer wallet becomes the contract owner
  const marketplaceFeeAddress = "0x0f297Fd3d13CAB8c05b090F5302d1C10C50C4c7F"; // Your fee address
  // --- FIX: Call parseEther directly from ethers ---
  const marketplaceFeeAmountWei = ethers.parseEther("0.002"); // Fee in Wei (0.002 ETH)
  // --- END FIX ---
  // --- END CONFIGURATION ---

  console.log("Initial Owner:", initialOwner);
  console.log("Marketplace Fee Address:", marketplaceFeeAddress);
  console.log("Marketplace Fee Amount (Wei):", marketplaceFeeAmountWei.toString());

  // Get the ContractFactory for your specific contract
  const NFTEscrow = await ethers.getContractFactory("NFTEscrow");

  // Deploy the contract with constructor arguments
  console.log("Deploying NFTEscrow...");
  const escrowContract = await NFTEscrow.deploy(
      initialOwner,
      marketplaceFeeAddress,
      marketplaceFeeAmountWei
  );

  // Wait for deployment confirmation correctly
  console.log(`Deployment transaction hash: ${escrowContract.deploymentTransaction().hash}`);
  console.log("Waiting for contract deployment confirmation...");
  await escrowContract.waitForDeployment();

  const contractAddress = await escrowContract.getAddress(); // Get the deployed contract address

  console.log(`✅ NFTEscrow deployed to: ${contractAddress} on network ${hre.network.name}`);
  console.log(`\n➡️ Add this address to your .env file as ESCROW_CONTRACT_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error); // Log the specific error
    process.exit(1);
  });
