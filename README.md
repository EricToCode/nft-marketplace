# Demo steps

## prerequisites

1. Please create a .env file with the follwing contents:

PINATA_API_KEY=f3230847639260b83f3a
PINATA_SECRET_API_KEY=bb04c0c9e25ce08b94941667759a0cec1cb4973011909f2b568ae36a10e87b0b
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com/ # e.g., from Infura/Alchemy
DEPLOYER_PRIVATE_KEY=a8210a82735063c7f0d467a7d5bff45c8068f382ffa73ba9acd5515c4adda132 # Wallet must have Sepolia ETH for gas
NFT_CONTRACT_ADDRESS=0xC761b90649445d40aa117E3524CA43B4639057FD
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjNDI0ZjBlNS03NjhlLTQzYzItOTY1Yi1hMDc1M2IwMGRmYTIiLCJlbWFpbCI6ImVyaWNjaGVuaHl5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJmMzIzMDg0NzYzOTI2MGI4M2YzYSIsInNjb3BlZEtleVNlY3JldCI6ImJiMDRjMGM5ZTI1Y2UwOGI5NDk0MTY2Nzc1OWEwY2VjMWNiNDk3MzAxMTkwOWYyYjU2OGFlMzZhMTBlODdiMGIiLCJleHAiOjE3NzcwNjI2NDF9.guEN4dzzBdg4Nh_2Jjr5LqWy8K4gm3zdMuxiXe403rs
ESCROW_CONTRACT_ADDRESS=0x7D265a602b31338E082FC08F61712fB9eA46f65F

2. have npm installed
3. run 'npm install'
4. run 'npm start' to start the server and website

## Run demo

Please register a new user (as the seller)
Please register another user (as the buyer)
These two account need to have Sepolia Eth to purchase items and pay for the gas fees.

## Seller functions

### Mint NFT

Please use the sample items found in folder items/ and enter the corresponding fields.
Please note down the contract ID and the Token ID of the NFT given to you.

### Post item
Enter the contract ID and the Token ID of the item you wish to post.

## Buying and selling

### Buyer
Go to browse tab, click on an item.
Initiate the purchase by putting an offer in Eth (minimum 0.002)

Seller needs to accept the offer

Buyer need to allow metamask to take funds

*Seller would now send the physical item, and buyer receives it
Buyer would confirm having received the item

Seller now needs to allow metamask to transfer the NFT ownership to the buyer

Buyer received item and now receives NFT, seller receives funds (price of item - selling fee)

The transaction can now be seen in both accounts' transaction history