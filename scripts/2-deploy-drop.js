import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const app = sdk.getAppModule("0x753796c7724731060e0CC40376c1aAF677f2F77f");

(async ()=> {
  try {
    const bundleDropModule = await app.deployBundleDropModule({
      // Collection name
      name: "DebugDAO Membership",
      // Collection description
      description: "A DAO for debugging.",
      // Image for the collection that will show on OpenSea.
      image: readFileSync("scripts/assets/debug-mode.jpeg"),
      primarySaleRecipientAddress: ethers.constants.AddressZero,
    })
    console.log("Successfully deployed bundleDrop module, address:", bundleDropModule.address,
    );
    console.log("bundleDrop metadata:", await bundleDropModule.getMetadata(),
    );
  } catch (error) {
    console.log("failed to deploy bundleDrop module", error);
  }
})()