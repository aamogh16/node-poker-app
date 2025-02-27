# node-poker-app

This project is a full-stack poker application built using the `@chevtek/poker-engine` library. It provides a server for hosting poker games and a frontend interface for players to interact with the game.

_Originally made for the Northeastern ACM Algorithmic Poker Hackathon - a comprehensive bot template for this can be found [here!](https://github.com/akala47/acm_pokerbot)_

## Description

The node-poker-app consists of a backend server that manages the game state and a frontend client for user interaction. It utilizes WebSocket connections to enable real-time communication between the server and clients.

## Libraries Used

- Backend: `@chevtek/poker-engine` - primarily built on this engine.
- Frontend: React with TypeScript

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```bash
BACKEND_PORT=3002              # Port for the backend server
WS_URL=localhost               # WebSocket server hostname/IP
SOCKET_KEY=mycustomauthkey     # Custom auth key sent with authenticated socket messages
ADMIN_PASS_HASH=yoursha256hash # Hashed password for accessing the client/GUI
```

These variables will be shared between the frontend and backend applications.

## How to Run

1. Create the `.env` file in the root directory as described above
2. Open a terminal and run the following based on your desired config:

   **Development**
   ```
   yarn
   yarn dev
   ```

   **Docker-based production build**
   ```
   yarn docker:build
   yarn docker:up
   ```

## Documentation

For detailed information about the WebSocket API and how to interact with the poker server, please refer to the README.md file in the backend folder.
