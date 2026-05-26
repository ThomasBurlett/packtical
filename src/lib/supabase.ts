import { createClient, type Session, type User } from "@supabase/supabase-js";
import type { PersistedChecklistState } from "@/types/checklist";

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ChecklistProgressRow = {
  user_id: string;
  checklist_slug: string;
  state: PersistedChecklistState;
  updated_at: string;
};

type Database = {
  public: {
    Tables: {
      checklist_progress: {
        Row: {
          user_id: string;
          checklist_slug: string;
          state: Json;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          checklist_slug: string;
          state: Json;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          checklist_slug?: string;
          state?: Json;
          updated_at?: string;
        };
      };
    };
  };
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isLocalSupabaseMockEnabled =
  import.meta.env.DEV && import.meta.env.VITE_USE_LOCAL_AUTH === "true";

export const isSupabaseConfigured =
  isLocalSupabaseMockEnabled || Boolean(supabaseUrl && supabaseAnonKey);

function createSupabaseBrowserClient() {
  if (isLocalSupabaseMockEnabled) {
    return null;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

export const supabase = createSupabaseBrowserClient();

export type SupabaseSession = Session;
export type SupabaseUser = User;
