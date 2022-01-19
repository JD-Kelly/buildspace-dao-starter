import sdk from "./1-initialize-sdk.js";

const bundleDrop = sdk.getBundleDropModule(
  "0x3ffbe95E9f4A453dEa8Bd94AE03821C69f2855d7"
);

(async () => {
  try {
    const claimConditionFactory = bundleDrop.getClaimConditionFactory();
    // Specify condtions.
    claimConditionFactory.newClaimPhase({
      startTime: new Date(),
      maxQuantity: 50_000,
      maxQuantityPerTransaction: 1,
    });

    await bundleDrop.setClaimCondition(0, claimConditionFactory);
    console.log("Successfully set clain condition on bundle drop:", bundleDrop.address);
  } catch (error) {
    console.error("FAiled to set claim condition", error);
  }
})()