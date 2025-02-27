import { AuthProvider } from "@/contexts/AuthContext";
import { GameStateProvider } from "@/contexts/GameStateContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Poker Game",
  description: "Real-time multiplayer poker game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-poppins antialiased`}>
        <AuthProvider>
          <WebSocketProvider>
            <GameStateProvider>{children}</GameStateProvider>
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
