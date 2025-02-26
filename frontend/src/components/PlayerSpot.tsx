interface PlayerSpotProps {
  position: number;
  player: {
    id: string;
    name: string;
    stackSize: number;
    bet: number;
    folded: boolean;
    isCurrentActor: boolean;
    lastAction?: string;
  } | null;
  isCurrentPlayer: boolean;
  holeCards: unknown | null;
  winningHand?: {
    descr: string;
    cards: { _rank: string; _suit: string }[];
  };
}

import CardComponent from "./Card";

export default function PlayerSpot({
  position,
  player,
  winningHand,
}: PlayerSpotProps) {
  // Manual position mapping for 9 seats
  // const getPosition = (pos: number): { x: number; y: number } => {
  //   switch (pos) {
  //     case 0: // Bottom center
  //       return { x: 100, y: 250 };
  //     case 1: // Bottom right
  //       return { x: 380, y: 200 };
  //     case 2: // Right
  //       return { x: 450, y: 30 };
  //     case 3: // Top right
  //       return { x: 350, y: -160 };
  //     case 4: // Top center
  //       return { x: 0, y: -190 };
  //     case 5: // Top left
  //       return { x: -350, y: -160 };
  //     case 6: // Left
  //       return { x: -450, y: 30 };
  //     case 7: // Bottom left
  //       return { x: -360, y: 200 };
  //     case 8: // Bottom center-left
  //       return { x: -100, y: 250 };
  //     default:
  //       return { x: 0, y: 0 };
  //   }
  // };

  const getPosition = (pos: number): { x: number; y: number } => {
    switch (pos) {
      case 0: // Bottom center-right
        return { x: 150, y: 250 };
      case 1: // Bottom right
        return { x: 400, y: 190 };
      case 2: // Right
        return { x: 450, y: 20 };
      case 3: // Top right
        return { x: 350, y: -160 };
      case 4: // Top center
        return { x: 0, y: -190 };
      case 5: // Top left
        return { x: -350, y: -160 };
      case 6: // Left
        return { x: -450, y: 20 };
      case 7: // Bottom left
        return { x: -400, y: 190 };
      case 8: // Bottom center-left
        return { x: -150, y: 250 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const { x, y } = getPosition(position);

  return (
    <div
      className={`absolute w-32 h-24 -translate-x-1/2 -translate-y-1/2`}
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
      }}
    >
      <div
        className={`flex flex-col bg-gray-800 text-white p-2 rounded-lg shadow-lg ${
          player?.folded ? "opacity-50" : ""
        } ${player?.isCurrentActor ? "ring-2 ring-yellow-400" : ""}`}
      >
        {player ? (
          <>
            <div className="text-sm font-bold truncate">{player.name}</div>
            {winningHand ? (
              <div className="flex flex-col items-center my-2 mx-1 rounded-lg py-2 bg-green-700">
                <div className="text-sm text-green-100 font-medium mb-1 text-center pb-2">
                  {winningHand.descr}
                </div>
                <div className="flex justify-center text-center h-14 overflow-hidden -mt-1 mb-1 gap-2">
                  {winningHand.cards.map((card, i) => (
                    <div
                      key={i}
                      className="transform scale-[0.55] origin-top -mx-4 mt-1"
                    >
                      <CardComponent card={card} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="text-sm">${player.stackSize}</div>
                {player.bet > 0 && (
                  <div className="text-xs text-yellow-400">
                    Bet: ${player.bet}
                  </div>
                )}
                {player.folded && (
                  <div className="text-xs text-red-400">Folded</div>
                )}
                {player.lastAction && (
                  <div
                    className={`text-xs animate-fade-out font-bold px-2 py-1 mt-1 mx-auto w-3/4 text-center rounded-full inline-block
                    ${
                      player.lastAction.startsWith("fold")
                        ? "text-red-400 bg-red-800"
                        : player.lastAction.startsWith("call") ||
                          player.lastAction.startsWith("check")
                        ? "text-green-400 bg-green-800"
                        : "text-yellow-400 bg-yellow-800"
                    }`}
                  >
                    {player.lastAction}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-400 text-center">Empty Seat</div>
        )}
      </div>
    </div>
  );
}
