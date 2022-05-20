import React, { useState, useEffect } from "react";
import { ethers, Contract } from "ethers";

import abi from "./assets/abi.json";

const Main = () => {
  const contractAddress = "0x1416B71927cE72f82f9c79fc48B515E57b2deA34";

  const [error, setError] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);
  const [address, setAddress] = useState<string>("");
  const [contract, setContract] = useState<Contract>();
  const [name, setName] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    window.ethereum.on("accountsChanged", (accounts: any) => {
      // If user has locked/logout from MetaMask, this resets the accounts array to empty
      if (!accounts.length) {
        console.log("disconnected");
        setConnected(false);
        setAddress("");
        setName(undefined);
        setContract(undefined);
        // logic to handle what happens once MetaMask is locked
      }
    });
  }, []);

  const connectToWallet = async () => {
    if (connected) {
      window.location.reload();
    }
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(
          window.ethereum,
          "any"
        );
        // Prompt user for account connections
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        setAddress(await signer.getAddress());
        setConnected(true);
        setError("");

        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x61",
              chainName: "BSC Testnet",
              rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
              blockExplorerUrls: ["https://explorer.binance.org/smart-testnet"],
            },
          ],
        });

        setContract(new ethers.Contract(contractAddress, abi, provider));
      } catch (e: any) {
        setError(e.message);
      }
    } else {
      setError("Metamask non è installato, aggiungi l'estensione e riprova");
    }
  };

  const returnName = async () => {
    if (connected) {
      setLoading(true);
      setName(await contract!.getNome());
      setLoading(false);
      setError("");
    } else {
      setError("Connection is needed to use this button");
    }
  };

  return (
    <>
      <nav>
        <button className="btn" onClick={connectToWallet}>
          {connected ? "Disconnect" : "Connect wallet"}
        </button>
      </nav>
      <div className="center">
        <div className="container">
          <p className="error">{error}</p>
          {address && <p>Your address: {address}</p>}
          <button className="btn" onClick={returnName}>
            Come mi chiamo?
          </button>
          {loading ? (
            <p>loading...</p>
          ) : (
            <div className="textbox">{name ?? "XXXXXXXXXX"}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default Main;
