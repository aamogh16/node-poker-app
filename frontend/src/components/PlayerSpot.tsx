interface PlayerSpotProps {
  position: number;
  player: {
    id: string;
    name: string;
    stackSize: number;
    bet: number;
    folded: boolean;
    isCurrentActor: boolean;
  } | null;
  isCurrentPlayer: boolean;
  holeCards: any | null;
}

export default function PlayerSpot({
  position,
  player,
  isCurrentPlayer,
  holeCards,
}: PlayerSpotProps) {
  // Manual position mapping for 9 seats
  const getPosition = (pos: number): { x: number; y: number } => {
    switch (pos) {
      case 0: // Bottom center
        return { x: 100, y: 230 };
      case 1: // Bottom right
        return { x: 320, y: 190 };
      case 2: // Right
        return { x: 380, y: 30 };
      case 3: // Top right
        return { x: 340, y: -100 };
      case 4: // Top center
        return { x: 0, y: -170 };
      case 5: // Top left
        return { x: -340, y: -100 };
      case 6: // Left
        return { x: -380, y: 30 };
      case 7: // Bottom left
        return { x: -320, y: 190 };
      case 8: // Bottom center-left
        return { x: -100, y: 230 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const { x, y } = getPosition(position);

  return (
    <div
      className={`absolute w-32 h-24 -translate-x-1/2 -translate-y-1/2 
        ${player?.isCurrentActor ? "ring-2 ring-yellow-400" : ""}`}
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
      }}
    >
      <div className="bg-gray-800 text-white p-2 rounded-lg shadow-lg">
        {player ? (
          <>
            <div className="text-sm font-bold truncate">{player.name}</div>
            <div className="text-sm">${player.stackSize}</div>
            {player.bet > 0 && (
              <div className="text-xs text-yellow-400">Bet: ${player.bet}</div>
            )}
            {player.folded && (
              <div className="text-xs text-red-400">Folded</div>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-400 text-center">Empty Seat</div>
        )}
      </div>
    </div>
  );
}
