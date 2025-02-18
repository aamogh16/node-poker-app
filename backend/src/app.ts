import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { PokerGameService } from './services/PokerGameService';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const gameService = new PokerGameService();

wss.on('connection', (socket) => {
  gameService.handleConnection(socket);
});

export default server;