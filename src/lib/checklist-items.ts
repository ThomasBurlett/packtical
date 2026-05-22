import type {
  ChecklistItem,
  ChecklistItemTuple,
  ChecklistKind,
  ChecklistSectionData,
} from "@/types/checklist";

export function cloneSections(sections: ChecklistSectionData[]) {
  return sections.map((section) => ({
    ...section,
    items: section.items.map(mapTupleToItem),
  }));
}

export function buildCustomItemId(sectionId = "section") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `custom-${sectionId}-${crypto.randomUUID()}`;
  }

  return `custom-${sectionId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeCustomItems(parsedItems: unknown): ChecklistItem[] {
  if (!Array.isArray(parsedItems)) return [];

  return parsedItems
    .flatMap((item) => {
      if (!item || typeof item !== "object" || !("label" in item)) {
        return [];
      }

      const { id, kind, label } = item as { id?: unknown; kind?: unknown; label?: unknown };
      if (typeof label !== "string") {
        return [];
      }

      const trimmedLabel = label.trim();
      if (!trimmedLabel) {
        return [];
      }

      return [
        {
          id: typeof id === "string" && id.trim() ? id : buildCustomItemId(),
          label: trimmedLabel,
          kind: kind === "optional" ? "optional" : kind === "custom" ? "custom" : "core",
          note: "",
          source: "custom",
        } satisfies ChecklistItem,
      ];
    });
}

export function itemMatchesFilter(
  item: ChecklistItem,
  filter: "all" | "unchecked" | ChecklistKind,
  checkedIds: ReadonlySet<string>,
) {
  if (filter === "all") return true;
  if (filter === "unchecked") return !checkedIds.has(item.id);
  return item.kind === filter;
}

function mapTupleToItem([id, label, kind, note = ""]: ChecklistItemTuple): ChecklistItem {
  return {
    id,
    label,
    kind,
    note,
    source: "base",
  };
}
