import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// ERC-20 contract address
const tokenModule = sdk.getTokenModule(
  "0x01395B412cceBbAd7C5E8aCbd869f07e0AD4fe08"
);

(async () => {
  try {
    // Max token supply
    const amount = 1_000_000;
    // convert this amount to 18 decimals which is standard for ERC20 tokens
    const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18);
    // Mint the tokens
    await tokenModule.mint(amountWith18Decimals);
    const totalSupply = await tokenModule.totalSupply();
    // print the number of tokens
    console.log("There is now", ethers.utils.formatUnits(totalSupply, 18),
    "$BUG in circulation"
    );
  } catch (error) {
    console.error("Failed to preint money", error)
  }
})();

