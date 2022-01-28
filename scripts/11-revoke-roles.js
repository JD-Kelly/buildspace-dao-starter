import sdk from "./1-initialize-sdk.js"

const tokenModule = sdk.getTokenModule(
  "0x01395B412cceBbAd7C5E8aCbd869f07e0AD4fe08"
);

(async () => {
  try {
    console.log(
      "Roles that exist right now:",
      await tokenModule.getAllRoleMembers()
    );

    await tokenModule.revokeAllRolesFromAddress(process.env.WALLET_ADDRESS);
    console.log("ROles after revoking ourselves:",
    await tokenModule.getAllRoleMembers()
    );
    console.log("Successfully revoked our superpowers from the ERC-20 contract");
  } catch (error) {
    console.error("Failed to revoke ourselves from the DAO treasury", error);
  }
})();