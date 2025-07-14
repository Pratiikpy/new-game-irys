import React, { useState, useEffect } from "react";
import { useIrys } from "../contexts/IrysContext";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Trophy, Medal, Award, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

const Leaderboard = () => {
  const { fetchLeaderboard } = useIrys();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeaderboard = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    
    try {
      const leaderboardData = await fetchLeaderboard();
      setScores(leaderboardData);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "border-yellow-400/30 bg-yellow-400/10";
      case 2:
        return "border-gray-400/30 bg-gray-400/10";
      case 3:
        return "border-amber-600/30 bg-amber-600/10";
      default:
        return "border-purple-500/20 bg-purple-500/5";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
            <div className="w-24 h-4 bg-gray-600 rounded animate-pulse"></div>
          </div>
          <div className="w-8 h-8 bg-gray-600 rounded animate-pulse"></div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-3 bg-gray-800/50 rounded-lg animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gray-600 rounded"></div>
                <div className="w-20 h-4 bg-gray-600 rounded"></div>
              </div>
              <div className="w-12 h-4 bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-white font-medium">Live from Irys</span>
        </div>
        <Button
          onClick={() => loadLeaderboard(true)}
          disabled={refreshing}
          size="sm"
          variant="outline"
          className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {scores.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No scores yet!</p>
          <p className="text-sm text-gray-500 mt-2">Be the first to play and save your score on-chain</p>
        </div>
      ) : (
        <div className="space-y-2">
          {scores.map((score, index) => (
            <Card key={score.id} className={`p-3 ${getRankColor(index + 1)} border transition-all duration-300 hover:scale-[1.02]`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getRankIcon(index + 1)}
                  <div>
                    <p className="text-white font-medium">
                      {formatAddress(score.wallet)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(score.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="font-bold">
                    {score.score.toLocaleString()}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="text-center pt-4">
        <p className="text-xs text-gray-500">
          Powered by Irys • Permanent Storage
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;