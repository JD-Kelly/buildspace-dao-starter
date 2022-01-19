import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule(
  "0x3ffbe95E9f4A453dEa8Bd94AE03821C69f2855d7",
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
      name: "Debug bug",
      description: "This NFT will give you access to DebugDAO",
      image: readFileSync("scripts/assets/debug-mode.jpeg"),
      },
    ]);
    console.log("Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("Failed to create the new NFT", error);
  }
})()
