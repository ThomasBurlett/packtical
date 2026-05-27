import type { SupabaseUser } from "@/lib/supabase";

export function getUserFirstName(user: SupabaseUser | null) {
  return getMetadataString(user, "first_name");
}

export function getUserLastName(user: SupabaseUser | null) {
  return getMetadataString(user, "last_name");
}

export function getUserDisplayName(user: SupabaseUser | null) {
  const firstName = getUserFirstName(user);
  const lastName = getUserLastName(user);
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  return fullName || user?.email || "";
}

function getMetadataString(user: SupabaseUser | null, key: string) {
  const value: unknown = user?.user_metadata?.[key];
  return typeof value === "string" ? value.trim() : "";
}
