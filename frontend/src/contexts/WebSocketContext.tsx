"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type MessageHandler = (message: any) => void;

interface WebSocketContextType {
  socket: WebSocket | null;
  connected: boolean;
  sendMessage: (message: any) => void;
  addMessageListener: (handler: MessageHandler) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  connected: false,
  sendMessage: () => {},
  addMessageListener: () => () => {},
});

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messageHandlers] = useState<Set<MessageHandler>>(new Set());

  useEffect(() => {
    let ws: WebSocket;

    function connect() {
      console.log("Attempting to create WebSocket connection...");
      ws = new WebSocket(`ws://${process.env.NEXT_PUBLIC_WS_URL}:3001`);

      ws.addEventListener("open", () => {
        console.log("WebSocket connection established");
        setConnected(true);
        setSocket(ws);
      });

      ws.addEventListener("close", () => {
        console.log("WebSocket connection closed");
        setConnected(false);
        setSocket(null);
        // Attempt to reconnect after 2 seconds
        setTimeout(connect, 2000);
      });

      ws.addEventListener("error", (error) => {
        console.error("WebSocket error occurred:", error);
      });

      // Single message handler
      ws.addEventListener("message", (event) => {
        console.log("🔔 WebSocket message received:", event.data);

        try {
          const data = JSON.parse(event.data);
          console.log("📦 Parsed message data:", data);

          if (messageHandlers.size === 0) {
            console.warn("⚠️ No message handlers registered");
          }

          messageHandlers.forEach((handler) => {
            try {
              handler(data);
            } catch (handlerError) {
              console.error("❌ Handler error:", handlerError);
            }
          });
        } catch (parseError) {
          console.error("❌ Parse error:", parseError);
        }
      });
    }

    connect();

    return () => {
      console.log("Cleaning up WebSocket connection");
      ws?.close();
    };
  }, []); // Empty dependency array since messageHandlers is a Set

  const sendMessage = useCallback(
    (message: any) => {
      if (socket?.readyState === WebSocket.OPEN) {
        const messageStr = JSON.stringify(message);
        console.log("Sending WebSocket message:", messageStr);
        socket.send(messageStr);
      } else {
        console.warn(
          "Cannot send message - WebSocket is not connected. ReadyState:",
          socket?.readyState
        );
      }
    },
    [socket]
  );

  const addMessageListener = useCallback(
    (handler: MessageHandler) => {
      console.log("Adding new message handler");
      messageHandlers.add(handler);

      return () => {
        console.log("Removing message handler");
        messageHandlers.delete(handler);
      };
    },
    [messageHandlers]
  );

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        connected,
        sendMessage,
        addMessageListener,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext);
