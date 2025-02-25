# Poker Server API Documentation

This server hosts a poker game that bots can connect to via WebSocket. The server manages the game state and enforces poker rules, while bots make decisions for their players.

## Connecting Your Bot

Connect to the WebSocket server at: `ws://SERVER_IP:${port}`

- Define port in `.env` file: `PORT=...`

## Protocol

### Joining the Game

To join the game, send:

```json
{
  "type": "join",
  "playerId": "your-unique-id", // make this unique - only your team should know
  "name": "Your Bot Name"
}
```

All players automatically start with 1000 chips.

### Making Actions

When it's your turn, send:

```json
{
  "playerId": "your-unique-id",
  "type": "action",
  "action": "bet", // fold/check/call/bet/raise
  "amount": 100 // required for bet/raise
}
```

### Server Messages

You'll receive these message types:

1. Game State (public information):

```json
{
  "type": "gameState",
  "state": {
    "communityCards": ["Ah", "Kd", "Qc"],
    "pot": 150,
    "currentBet": 20,
    "players": [
      {
        "id": "player-id",
        "name": "Bot Name",
        "stackSize": 980,
        "bet": 20,
        "folded": false,
        "isCurrentActor": true
      }
    ],
    "currentRound": "flop"
  }
}
```

2. Private State (your hole cards and available actions):

```json
{
  "type": "privateState",
  "state": {
    "holeCards": ["As", "Ks"],
    "availableActions": ["fold", "call", "raise"],
    "minRaise": 40, // Minimum amount you must raise TO (not by)
    "maxBet": 1000 // Maximum amount you can raise TO (your stack + current bet)
  }
}
```

3. Error messages:

```json
{
  "type": "error",
  "message": "Invalid action"
}
```

## Card Format

Cards are represented as two-character strings:

- First character: rank (2-9, T, J, Q, K, A)
- Second character: suit (h=hearts, d=diamonds, c=clubs, s=spades)
  Example: "Ah" = Ace of hearts

## Example Bot Implementation

Here's a minimal Python example:

```python
import websocket
import json
import uuid

def on_message(ws, message):
    data = json.loads(message)
    if data["type"] == "privateState":
        # Simple bot that always calls
        ws.send(json.dumps({
            "type": "action",
            "action": "call"
        }))

def on_error(ws, error):
    print(error)

def on_open(ws):
    # Join the game
    ws.send(json.dumps({
        "type": "join",
        "playerId": str(uuid.uuid4()),
        "name": "SimpleBot"
    }))

ws = websocket.WebSocketApp(
    "ws://SERVER_IP:3001",
    on_message=on_message,
    on_error=on_error,
    on_open=on_open
)
ws.run_forever()
```

## Rules and Limitations

- Maximum 9 players per table
- No reconnection support (if you disconnect, you forfeit)
- 30-second time limit for actions
- Standard No-Limit Texas Hold'em rules
