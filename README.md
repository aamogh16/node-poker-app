# node-poker-app

This project is a full-stack poker application built using the `@chevtek/poker-engine` library. It provides a server for hosting poker games and a frontend interface for players to interact with the game.

## Description

The node-poker-app consists of a backend server that manages the game state and a frontend client for user interaction. It utilizes WebSocket connections to enable real-time communication between the server and clients.

## Libraries Used

- Backend: `@chevtek/poker-engine` - primarily built on this engine.
- Frontend: React with TypeScript

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```bash
# Backend
PORT=3001
HOST=0.0.0.0

# Frontend
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## How to Run

1. Create the `.env` file in the root directory as described above
2. Open two separate terminal windows.
3. In the first terminal:
   ```bash
   cd backend
   yarn dev
   ```
4. In the second terminal:
   ```bash
   cd frontend
   yarn dev
   ```

## Documentation

For detailed information about the WebSocket API and how to interact with the poker server, please refer to the README.md file in the backend folder.
