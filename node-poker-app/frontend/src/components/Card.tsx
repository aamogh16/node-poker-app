import type { Card } from "../contexts/GameStateContext";

interface CardProps {
  card: Card;
}

export default function CardComponent({ card }: CardProps) {
  const rank = card._rank;
  const suit = card._suit;

  return (
    <div className="w-16 h-24 bg-white rounded-lg shadow-xl transform transition-transform hover:scale-105">
      {/* Card Inner */}
      <div className="w-full h-full rounded-lg border border-gray-200 flex flex-col justify-between p-2">
        {/* Top Rank & Suit */}
        <div
          className={`text-lg font-bold -mt-2 ${
            suit === "h" || suit === "d" ? "text-red-600" : "text-black"
          }`}
        >
          {rank}
          <span className="text-xl">{getSuitSymbol(suit)}</span>
        </div>

        {/* Center Suit */}
        <div
          className={`text-3xl text-center -mt-1 ${
            suit === "h" || suit === "d" ? "text-red-600" : "text-black"
          }`}
        >
          {getSuitSymbol(suit)}
        </div>

        {/* Bottom Rank & Suit (inverted) */}
        <div
          className={`text-lg font-bold mt-1 self-end rotate-180 ${
            suit === "h" || suit === "d" ? "text-red-600" : "text-black"
          }`}
        >
          {rank}
          <span className="text-xl">{getSuitSymbol(suit)}</span>
        </div>
      </div>
    </div>
  );
}

function getSuitSymbol(suit: string): string {
  switch (suit.toLowerCase()) {
    case "h":
      return "♥";
    case "d":
      return "♦";
    case "c":
      return "♣";
    case "s":
      return "♠";
    default:
      return suit;
  }
}
