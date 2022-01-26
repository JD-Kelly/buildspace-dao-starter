import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { has } from "lodash";

// instantiate sdk on Rinkeby
const sdk = new ThirdwebSDK("rinkeby");

// Grab a reference to our ERC-1155 contract.
const bundleDropModule = sdk.getBundleDropModule(
  "0x3ffbe95E9f4A453dEa8Bd94AE03821C69f2855d7"
);

const tokenModule = sdk.getTokenModule(
  "0x01395B412cceBbAd7C5E8aCbd869f07e0AD4fe08"
)


const App = () => {
  // use the connectWallet hook that thirdweb gives us.
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("Address:", address)

  // Signer is require to sign transactions on the blockchain.
  // Without this we can only read data, not write.
  const signer = provider ? provider.getSigner() : undefined;

  // Keeps a loading state while NFT is minting.
  const [isClaiming, setIsClaiming] = useState(false)

  // The amount of token each member has
  const [memberTokenAmounts, setMemberTokemAmounts] = useState({});

  // Holding our members addresses
  const [memberAddresses, setMemberAddresses] = useState([]);

  // State variable to check if user has our NFT
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);

  // Shortens the wallet address
  const shortenAddress = (str) => {
    return str.substring(0,6) + "..." + str.substring(str.length - 4);
  };

  // Grab all the addresses of our members holding our NFT
  useEffect(() => {
    if(!hasClaimedNFT) {
      return;
    }

    bundleDropModule
    .getAllClaimerAddresses("0")
    .then((addresses) => {
      console.log("Members addresses", addresses)
      setMemberAddresses(addresses);
    })
    .catch((err) => {
      console.error("failed to get member list", err);
    });
  }, [hasClaimedNFT]);


  useEffect(() => {
    if(!hasClaimedNFT) {
      return;
    }

    // Grabs all balances
    tokenModule
    .getAllHolderBalances()
    .then((amounts) => {
      console.log("Amounts", amounts)
      setMemberTokemAmounts(amounts);
    })
    .catch((err) => {
      console.error("failed to get token amounts", err);
    });
  }, [hasClaimedNFT])

  // Combines memberAddress and memberTokenAmounts into single array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address, 
        tokenAmount: ethers.utils.formatUnits(
          memberTokenAmounts[address] || 0, 18,
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

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
        <div>
          <h2>Member List</h2>
          <table className="card">
            <thead>
              <tr>
                <th>Address</th>
                <th>Token Amount</th>
              </tr>
            </thead>
            <tbody>
              {memberList.map((member) => {
                return (
                  <tr key={member.address}>
                    <td>{shortenAddress(member.address)}</td>
                    <td>{member.tokenAmount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
