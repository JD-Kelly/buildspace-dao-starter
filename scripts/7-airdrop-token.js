import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// ERC-1155 membership NFT contract address
const bundleDropModule = sdk.getBundleDropModule(
  "0x3ffbe95E9f4A453dEa8Bd94AE03821C69f2855d7"
);

// ERC-20 token contract address
const tokenModule = sdk.getTokenModule(
  "0x01395B412cceBbAd7C5E8aCbd869f07e0AD4fe08"
);

(async () => {
  try {

  
    // Grabs all address of those those who own membership NFT - tokenId is 0
    const walletAddresses = await bundleDropModule.getAllClaimerAddresses("0");

    if (walletAddresses.length === 0) {
      console.log("No NFTS have been claimed yet, maybe get some friends to claim some free NFTS");
      process.exit(0)
    }
    // Loop through array of addresses
    const airDropTargets = walletAddresses.map((address) => {
      const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
      console.log("✅ Going to airdrop", randomAmount, "tokens to", address);
      
      const airDropTarget = {
        address, 
        amount: ethers.utils.parseUnits(randomAmount.toString(), 18)
      };
      return airDropTarget;
    });

    console.log("Starting airdrop...")
    await tokenModule.transferBatch(airDropTargets);
    console.log("Successfully airdropped tokens to all the holders of the NFT");
  } catch(err) {
    console.error("Failed to airdrop tokens", err)
  }
  
})()