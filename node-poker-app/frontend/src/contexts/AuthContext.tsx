"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => false,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if auth cookie exists
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check");
        setIsAuthenticated(response.ok);
      } catch (error: unknown) {
        console.error("Error checking auth:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const success = response.ok;
      setIsAuthenticated(success);
      return success;
    } catch (error: unknown) {
      console.error("Error logging in:", error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    await fetch("/api/auth", { method: "DELETE" });
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
