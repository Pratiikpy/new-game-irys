import React, { createContext, useContext, useState, useEffect } from "react";
import { WebUploader } from "@irys/web-upload";
import { WebEthereum } from "@irys/web-upload-ethereum";
import { EthersV6Adapter } from "@irys/web-upload-ethereum-ethers-v6";
import { ethers } from "ethers";
import Query from "@irys/query";

const IrysContext = createContext();

export const useIrys = () => {
  const context = useContext(IrysContext);
  if (!context) {
    throw new Error("useIrys must be used within an IrysProvider");
  }
  return context;
};

export const IrysProvider = ({ children }) => {
  const [irysUploader, setIrysUploader] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");

  // Initialize Irys uploader
  const initIrys = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask not found");
    }

    setIsLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      const uploader = await WebUploader(WebEthereum)
        .withAdapter(EthersV6Adapter(provider))
        .withRpc("https://devnet.irys.xyz")
        .devnet();

      await uploader.ready();
      
      setIrysUploader(uploader);
      setWalletAddress(address);
      setIsConnected(true);
      
      // Get balance
      const loadedBalance = await uploader.getLoadedBalance();
      setBalance(uploader.utils.fromAtomic(loadedBalance).toString());
      
      console.log("Irys initialized successfully");
      return uploader;
    } catch (error) {
      console.error("Error initializing Irys:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fund account
  const fundAccount = async (amount = "0.01") => {
    if (!irysUploader) {
      throw new Error("Irys not initialized");
    }

    try {
      const amountAtomic = irysUploader.utils.toAtomic(amount);
      const fundTx = await irysUploader.fund(amountAtomic);
      const funded = irysUploader.utils.fromAtomic(fundTx.quantity);
      
      // Update balance
      const newBalance = await irysUploader.getLoadedBalance();
      setBalance(irysUploader.utils.fromAtomic(newBalance).toString());
      
      return { success: true, funded };
    } catch (error) {
      console.error("Error funding account:", error);
      throw error;
    }
  };

  // Upload score to Irys
  const uploadScore = async (score) => {
    if (!irysUploader || !walletAddress) {
      throw new Error("Irys not initialized or wallet not connected");
    }

    try {
      const scoreData = {
        wallet: walletAddress,
        username: username || "Anonymous",
        score: score,
        timestamp: Date.now(),
        game: "PixelInvaders"
      };

      const tags = [
        { name: "application-id", value: "PixelInvaders" },
        { name: "wallet", value: walletAddress },
        { name: "username", value: username || "Anonymous" },
        { name: "score", value: score.toString() },
        { name: "Content-Type", value: "application/json" }
      ];

      const receipt = await irysUploader.upload(JSON.stringify(scoreData), { tags });
      
      console.log("Score uploaded successfully:", receipt.id);
      return receipt;
    } catch (error) {
      console.error("Error uploading score:", error);
      throw error;
    }
  };

  // Fetch leaderboard from Irys
  const fetchLeaderboard = async (limit = 100) => {
    try {
      const query = new Query()
        .tags("application-id", "PixelInvaders")
        .sort("DESC")
        .limit(limit);

      const results = await query.search();
      
      const scores = await Promise.all(
        results.map(async (result) => {
          try {
            const data = await fetch(`https://gateway.irys.xyz/${result.id}`);
            const scoreData = await data.json();
            return {
              id: result.id,
              wallet: scoreData.wallet,
              score: scoreData.score,
              timestamp: scoreData.timestamp
            };
          } catch (error) {
            console.error("Error fetching score data:", error);
            return null;
          }
        })
      );

      // Filter out null values and sort by score
      const validScores = scores.filter(score => score !== null);
      const sortedScores = validScores.sort((a, b) => b.score - a.score);
      
      return sortedScores.slice(0, 10); // Top 10
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setIrysUploader(null);
    setWalletAddress("");
    setBalance("0");
    setIsConnected(false);
  };

  const value = {
    irysUploader,
    walletAddress,
    balance,
    isConnected,
    isLoading,
    initIrys,
    fundAccount,
    uploadScore,
    fetchLeaderboard,
    disconnect
  };

  return (
    <IrysContext.Provider value={value}>
      {children}
    </IrysContext.Provider>
  );
};