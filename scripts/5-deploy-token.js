import sdk from "./1-initialize-sdk.js";

const app = sdk.getAppModule("0x753796c7724731060e0CC40376c1aAF677f2F77f");

(async () => {
try {
  // Deploys ERC-20 contract
  const tokenModule = await app.deployTokenModule({
    name: "DebugDAO Governance Token",
    symbol: "BUG"
  }); 
  console.log("Successfully deployed token module, address:", tokenModule.address);
} catch (error) {
  console.error("Failed to deploy to token module", error)
}
})();