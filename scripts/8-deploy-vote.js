import sdk from "./1-initialize-sdk.js";

// App module address
const appModule = sdk.getAppModule(
  "0x753796c7724731060e0CC40376c1aAF677f2F77f"
);

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      // Name of Governance contract
      name: "DebugDAO Proposal",

      votingTokenAddress: "0x01395B412cceBbAd7C5E8aCbd869f07e0AD4fe08",

      // Wait time for proposal voting 
      proposalStartWaitTimeInSeconds: 0,

      // Amount of time to vote on a proposal 
      proposalVotingTimeInSeconds: 24 * 60 * 60,

      votingQuorumFraction: 0,

      // Minimum number of tokens needed to be allowed to create a proposal
      minimumNumberOfTokensNeededToPropose: "0",
    })
    console.log("Successfully deployed vote module, address:", voteModule.address);
  } catch (err) {
    console.error("Failed to deploy vote module", err)
  }
})()