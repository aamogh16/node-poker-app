# node-poker-app

This project is a full-stack poker application built using the `@chevtek/poker-engine` library. It provides a server for hosting poker games and a frontend interface for players to interact with the game.

## Description

The node-poker-app consists of a backend server that manages the game state and a frontend client for user interaction. It utilizes WebSocket connections to enable real-time communication between the server and clients.

## Libraries Used

- Backend: `@chevtek/poker-engine` - primarily built on this engine.
- Frontend: React with TypeScript

## Required Environment Variables

Frontend (these should point to backend)
```
NEXT_PUBLIC_WS_URL=
NEXT_PUBLIC_PORT=
```

Backend
```
PORT=
```

## How to Run

1. Open two separate terminal windows.
2. In the first terminal:
   ```
   cd backend
   yarn dev
   ```
3. In the second terminal:
   ```
   cd frontend
   yarn dev
   ```

## Documentation

For detailed information about the WebSocket API and how to interact with the poker server, please refer to the README.md file in the backend folder.
