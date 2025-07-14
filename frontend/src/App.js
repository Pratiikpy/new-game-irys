import { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GameCanvas from "./components/GameCanvas";
import Leaderboard from "./components/Leaderboard";
import WalletConnection from "./components/WalletConnection";
import { IrysProvider } from "./contexts/IrysContext";
import { Card } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Gamepad2, Trophy, Zap, Eye } from "lucide-react";

function App() {
  const [gameState, setGameState] = useState("menu"); // menu, playing, gameOver
  const [finalScore, setFinalScore] = useState(0);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const startGame = () => {
    if (!isWalletConnected) {
      alert("Please connect your wallet first!");
      return;
    }
    setGameState("playing");
  };

  const onGameOver = (score) => {
    setFinalScore(score);
    setGameState("gameOver");
  };

  const resetGame = () => {
    setGameState("menu");
    setFinalScore(0);
  };

  return (
    <IrysProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="relative z-10">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                <div className="container mx-auto px-4 py-8">
                  {/* Header */}
                  <div className="text-center mb-8 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-center mb-4">
                        <Eye className="w-12 h-12 text-purple-400 mr-3" />
                        <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          Pixel Invaders
                        </h1>
                      </div>
                      <p className="text-xl text-gray-300 mb-6">
                        Powered by Irys • Permanent On-Chain Leaderboard
                      </p>
                      <Badge variant="secondary" className="mb-4">
                        <Zap className="w-4 h-4 mr-1" />
                        Sepolia Testnet
                      </Badge>
                    </div>
                  </div>

                  {/* Wallet Connection */}
                  <div className="mb-8">
                    <WalletConnection 
                      onConnectionChange={setIsWalletConnected}
                      isConnected={isWalletConnected}
                    />
                  </div>

                  {/* Game Area */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Game Canvas */}
                    <div className="lg:col-span-2">
                      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20 overflow-hidden">
                        <div className="p-6">
                          {gameState === "menu" && (
                            <div className="text-center py-16">
                              <Gamepad2 className="w-24 h-24 mx-auto mb-6 text-purple-400" />
                              <h2 className="text-4xl font-bold text-white mb-4">
                                Ready to Invade?
                              </h2>
                              <p className="text-gray-300 mb-8 text-lg">
                                Defend Earth from the pixel invasion!<br />
                                Use ← → to move, SPACE to shoot
                              </p>
                              <Button 
                                onClick={startGame}
                                size="lg"
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-full transform transition-all duration-200 hover:scale-105"
                                disabled={!isWalletConnected}
                              >
                                {isWalletConnected ? "Start Game" : "Connect Wallet First"}
                              </Button>
                            </div>
                          )}
                          
                          {gameState === "playing" && (
                            <GameCanvas onGameOver={onGameOver} />
                          )}
                          
                          {gameState === "gameOver" && (
                            <div className="text-center py-16">
                              <Trophy className="w-24 h-24 mx-auto mb-6 text-yellow-400" />
                              <h2 className="text-4xl font-bold text-white mb-4">
                                Game Over!
                              </h2>
                              <p className="text-xl text-gray-300 mb-2">
                                Final Score: <span className="text-purple-400 font-bold">{finalScore}</span>
                              </p>
                              <p className="text-gray-400 mb-8">
                                Score saved to Irys blockchain
                              </p>
                              <Button 
                                onClick={resetGame}
                                size="lg"
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-full transform transition-all duration-200 hover:scale-105"
                              >
                                Play Again
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>

                    {/* Leaderboard */}
                    <div className="lg:col-span-1">
                      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
                        <div className="p-6">
                          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                            <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
                            Top Invaders
                          </h3>
                          <Leaderboard />
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              } />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </IrysProvider>
  );
}

export default App;