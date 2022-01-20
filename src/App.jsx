import { useEffect, useMemo, useState } from "react";

// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";

// instantiate sdk on Rinkeby
const sdk = new ThirdwebSDK("rinkeby");

// Grab a reference to our ERC-1155 contract.
const bundleDropModule = sdk.getBundleDropModule(
  "0x3ffbe95E9f4A453dEa8Bd94AE03821C69f2855d7"
);


const App = () => {
  // use the connectWallet hook that thirdweb gives us.
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("Address:", address)

  // Signer is require to sign transactions on the blockchain.
  // Without this we can only read data, not write.
  const signer = provider ? provider.getSigner() : undefined;

  // Keeps a loading state while NFT is minting.
  const [isClaiming, setIsClaiming] = useState(false)

  // State variable to check if user has our NFT
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);

  useEffect(() => {
    // Pass the signer to the SDK enabling us to interact with our deployed contract
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  // If they don't have a connected wallet
  useEffect(() => {
    if(!address) {
      return;
    }

    // check if the user has the NFT
    return bundleDropModule
    .balanceOf(address, "0")
    .then((balance) => {
      // If balance greater than 0, they have the NFT
      if(balance.gt(0)) {
        setHasClaimedNFT(true); 
        console.log("This user has a membership NFT")
      } else {
        setHasClaimedNFT(false);
        console.log("This user doesn not have a membership NFT")
      }
    })
    .catch((error) => {
      setHasClaimedNFT(false);
      console.error("Failed to get NFT balance", error);
    });
  }, [address]);

  // Where a user hasn't connected thier wallet to the web app.
  if(!address) {
    return (
      <div className="landing">
        <h1>Welcome to DebugDAO</h1>
        <button onClick={() => connectWallet("injected")} className='btn-hero'>
          Connect your wallet
        </button>
      </div>
    );
  }

  // If user has claimed membership NFT
  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>DAO Members Page</h1>
        <p>Welcome to the DebugDAO</p>
      </div>
    )
  }

  const mintNft = () => {
    setIsClaiming(true);
    bundleDropModule
    .claim("0", 1)
    .then (() => {
      setHasClaimedNFT(true);
      console.log(`Successfully minted. Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`);
    })
    .catch((err) => {
      console.error("failed to claim", err);
    })
    .finally(() => {
      setIsClaiming(false);
    })
  }
  
// Render mint NFT screen
return (
  <div className="mint-nft">
    <h1> Mint your free DAO membership NFT</h1>
    <button
      disabled={isClaiming}
      onClick={() => mintNft()}
      >
        {isClaiming ? "Minting..." : "Mint your NFT for free"}
    </button>
  </div>
  )
};

export default App;
