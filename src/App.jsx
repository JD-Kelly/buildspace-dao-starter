import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { UnsupportedChainIdError } from "@web3-react/core";

// instantiate sdk on Rinkeby
const sdk = new ThirdwebSDK("rinkeby");

// Grab a reference to our ERC-1155 contract.
const bundleDropModule = sdk.getBundleDropModule(
  "0x3ffbe95E9f4A453dEa8Bd94AE03821C69f2855d7"
);

const tokenModule = sdk.getTokenModule(
  "0x01395B412cceBbAd7C5E8aCbd869f07e0AD4fe08"
)

const voteModule = sdk.getVoteModule(
  "0x71CD5Ed4Af58ee86ba4aDd72DD23015ccf2f5490"
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

  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Shortens the wallet address
  const shortenAddress = (str) => {
    return str.substring(0,6) + "..." + str.substring(str.length - 4);
  };

   // Retrieve all existing proposals from the contract
   useEffect(() => {
     if (!hasClaimedNFT) {
       return;
     }

     voteModule
      .getAll()
      .then((proposals) => {
        setProposals(proposals);
        console.log("Proposals:", proposals)
     })
     .catch((err) => {
       console.error("failed to get proposals", err);
     });
    }, [hasClaimedNFT]);

    useEffect(() => {
      if (!hasClaimedNFT) {
        return;
      }
      if (!proposals.length) {
        return;
      }
    

     voteModule
      .getAll(proposals[0].proposalId, address)
      .then((hasVoted) => {
        setHasVoted(hasVoted);
        if (hasVoted) {
         console.log("User has already voted");
        } else {
         console.log("User has not yet voted");
        }
      })
     .catch((err) => {
      console.error("Failed to check if wallet has voted", err);
    });
  }, [hasClaimedNFT, proposals, address]);


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

  if ( error instanceof UnsupportedChainIdError) {
    return (
      <div className="unsupported-network">
        <h2>Please connect to Rinkbey</h2>
        <p>
        This dapp only works on the Rinkeby network, please switch networks
        in your connected wallet.
        </p>
      </div>
    );
  }

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
        <div>
          <h2>Active Proposals</h2>
          <form
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsVoting(true);
            const votes = proposals.map((proposal) => {
              let voteResult = {
                proposalId: proposal.proposalId,
                vote: 2
              };
              proposal.votes.forEach((vote) => {
                const elem = document.getElementById(
                  proposal.proposalId + "-" + vote.type
                );
                if (elem.checked) {
                  voteResult.vote = vote.type;
                }
              })
              return voteResult;
            });

            try {
              const delegation = await tokenModule.getDelegationOf(address);
              if (delegation === ethers.consdtant.AddressZero) {
                await tokenModule.delegateTo(address);
              }
              try {
                await Promise.all(
                  votes.map(async (vote) => {
                    const proposal = await voteModule.get(vote.proposalId);
                    if (proposal.state === 1) {
                      return voteModule.vote(vote.proposalId, vote.vote);
                    }
                    return;
                  })
                );
                try {
                  await Promise.all(
                    votes.map(async (vote) => {
                      const proposal = await voteModule.get(
                        vote.proposalId
                      );

                      if (proposal.stae === 4) {
                        return voteModule.execute(vote.proposalId);
                      }
                    })
                  );

                  setHasVoted(true);
                  console.log("Successfully voted");
                } catch (err) {
                  console.error("Failed to execute votes", err);
                }
              } catch (err) {
                console.error("Failed to vote", err);
              }
            } catch (err) {
              console.error("Failed to delegate tokens");
            } finally {
              setIsVoting(false)
            }
          }}
          >
            {proposals.map((proposal, index) => (
              <div key={proposal.proposalId} className="card">
                <h5>{proposal.description}</h5>
              <div>
                {proposal.votes.map((vote) => (
                  <div key={vote.type}>
                    <input 
                      type="radio"
                      id={proposal.proposalId + "-" + vote.type}
                      name={proposal.proposalId}
                      value={vote.type}
                      defaultChecked={vote.type === 2}
                    />
                    <label htmlFor={proposal.proposalId + "-" + vote.type}>
                      {vote.label}
                    </label>
                  </div>
                ))}
            </div>
           </div>
          ))}
          <button disabled={isVoting || hasVoted} type="submit">
            {isVoting ? "Voting..." : hasVoted ? "You already voted" : "Submit Votes"}
          </button>
          <small>
            This will trigger multiple transactions that you will need to sign.
          </small>
        </form>
        </div>
      </div>
    </div>
    );
  };

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
