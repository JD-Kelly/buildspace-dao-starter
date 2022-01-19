import { ThirdwebSDK } from "@3rdweb/sdk";
import ethers from "ethers";

//Importing and configuring our .env file that we use to securely store our environment variables
import dotenv from "dotenv";
dotenv.config();

// Checks to ensure .env is working.
if(!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === "") {
  console.log("Private key is not found")
}

if(!process.env.ALCHEMY_API_URL || process.env.ALCHEMY_API_URL === "") {
  console.log("Alchemy API URL not found")
}

if(!process.env.WALLET_ADDRESS || process.env.WALLETT_ADDRESS === "") {
  console.log("Wallet Address not found")
}

const sdk = new ThirdwebSDK(
  new ethers.Wallet(
    process.env.PRIVATE_KEY,
    ethers.getDefaultProvider(process.env.ALCHEMY_API_URL),
  ),
);

(async () => {
  try {
    const apps = await sdk.getApps();
    console.log("Your app address is:", apps[0].address);
  } catch (err) {
    console.error("Failed to get apps from the sdk", err);
    process.exit(1)
  }
})()

export default sdk;