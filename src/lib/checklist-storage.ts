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
  defaultCollapsedSections: ReadonlySet<string>,
) {
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

  const hasCustomItems = Object.values(serializableCustomItems).some(
    (items) => items.length > 0,
  );
  const isDefaultCollapsedState =
    collapsedSections.size === defaultCollapsedSections.size &&
    [...collapsedSections].every((sectionId) =>
      defaultCollapsedSections.has(sectionId),
    );

  if (checkedIds.size === 0 && !hasCustomItems && isDefaultCollapsedState) {
    localStorage.removeItem(getStorageKey(slug));
    return;
  }

  localStorage.setItem(
    getStorageKey(slug),
    JSON.stringify({
      checkedIds: [...checkedIds],
      collapsedSections: [...collapsedSections],
      customItems: serializableCustomItems,
    } satisfies PersistedChecklistState),
  );
}
