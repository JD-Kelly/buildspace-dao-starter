import { useEffect, useMemo, useState } from "react";

// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";


const App = () => {
  // use the connectWallet hook that thirdweb gives us.
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("Address:", address)

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
  
// Where a user has their wallet connected
return (
  <div className="landing">
    <h1> Wallet connected...</h1>
  </div>
)

};

export default App;
