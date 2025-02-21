"use client";

import { useGameState } from "@/contexts/GameStateContext";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useEffect, useState } from "react";
import CardComponent from "./Card";
import PlayerSpot from "./PlayerSpot";

interface Winner {
  playerId: string;
  amount: number;
}

export default function PokerTable() {
  const { gameState, performAction } = useGameState();
  const { connected } = useWebSocket();
  const [winners, setWinners] = useState<Winner[]>([]);
  const [showWinners, setShowWinners] = useState(false);

  useEffect(() => {
    if (gameState?.winners) {
      setWinners(gameState.winners);
      setShowWinners(true);

      // After 5 seconds, hide winners and deal new hand
      const timer = setTimeout(() => {
        setShowWinners(false);
        performAction("startGame");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [gameState?.winners, performAction]);

  const handleNewGame = () => {
    performAction("startGame");
  };

  const handleRestart = () => {
    performAction("restart");
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-green-800 flex items-center justify-center">
        <div className="text-white text-xl">Connecting to game server...</div>
      </div>
    );
  }

  const getWinnerDisplay = () => {
    if (!winners.length) return "";

    const winnerNames = winners.map((winner) => {
      const player = gameState?.players.find((p) => p?.id === winner.playerId);
      return `${player?.name} ($${winner.amount})`;
    });

    return winnerNames.length === 1
      ? `${winnerNames[0]} wins!`
      : `Split pot: ${winnerNames.join(" & ")}`;
  };

  return (
    <div className="min-h-screen bg-green-800 p-8 relative">
      {/* Control Buttons */}
      <div className="absolute top-4 right-4 flex gap-4">
        <button
          onClick={handleNewGame}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors duration-200"
        >
          Deal New Hand
        </button>
        <button
          onClick={handleRestart}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors duration-200"
        >
          Restart Game
        </button>
      </div>

      {/* Table */}
      <div className="relative w-[800px] h-[400px] mx-auto border-4 border-yellow-900 rounded-full bg-green-700">
        {/* Center Container for Community Cards and Pot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
          {/* Winner Display */}
          {showWinners && (
            <div className="text-yellow-300 text-2xl font-bold mb-2 animate-bounce">
              {getWinnerDisplay()}
            </div>
          )}

          {/* Community Cards */}
          <div className="flex justify-center gap-2 min-h-[96px]">
            {gameState?.communityCards?.map((card, i) => (
              <CardComponent key={i} card={card} />
            ))}
          </div>

          {/* Pot Display */}
          <div className="text-white text-xl font-bold mt-2">
            {gameState?.pot
              ? `Pot: $${gameState.pot}`
              : "Waiting for players..."}
          </div>
        </div>

        {/* Players */}
        {Array.from({ length: 9 }).map((_, i) => (
          <PlayerSpot
            key={i}
            position={i}
            player={gameState?.players?.[i] || null}
            isCurrentPlayer={false}
            holeCards={null}
          />
        ))}
      </div>
    </div>
  );
}
