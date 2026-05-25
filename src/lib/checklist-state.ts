import { buildCustomItemId, normalizeCustomItems } from "@/lib/checklist-items";
import type { ChecklistItem, PersistedChecklistState } from "@/types/checklist";

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
