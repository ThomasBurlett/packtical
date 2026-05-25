import { createContext, useContext } from "react";
import type { SupabaseUser } from "@/lib/supabase";

export type AuthContextValue = {
  isConfigured: boolean;
  isLoading: boolean;
  user: SupabaseUser | null;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return value;
}
