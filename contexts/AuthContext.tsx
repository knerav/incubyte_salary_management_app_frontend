"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getToken, clearToken } from "@/lib/auth";
import { signIn as apiSignIn, signUp as apiSignUp, signOut as apiSignOut } from "@/lib/api";

interface AuthContextValue {
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, passwordConfirmation: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  token: null,
  signIn: async () => {},
  signUp: async () => {},
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

  async function signUp(email: string, password: string, passwordConfirmation: string): Promise<void> {
    await apiSignUp(email, password, passwordConfirmation);
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
    <AuthContext.Provider value={{ token, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
