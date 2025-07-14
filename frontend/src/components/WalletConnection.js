import React, { useState, useEffect } from "react";
import { useIrys } from "../contexts/IrysContext";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Wallet, Zap, AlertCircle, CheckCircle, User, Edit3, Check, X } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const WalletConnection = ({ onConnectionChange, isConnected }) => {
  const { 
    walletAddress, 
    balance, 
    isLoading, 
    username,
    setUsername,
    initIrys, 
    fundAccount,
    disconnect 
  } = useIrys();
  const { toast } = useToast();
  const [isFunding, setIsFunding] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState("");

  const handleUsernameEdit = () => {
    setTempUsername(username);
    setIsEditingUsername(true);
  };

  const handleUsernameSave = () => {
    setUsername(tempUsername);
    setIsEditingUsername(false);
    toast({
      title: "Username Updated!",
      description: "Your username has been saved",
    });
  };

  const handleUsernameCancel = () => {
    setTempUsername("");
    setIsEditingUsername(false);
  };

  useEffect(() => {
    onConnectionChange(!!walletAddress);
  }, [walletAddress, onConnectionChange]);

  const handleConnect = async () => {
    try {
      await initIrys();
      toast({
        title: "Wallet Connected!",
        description: "Successfully connected to Irys devnet",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFund = async () => {
    setIsFunding(true);
    try {
      const result = await fundAccount("0.01");
      toast({
        title: "Account Funded!",
        description: `Added ${result.funded} ETH to your Irys account`,
      });
    } catch (error) {
      toast({
        title: "Funding Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsFunding(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Successfully disconnected from Irys",
    });
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!walletAddress) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wallet className="w-6 h-6 text-purple-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Connect Wallet</h3>
                <p className="text-sm text-gray-400">Connect to start playing and saving scores</p>
              </div>
            </div>
            <Button
              onClick={handleConnect}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoading ? "Connecting..." : "Connect MetaMask"}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const balanceNum = parseFloat(balance);
  const hasBalance = balanceNum > 0;

  return (
    <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {formatAddress(walletAddress)}
              </h3>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  Sepolia Testnet
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1 text-green-400" />
                  Connected
                </Badge>
              </div>
              
              {/* Username Section */}
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-purple-400" />
                {isEditingUsername ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                      placeholder="Enter username"
                      className="h-6 text-xs w-24"
                      maxLength={20}
                    />
                    <Button
                      onClick={handleUsernameSave}
                      size="sm"
                      className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={handleUsernameCancel}
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0 border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-300">
                      {username || "Anonymous"}
                    </span>
                    <Button
                      onClick={handleUsernameEdit}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-purple-400 hover:bg-purple-500/10"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={handleDisconnect}
            variant="outline"
            size="sm"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            Disconnect
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-medium">Irys Balance:</span>
            <span className="text-purple-400 font-bold">{balance} ETH</span>
          </div>
          
          {!hasBalance && (
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-400" />
              <Button
                onClick={handleFund}
                disabled={isFunding}
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
              >
                {isFunding ? "Funding..." : "Fund Account"}
              </Button>
            </div>
          )}
        </div>

        {!hasBalance && (
          <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-400" />
              <p className="text-sm text-orange-300">
                You need to fund your Irys account to save scores on-chain
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default WalletConnection;