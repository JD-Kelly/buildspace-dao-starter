import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// Voting contract
const voteModule = sdk.getVoteModule(
  "0x71CD5Ed4Af58ee86ba4aDd72DD23015ccf2f5490"
);

// ERC-20 contract
const tokenModule = sdk.getTokenModule(
  "0x01395B412cceBbAd7C5E8aCbd869f07e0AD4fe08"
);

(async () => {
  try {
    const amount = 420_000;
    // Proposal to mint 420,000 new tokens to the treasury
    await voteModule.propose(
      "Should the DAO mint an additioanl " + amount + " tokens into the treasury?",
      [
        {
          // Native token is ETH. We want to send 0 ETH in this proposal as we're just minting new tokens to the treasury
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            "mint",
            [
              voteModule.address,
              ethers.utils.parseUnits(amount.toString(), 18)
            ]
          ),
          toAddress: tokenModule.address,
        },
      ]
    );

    console.log("Successfully created proposal to mint tokens");
  } catch (error) {
    console.error("Failed to create first proposal", error);
    process.exit(1);
  }

  try {
    const amount = 6_900;
    // Proposal to transfer ourselves 6,900 tokens.
    await voteModule.propose(
      "Should the DAO transfer " + amount + " tokens from the treasury to " + process.env.WALLET_ADDRESS + " ?",
      [
        {
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            "transfer",
            [
              process.env.WALLET_ADDRESS,
              ethers.utils.parseUnits(amount.toString(), 18),
            ]
          ),
          toAddress: tokenModule.address,
        },
      ]
    );

    console.log("Successfully created proposal to reward ourselves from the treasury")
  } catch (error) {
    console.error("Failed to create second proposal", error);
  }
})();