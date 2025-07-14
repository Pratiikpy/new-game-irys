import { Irys } from "@irys/sdk";

// Singleton cache so we don't reconnect every click
let irys: Irys;

export async function getIrys() {
  if (irys) return irys;

  // Ask MetaMask for an account
  const [account] = await window.ethereum.request({
    method: "eth_requestAccounts"
  });

  // Connect via Devnet with MetaMask signer
  irys = await Irys.connect({
    rpcUrl: import.meta.env.VITE_IRYS_RPC_URL || process.env.VITE_IRYS_RPC_URL,
    gatewayUrl: import.meta.env.VITE_GATEWAY_URL || process.env.VITE_GATEWAY_URL,
    walletProvider: window.ethereum,     // tells SDK to use the signer
  });

  console.log("🎮 Connected to Irys Devnet as:", account);
  return irys;
}

// Upload score to Irys
export async function uploadGameScore(username: string, score: number) {
  try {
    const irys = await getIrys();
    const receipt = await irys.uploadJSON(
      {
        player: username || "Anonymous Gamer",
        score: score,
        timestamp: Date.now(),
        game: "PixelInvaders"
      },
      {
        tags: {
          App: "PixelInvaders",
          Game: "PixelInvaders", 
          Network: import.meta.env.VITE_IRYS_NETWORK || process.env.VITE_IRYS_NETWORK || "devnet",
          Player: username || "Anonymous"
        },
      }
    );

    console.log("🚀 Score uploaded to Irys →", receipt.id);
    return receipt;
  } catch (err) {
    console.error("❌ Irys upload failed", err);
    throw err;
  }
}

// Fetch leaderboard from Irys
export async function fetchGameLeaderboard(limit = 50) {
  try {
    const irys = await getIrys();
    const txs = await irys
      .search()
      .tags("App", "PixelInvaders")
      .sort("DESC")
      .limit(limit)
      .find();

    const rows = await Promise.all(
      txs.map(async (tx: any) => {
        try {
          const data = await fetch(
            `${import.meta.env.VITE_GATEWAY_URL || process.env.VITE_GATEWAY_URL}/${tx.id}`
          ).then((r) => r.json());
          return { ...data, id: tx.id };
        } catch (error) {
          console.error("Error fetching score data:", error);
          return null;
        }
      })
    );

    // Filter out null values and sort by score
    const validScores = rows.filter(row => row !== null);
    const sortedScores = validScores.sort((a, b) => b.score - a.score);
    
    return sortedScores.slice(0, 10); // Top 10
  } catch (err) {
    console.error("❌ Failed to fetch leaderboard", err);
    return [];
  }
}