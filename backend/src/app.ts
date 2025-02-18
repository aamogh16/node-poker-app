import cors from "cors";
import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { PokerGameService } from "./services/PokerGameService";

const app = express();
app.use(cors());

const server = createServer(app);
const wss = new WebSocketServer({ server });
const gameService = new PokerGameService(wss);

const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0"; // Allow connections from any IP

// API documentation endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Poker Server API",
    documentation: {
      websocket: {
        url: `ws://${req.headers.host}`,
        protocols: {
          join: {
            type: "join",
            playerId: "string",
            name: "string",
            buyIn: "number",
          },
          action: {
            type: "action",
            action: "string (fold/check/call/bet/raise)",
            amount: "number (required for bet/raise)",
          },
        },
        serverMessages: {
          gameState: {
            type: "gameState",
            state: {
              communityCards: "string[]",
              pot: "number",
              currentBet: "number",
              players: "Player[]",
              currentRound: "string",
            },
          },
          privateState: {
            type: "privateState",
            state: {
              holeCards: "string[]",
              availableActions: "string[]",
              minBet: "number",
              maxBet: "number",
            },
          },
          error: {
            type: "error",
            message: "string",
          },
        },
      },
    },
  });
});

wss.on("connection", (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`New WebSocket connection from ${clientIp}`);

  // Send initial test message
  ws.send(
    JSON.stringify({
      type: "test",
      message: "Connected to server",
    })
  );

  ws.on("close", () => {
    console.log(`Client ${clientIp} disconnected`);
  });

  ws.on("message", (message) => {
    console.log(`Received from client: ${message}`);
  });

  gameService.handleConnection(ws);
});

wss.on("message", (message) => {
  console.log(`Received message: ${message}`);
});

server.listen({ port: Number(PORT), host: HOST }, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`WebSocket server ready for bot connections`);
});

export default server;
