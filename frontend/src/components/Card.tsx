import type { Card } from "../contexts/GameStateContext";

interface CardProps {
  card: Card;
}

export default function CardComponent({ card }: CardProps) {
  const rank = card._rank;
  const suit = card._suit;

  console.log("card", card);
  console.log("rank", rank);
  console.log("suit", suit);

  return (
    <div className="w-16 h-24 text-2xl bg-white rounded-lg shadow-lg flex items-center justify-center">
      <span
        className={`${
          suit === "h" || suit === "d" ? "text-red-600" : "text-black"
        }`}
      >
        {rank}
        {getSuitSymbol(suit)}
      </span>
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
