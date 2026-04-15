"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getToken, clearToken } from "@/lib/auth";
import { signIn as apiSignIn, signOut as apiSignOut } from "@/lib/api";

interface AuthContextValue {
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  token: null,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(getToken());
  }, []);

  async function signIn(email: string, password: string): Promise<void> {
    await apiSignIn(email, password);
    setToken(getToken());
  }

  async function signOut(): Promise<void> {
    try {
      await apiSignOut();
    } finally {
      clearToken();
      setToken(null);
    }
  }

  return (
    <AuthContext.Provider value={{ token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
