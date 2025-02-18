import { Table } from "@chevtek/poker-engine";
import { WebSocket } from "ws";

interface ConnectedPlayer {
  id: string;
  name: string;
  socket: WebSocket;
}

export class PokerGameService {
  private table: Table;
  private connectedPlayers: Map<string, ConnectedPlayer>;

  constructor() {
    this.table = new Table(1000, 5, 10);
    this.connectedPlayers = new Map();
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
      default:
        this.sendError(socket, "Unknown message type");
    }
  }

  private handlePlayerJoin(
    socket: WebSocket,
    playerId: string,
    name: string,
    buyIn: number
  ) {
    try {
      this.table.sitDown(playerId, buyIn);
      this.connectedPlayers.set(playerId, { id: playerId, name, socket });

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

      // Start the game if we have enough players
      if (this.table.players.filter((p) => p !== null).length >= 2) {
        this.startNewHand();
      }
    } catch (error) {
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

  private handlePlayerAction(
    playerId: string,
    action: string,
    amount?: number
  ) {
    try {
      const player = this.table.players.find((p) => p?.id === playerId);
      if (!player) throw new Error("Player not found");
      if (this.table.currentActor?.id !== playerId)
        throw new Error("Not your turn");

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
          player.betAction(amount);
          break;
        case "raise":
          if (amount === undefined)
            throw new Error("Amount required for raise");
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
    } catch (error) {
      this.sendError(
        this.connectedPlayers.get(playerId)?.socket!,
        error.message
      );
    }
  }

  private startNewHand() {
    this.table.dealCards();
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

    // Start new hand after delay
    setTimeout(() => this.startNewHand(), 3000);
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
    for (const player of this.connectedPlayers.values()) {
      player.socket.send(messageStr);
    }
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
      this.sendToPlayer(playerId, {
        type: "privateState",
        state: {
          holeCards: this.table.players.find((p) => p?.id === playerId)
            ?.holeCards,
          availableActions:
            this.table.currentActor?.id === playerId
              ? this.table.currentActor.legalActions()
              : [],
        },
      });
    }
  }

  private sendToPlayer(playerId: string, message: any) {
    const player = this.connectedPlayers.get(playerId);
    if (player) {
      player.socket.send(JSON.stringify(message));
    }
  }

  private sendError(socket: WebSocket, error: string) {
    socket.send(JSON.stringify({ type: "error", error }));
  }
}
