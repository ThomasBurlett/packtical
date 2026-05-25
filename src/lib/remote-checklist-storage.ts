import { supabase } from "@/lib/supabase";
import type { PersistedChecklistState } from "@/types/checklist";

type RemoteChecklistStateRow = {
  checklist_slug: string;
  state: PersistedChecklistState;
};

export async function loadRemoteChecklistState(slug: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("checklist_progress")
    .select("state")
    .eq("checklist_slug", slug)
    .maybeSingle();

  if (error) throw error;

  return (data?.state ?? null) as PersistedChecklistState | null;
}

export async function loadRemoteChecklistStates() {
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("checklist_progress")
    .select("checklist_slug,state");

  if (error) throw error;

  const rows = (data ?? []) as RemoteChecklistStateRow[];
  const states = rows.reduce<Record<string, PersistedChecklistState>>((result, row) => {
    result[row.checklist_slug] = row.state;
    return result;
  }, {});

  return states;
}

export async function saveRemoteChecklistState(
  userId: string,
  slug: string,
  state: PersistedChecklistState,
) {
  if (!supabase) return;

  const { error } = await supabase
    .from("checklist_progress")
    .upsert(
      {
        user_id: userId,
        checklist_slug: slug,
        state,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,checklist_slug" },
    );

  if (error) throw error;
}
