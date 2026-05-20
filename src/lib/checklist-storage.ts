import { buildCustomItemId, normalizeCustomItems } from "@/lib/checklist-items";
import type { ChecklistItem, PersistedChecklistState } from "@/types/checklist";

const STORAGE_VERSION = "v2";

export function getStorageKey(slug: string) {
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
  const fallback = {
    checkedIds: [],
    collapsedSections: [],
    customItems: {},
  };

  try {
    const parsed = JSON.parse(localStorage.getItem(getStorageKey(slug)) || "null") as
      | PersistedChecklistState
      | null;

    if (!parsed || typeof parsed !== "object") {
      return fallback;
    }

    const customItems = Object.fromEntries(
      sectionIds
        .map((sectionId) => [sectionId, normalizeCustomItems(parsed.customItems?.[sectionId])] as const)
        .filter(([, items]) => items.length > 0),
    );

    return {
      checkedIds: Array.isArray(parsed.checkedIds) ? parsed.checkedIds : [],
      collapsedSections: Array.isArray(parsed.collapsedSections)
        ? parsed.collapsedSections
        : [],
      customItems,
    };
  } catch {
    return fallback;
  }
}

export function saveChecklistState(
  slug: string,
  checkedIds: ReadonlySet<string>,
  collapsedSections: ReadonlySet<string>,
  customItems: Record<string, ChecklistItem[]>,
) {
  const serializableCustomItems = Object.fromEntries(
    Object.entries(customItems).map(([sectionId, items]) => [
      sectionId,
      items.map(({ id, label }) => ({
        id: id || buildCustomItemId(sectionId),
        label,
      })),
    ]),
  );

  localStorage.setItem(
    getStorageKey(slug),
    JSON.stringify({
      checkedIds: [...checkedIds],
      collapsedSections: [...collapsedSections],
      customItems: serializableCustomItems,
    } satisfies PersistedChecklistState),
  );
}
