import { buildCustomItemId, normalizeCustomItems } from "@/lib/checklist-items";
import type { ChecklistItem, PersistedChecklistState } from "@/types/checklist";

const STORAGE_VERSION = "v2";

export function getStorageKey(slug: string) {
  return `packtical:${STORAGE_VERSION}:${slug}`;
}

function getLegacyStorageKey(slug: string) {
  return `adventure-checklist:${STORAGE_VERSION}:${slug}`;
}

export function loadChecklistState(
  slug: string,
  sectionIds: string[],
): {
  checkedIds: string[];
  collapsedSections: string[];
  customItems: Record<string, ChecklistItem[]>;
} {
  try {
    const savedState =
      localStorage.getItem(getStorageKey(slug)) ?? localStorage.getItem(getLegacyStorageKey(slug));
    const parsed = JSON.parse(savedState || "null") as
      | PersistedChecklistState
      | null;

    return normalizePersistedChecklistState(parsed, sectionIds);
  } catch {
    return getEmptyChecklistState();
  }
}

export function getEmptyChecklistState() {
  return {
    checkedIds: [],
    collapsedSections: [],
    customItems: {},
  };
}

export function normalizePersistedChecklistState(
  state: PersistedChecklistState | null | undefined,
  sectionIds: string[],
) {
  if (!state || typeof state !== "object") {
    return getEmptyChecklistState();
  }

  const customItems = Object.fromEntries(
    sectionIds
      .map((sectionId) => [sectionId, normalizeCustomItems(state.customItems?.[sectionId])] as const)
      .filter(([, items]) => items.length > 0),
  );

  return {
    checkedIds: Array.isArray(state.checkedIds) ? state.checkedIds : [],
    collapsedSections: Array.isArray(state.collapsedSections)
      ? state.collapsedSections
      : [],
    customItems,
  };
}

export function createPersistedChecklistState(
  checkedIds: ReadonlySet<string>,
  collapsedSections: ReadonlySet<string>,
  customItems: Record<string, ChecklistItem[]>,
): PersistedChecklistState {
  const serializableCustomItems = Object.fromEntries(
    Object.entries(customItems).map(([sectionId, items]) => [
      sectionId,
      items.map(({ id, kind, label }) => ({
        id: id || buildCustomItemId(sectionId),
        kind,
        label,
      })),
    ]),
  );

  return {
    checkedIds: [...checkedIds],
    collapsedSections: [...collapsedSections],
    customItems: serializableCustomItems,
  };
}

export function hasPersistedChecklistState(
  state: PersistedChecklistState,
  defaultCollapsedSections: ReadonlySet<string>,
) {
  const hasCustomItems = Object.values(state.customItems).some(
    (items) => items.length > 0,
  );
  const isDefaultCollapsedState =
    state.collapsedSections.length === defaultCollapsedSections.size &&
    state.collapsedSections.every((sectionId) =>
      defaultCollapsedSections.has(sectionId),
    );

  return state.checkedIds.length > 0 || hasCustomItems || !isDefaultCollapsedState;
}

export function saveChecklistState(
  slug: string,
  checkedIds: ReadonlySet<string>,
  collapsedSections: ReadonlySet<string>,
  customItems: Record<string, ChecklistItem[]>,
  defaultCollapsedSections: ReadonlySet<string>,
) {
  const state = createPersistedChecklistState(checkedIds, collapsedSections, customItems);

  if (!hasPersistedChecklistState(state, defaultCollapsedSections)) {
    localStorage.removeItem(getStorageKey(slug));
    localStorage.removeItem(getLegacyStorageKey(slug));
    return;
  }

  localStorage.setItem(
    getStorageKey(slug),
    JSON.stringify(state),
  );
}
