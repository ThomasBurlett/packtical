import {
  loadRemoteChecklistStates,
  saveRemoteChecklistState,
} from "@/lib/remote-checklist-storage";
import type { PersistedChecklistState } from "@/types/checklist";

const PENDING_ANONYMOUS_PROGRESS_KEY = "packtical:pending-anonymous-progress:v1";

type PendingAnonymousProgress = {
  createdAt: string;
  states: Record<string, PersistedChecklistState>;
};

export async function storePendingAnonymousProgress() {
  const states = await loadRemoteChecklistStates();

  sessionStorage.setItem(
    PENDING_ANONYMOUS_PROGRESS_KEY,
    JSON.stringify({
      createdAt: new Date().toISOString(),
      states,
    } satisfies PendingAnonymousProgress),
  );
}

export async function consumePendingAnonymousProgress(userId: string) {
  const rawProgress = sessionStorage.getItem(PENDING_ANONYMOUS_PROGRESS_KEY);

  if (!rawProgress) return false;

  sessionStorage.removeItem(PENDING_ANONYMOUS_PROGRESS_KEY);

  const pendingProgress = JSON.parse(rawProgress) as PendingAnonymousProgress;
  const pendingStates = pendingProgress.states ?? {};
  const existingStates = await loadRemoteChecklistStates();
  const entries = Object.entries(pendingStates);

  await Promise.all(
    entries.map(([slug, anonymousState]) =>
      saveRemoteChecklistState(
        userId,
        slug,
        mergeChecklistStates(existingStates[slug], anonymousState),
      ),
    ),
  );

  return entries.length > 0;
}

function mergeChecklistStates(
  existingState: PersistedChecklistState | undefined,
  anonymousState: PersistedChecklistState,
): PersistedChecklistState {
  if (!existingState) return anonymousState;

  return {
    checkedIds: [...new Set([...existingState.checkedIds, ...anonymousState.checkedIds])],
    collapsedSections:
      anonymousState.collapsedSections.length > 0
        ? anonymousState.collapsedSections
        : existingState.collapsedSections,
    customItems: mergeCustomItems(existingState.customItems, anonymousState.customItems),
  };
}

function mergeCustomItems(
  existingItems: PersistedChecklistState["customItems"],
  anonymousItems: PersistedChecklistState["customItems"],
) {
  const sectionIds = new Set([
    ...Object.keys(existingItems),
    ...Object.keys(anonymousItems),
  ]);

  return Object.fromEntries(
    [...sectionIds].map((sectionId) => {
      const itemsById = new Map(
        [...(existingItems[sectionId] ?? []), ...(anonymousItems[sectionId] ?? [])].map((item) => [
          item.id,
          item,
        ]),
      );

      return [sectionId, [...itemsById.values()]];
    }),
  );
}
