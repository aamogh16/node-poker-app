import { Table } from "@chevtek/poker-engine";
import { WebSocket, WebSocketServer } from "ws";
import { FixedPlayer } from "./FixedPlayer";

interface ConnectedPlayer {
  id: string;
  name: string;
  socket: WebSocket;
}

export class PokerGameService {
  private table: Table;
  private connectedPlayers: Map<string, ConnectedPlayer>;
  private wss: WebSocketServer;

  constructor(wss: WebSocketServer) {
    this.table = new Table(1000, 5, 10);
    // Replace the Player class and prototype
    (this.table.constructor as any).Player = FixedPlayer;
    (this.table as any).Player = FixedPlayer;
    this.connectedPlayers = new Map();
    this.wss = wss;
  }

  handleConnection(socket: WebSocket) {
    socket.on("message", (message: string) => {
      try {
        const data = JSON.parse(message);
        this.handleMessage(socket, data);
      } catch (error) {
        this.sendError(socket, "Invalid message format");
      }
    });

    socket.on("close", () => {
      // Find and remove disconnected player
      for (const [playerId, player] of this.connectedPlayers.entries()) {
        if (player.socket === socket) {
          this.handlePlayerLeave(playerId);
          break;
        }
      }
    });
  }

  private handleMessage(socket: WebSocket, message: any) {
    switch (message.type) {
      case "join":
        this.handlePlayerJoin(
          socket,
          message.playerId,
          message.name,
          message.buyIn
        );
        break;
      case "action":
        this.handlePlayerAction(
          message.playerId,
          message.action,
          message.amount
        );
        break;
      case "startGame":
        this.startNewHand();
        break;
      case "restart":
        this.restartGame();
        break;
      default:
        this.sendError(socket, "Unknown message type");
    }
  }

  private handlePlayerJoin(
    socket: WebSocket,
    playerId: string,
    name: string,
    buyIn: number // we'll ignore this parameter
  ) {
    try {
      // Check for duplicate names
      const isDuplicateName = Array.from(this.connectedPlayers.values()).some(
        (player) => player.name.toLowerCase() === name.toLowerCase()
      );

      if (isDuplicateName) {
        throw new Error(
          "A player with this name already exists. Please choose a different name."
        );
      }

      const FIXED_BUY_IN = 1000;
      this.table.sitDown(playerId, FIXED_BUY_IN);
      this.connectedPlayers.set(playerId, { id: playerId, name, socket });

      // Broadcast name and id
      this.broadcast({
        type: "playerJoined",
        playerId,
        name,
      });

      // Send initial state to the new player
      this.sendToPlayer(playerId, {
        type: "gameState",
        state: this.getPlayerState(playerId),
      });

      // Broadcast updated player list to all players
      this.broadcast({
        type: "players",
        players: this.getPublicPlayerStates(),
      });
    } catch (error: any) {
      this.sendError(socket, error.message);
    }
  }

  private handlePlayerLeave(playerId: string) {
    const player = this.table.players.find((p) => p?.id === playerId);
    if (player) {
      this.table.standUp(player);
      this.connectedPlayers.delete(playerId);

      this.broadcast({
        type: "players",
        players: this.getPublicPlayerStates(),
      });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async handlePlayerAction(
    playerId: string,
    action: string,
    amount?: number
  ) {
    try {
      const player = this.table.players.find((p) => p?.id === playerId);
      if (!player) throw new Error("Player not found");
      if (this.table.currentActor?.id !== playerId)
        throw new Error("Not your turn");

      // Add 2-second delay before processing the action
      await this.delay(2000);

      // Check if it's an all-in bet/raise
      const isAllIn = amount === player.stackSize;

      // Log Player Type
      console.log("Player Type:", typeof player);

      switch (action) {
        case "call":
          player.callAction();
          break;
        case "check":
          player.checkAction();
          break;
        case "fold":
          player.foldAction();
          break;
        case "bet":
          if (amount === undefined) throw new Error("Amount required for bet");
          if (!isAllIn && amount < this.table.bigBlind) {
            throw new Error("Bet must be at least the big blind");
          }
          player.betAction(amount);
          break;
        case "raise":
          if (amount === undefined)
            throw new Error("Amount required for raise");

          const isPreFlop = !this.table.communityCards.length;
          const isSmallBlindPosition = player.bet === this.table.smallBlind;
          const isRaisingToBigBlind =
            isPreFlop && isSmallBlindPosition && amount === this.table.bigBlind;

          const raiseAmount = amount! - (this.table.currentBet || 0);
          if (
            !isAllIn &&
            !isRaisingToBigBlind &&
            raiseAmount < this.table.bigBlind
          ) {
            throw new Error(
              `Raise must increase the current bet by at least the big blind (${this.table.bigBlind})`
            );
          }
          player.raiseAction(amount);
          break;
        default:
          throw new Error("Invalid action");
      }

      this.broadcastGameState();

      // Check if the hand is over
      if (!this.table.currentRound) {
        this.handleHandComplete();
      }
    } catch (error: any) {
      this.sendError(
        this.connectedPlayers.get(playerId)?.socket!,
        error.message
      );

      try {
        const player = this.table.players.find((p) => p?.id === playerId);
        if (player && this.table.currentActor?.id === playerId) {
          player.foldAction();

          this.broadcast({
            type: "notification",
            message: `${
              this.connectedPlayers.get(playerId)?.name || "Player"
            } auto-folded due to invalid action: ${error.message}`,
          });

          this.broadcastGameState();

          if (!this.table.currentRound) {
            this.handleHandComplete();
          }
        }
      } catch (foldError) {
        console.error("Error during auto-fold:", foldError);
      }
    }
  }

  private startNewHand() {
    try {
      this.table.dealCards();
      this.broadcastGameState();
    } catch (error) {
      console.error("Error starting new hand:", error);
      this.broadcast({
        type: "error",
        error: "Failed to start new hand. Make sure there are enough players.",
      });
    }
  }

  private restartGame() {
    // Create fresh table
    this.table = new Table(1000, 5, 10);
    // Replace the Player class and prototype
    (this.table.constructor as any).Player = FixedPlayer;
    (this.table as any).Player = FixedPlayer;

    // Clear all connected players
    this.connectedPlayers.clear();

    // Broadcast the reset to all players
    this.broadcast({
      type: "gameReset",
      message: "Game has been reset. All players must rejoin.",
    });

    // Broadcast empty game state
    this.broadcastGameState();
  }

  private handleHandComplete() {
    // Broadcast results
    this.broadcast({
      type: "handComplete",
      winners: this.table.winners?.map((w) => ({
        playerId: w.id,
        amount: this.table.pots.reduce(
          (total, pot) =>
            pot.winners?.includes(w)
              ? total + pot.amount / (pot.winners?.length || 1)
              : total,
          0
        ),
      })),
    });

    // Check for bankrupt players and remove them
    this.table.players.forEach((player) => {
      if (player && player.stackSize === 0) {
        // Remove player from table
        this.table.standUp(player);

        // Remove from connected players
        this.connectedPlayers.delete(player.id);

        // Send message to the bankrupt player
        this.sendToPlayer(player.id, {
          type: "kicked",
          message:
            "You have been removed from the table due to insufficient funds.",
        });

        // Broadcast player removal to all players
        this.broadcast({
          type: "notification",
          message: `${
            this.connectedPlayers.get(player.id)?.name || "Player"
          } has been removed from the table due to insufficient funds.`,
        });
      }
    });

    // Broadcast updated player list
    this.broadcast({
      type: "players",
      players: this.getPublicPlayerStates(),
    });
  }

  private getPlayerState(playerId: string) {
    const player = this.table.players.find((p) => p?.id === playerId);
    return {
      holeCards: player?.holeCards || [],
      availableActions: player?.legalActions() || [],
      stackSize: player?.stackSize || 0,
      bet: player?.bet || 0,
      isCurrentActor: this.table.currentActor?.id === playerId,
      communityCards: this.table.communityCards,
      pot: this.table.pots.reduce((total, pot) => total + pot.amount, 0),
      currentBet: this.table.currentBet,
      currentRound: this.table.currentRound,
    };
  }

  private getPublicPlayerStates() {
    return this.table.players.map((player) =>
      player
        ? {
            id: player.id,
            name: this.connectedPlayers.get(player.id)?.name,
            stackSize: player.stackSize,
            bet: player.bet,
            folded: player.folded,
            isCurrentActor: this.table.currentActor?.id === player.id,
          }
        : null
    );
  }

  private broadcast(message: any) {
    const messageStr = JSON.stringify(message);
    console.log("Broadcasting message to all clients:", messageStr);

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  private broadcastGameState() {
    // Send public state to all players
    this.broadcast({
      type: "gameState",
      state: {
        communityCards: this.table.communityCards,
        pot: this.table.pots.reduce((total, pot) => total + pot.amount, 0),
        currentBet: this.table.currentBet,
        currentActor: this.table.currentActor?.id,
        currentRound: this.table.currentRound,
        players: this.getPublicPlayerStates(),
      },
    });

    // Send private state to each player
    for (const [playerId, player] of this.connectedPlayers) {
      const currentPlayer = this.table.players.find((p) => p?.id === playerId);
      const isCurrentActor = this.table.currentActor?.id === playerId;
      const currentBet = this.table.currentBet || 0;

      this.sendToPlayer(playerId, {
        type: "privateState",
        state: {
          holeCards: currentPlayer?.holeCards,
          availableActions: isCurrentActor
            ? this.table.currentActor?.legalActions()
            : [],
          // minRaise is now the minimum amount to raise TO
          minRaise: currentBet + (this.table.lastRaise ?? this.table.bigBlind),
          // maxBet is the total amount the player can bet TO
          maxBet: (currentPlayer?.stackSize ?? 0) + (currentPlayer?.bet ?? 0),
        },
      });
    }
  }

  private sendToPlayer(playerId: string, message: any) {
    const player = this.connectedPlayers.get(playerId);
    if (player) {
      const messageStr = JSON.stringify(message);
      console.log(`Sending message to player ${playerId}:`, messageStr);
      player.socket.send(messageStr);
    }
  }

  private sendError(socket: WebSocket, error: string) {
    const message = { type: "error", error };
    const messageStr = JSON.stringify(message);
    console.log("Sending error message:", messageStr);
    socket.send(messageStr);
  }
}
