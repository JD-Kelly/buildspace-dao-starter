import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// Governance contract
const voteModule = sdk.getVoteModule (
  "0x71CD5Ed4Af58ee86ba4aDd72DD23015ccf2f5490"
);

// ERC-20 contract
const tokenModule = sdk.getTokenModule (
  "0x01395B412cceBbAd7C5E8aCbd869f07e0AD4fe08"
);

(async () => {
  try {
    // Enables treasury to mint additional tokens if needed
    await tokenModule.grantRole("minter", voteModule.address);
    console.log("Successfully gave vote module permissions to act on token module")
  } catch (error) {
    console.error("Failed to grant vote module permissions to act on token module", error)
    process.exit(1)
  }

  try {
    // Grab wallet's token balance 
    const ownedTokenBalance= await tokenModule.balanceOf(
      process.env.WALLET_ADDRESS
    );

    // Takes 90% of token supply that we own
      const ownedAmount =  ethers.BigNumber.from(ownedTokenBalance.value)
      const percent90 = ownedAmount.div(100).mul(90)

      // Transferto voting contract
    await tokenModule.transfer(
      voteModule.address,
      percent90
    );

    console.log("Successfully transfered tokens to vote module")
  } catch (error) {
    console.error("Failed to transfer tokens to vote module", error)
  }
})();