"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useWebSocket } from "./WebSocketContext";

interface Player {
  id: string;
  name: string;
  stackSize: number;
  bet: number;
  folded: boolean;
  isCurrentActor: boolean;
}

export interface Card {
  _rank: string;
  _suit: string;
}

interface GameState {
  communityCards: Card[];
  pot: number;
  currentBet: number;
  currentActor: string | null;
  players: (Player | null)[];
  winners?: Winner[];
}

interface Winner {
  playerId: string;
  amount: number;
}

interface PrivateState {
  holeCards: Card[];
  availableActions: string[];
}

interface GameStateContextType {
  gameState: GameState | null;
  privateState: PrivateState | null;
  performAction: (action: string, amount?: number) => void;
}

const GameStateContext = createContext<GameStateContextType>({
  gameState: null,
  privateState: null,
  performAction: () => {},
});

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const { connected, sendMessage, addMessageListener } = useWebSocket();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [privateState, setPrivateState] = useState<PrivateState | null>(null);

  useEffect(() => {
    console.log(
      "GameStateContext: Setting up message listener. Connected:",
      connected
    );

    if (!connected) {
      console.log("GameStateContext: Not connected, skipping listener setup");
      return;
    }

    const removeListener = addMessageListener((message: any) => {
      console.log("GameStateContext: Received message:", message);

      switch (message.type) {
        case "gameState":
          console.log("GameStateContext: Updating game state:", message.state);
          setGameState(message.state);
          break;
        case "privateState":
          console.log(
            "GameStateContext: Updating private state:",
            message.state
          );
          setPrivateState(message.state);
          break;
        case "players":
          console.log("GameStateContext: Updating players:", message.players);
          setGameState((prevState) => {
            const newState = prevState
              ? {
                  ...prevState,
                  players: message.players,
                }
              : {
                  communityCards: [],
                  pot: 0,
                  currentBet: 0,
                  currentActor: null,
                  players: message.players,
                };
            console.log(
              "GameStateContext: New game state after players update:",
              newState
            );
            return newState;
          });
          break;
        case "notification":
          // You can handle notifications here, perhaps showing them in a toast
          console.log("Game notification:", message.message);
          break;
        default:
          console.log(
            "GameStateContext: Unhandled message type:",
            message.type
          );
      }
    });

    return () => {
      console.log("GameStateContext: Cleaning up message listener");
      removeListener();
    };
  }, [connected, addMessageListener]);

  const performAction = useCallback(
    (action: string, amount?: number) => {
      if (action === "startGame") {
        sendMessage({ type: "startGame" });
      } else if (action === "restart") {
        sendMessage({ type: "restart" });
      } else {
        sendMessage({ type: "action", action, amount });
      }
    },
    [sendMessage]
  );

  return (
    <GameStateContext.Provider
      value={{ gameState, privateState, performAction }}
    >
      {children}
    </GameStateContext.Provider>
  );
}

export const useGameState = () => useContext(GameStateContext);
