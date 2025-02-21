"use client";

import { useGameState } from "@/contexts/GameStateContext";
import { useWebSocket } from "@/contexts/WebSocketContext";
import CardComponent from "./Card";
import PlayerSpot from "./PlayerSpot";

export default function PokerTable() {
  const { gameState, performAction } = useGameState();
  const { connected } = useWebSocket();

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

      {/* Pot */}
      <div className="text-white text-center mb-8">
        {gameState?.pot ? `Pot: $${gameState.pot}` : "Waiting for players..."}
      </div>

      {/* Table */}
      <div className="relative w-[800px] h-[400px] mx-auto border-4 border-yellow-900 rounded-full bg-green-700">
        {/* Community Cards - Now centered on the table */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center gap-2 min-h-[96px]">
          {gameState?.communityCards?.map((card, i) => (
            <CardComponent key={i} card={card} />
          ))}
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
