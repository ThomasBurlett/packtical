import type { SupabaseUser } from "@/lib/supabase";

export const LOCAL_DEV_USER_ID = "00000000-0000-4000-8000-000000000001";

export function createLocalDevUser(): SupabaseUser {
  const now = new Date().toISOString();

  return {
    id: LOCAL_DEV_USER_ID,
    aud: "authenticated",
    role: "authenticated",
    email: "local-dev@packtical.test",
    email_confirmed_at: now,
    phone: "",
    confirmed_at: now,
    last_sign_in_at: now,
    app_metadata: {
      provider: "local-dev",
      providers: ["local-dev"],
    },
    user_metadata: {
      name: "Local dev user",
    },
    identities: [],
    created_at: now,
    updated_at: now,
    is_anonymous: false,
  };
}
