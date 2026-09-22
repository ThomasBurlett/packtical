import { CHECKLIST_MAP } from "./catalogue";

export type ItemKind = "core" | "optional";
export type PackingStatus = "packed" | "skipped" | "unpacked";
export type Item = {
  id: string;
  sectionId: string;
  label: string;
  note: string;
  kind: ItemKind;
  order: number;
  custom: boolean;
  hidden: boolean;
  relatedChecklistSlug?: string;
};
export type Section = {
  id: string;
  title: string;
  order: number;
  custom: boolean;
};
export type ItemPatch = Partial<Omit<Item, "id">>;
export type SectionPatch = Partial<Omit<Section, "id">>;
export type ItemState = { status: PackingStatus };
export type Snapshot = {
  cycle: string;
  items: Record<string, ItemPatch>;
  sections: Record<string, SectionPatch>;
  states: Record<string, ItemState>;
};
export const emptySnapshot = (): Snapshot => ({
  cycle: "initial",
  items: {},
  sections: {},
  states: {},
});
export const itemKey = (section: string, id: string) => `${section}--${id}`;

export function materialize(slug: string, snapshot: Snapshot) {
  const base = CHECKLIST_MAP[slug];
  if (!base) throw new Error("Unknown checklist");
  const sections: Record<string, Section> = {};
  const items: Record<string, Item> = {};
  base.sections.forEach((section, index) => {
    sections[section.id] = {
      id: section.id,
      title: section.title,
      order: index * 100,
      custom: false,
    };
    section.items.forEach(
      ([id, label, kind, note = "", relatedChecklistSlug], order) => {
        const key = itemKey(section.id, id);
        items[key] = {
          id: key,
          sectionId: section.id,
          label,
          kind,
          note,
          order: order * 100,
          hidden: false,
          custom: false,
          ...(relatedChecklistSlug ? { relatedChecklistSlug } : {}),
        };
      },
    );
  });
  for (const [id, patch] of Object.entries(snapshot.sections)) {
    if (sections[id])
      sections[id] = { ...sections[id], ...patch, id, custom: false };
    else if (patch.custom && patch.title)
      sections[id] = {
        id,
        title: patch.title,
        order: patch.order ?? 10000,
        custom: true,
      };
  }
  for (const [id, patch] of Object.entries(snapshot.items)) {
    if (items[id]) items[id] = { ...items[id], ...patch, id, custom: false };
    else if (
      patch.custom &&
      patch.sectionId &&
      sections[patch.sectionId] &&
      patch.label
    ) {
      items[id] = {
        id,
        sectionId: patch.sectionId,
        label: patch.label,
        note: patch.note ?? "",
        kind: patch.kind ?? "core",
        order: patch.order ?? 10000,
        custom: true,
        hidden: patch.hidden ?? false,
      };
    }
  }
  return Object.values(sections)
    .sort(byOrder)
    .map((section) => ({
      ...section,
      items: Object.values(items)
        .filter((item) => item.sectionId === section.id)
        .sort(byOrder),
    }));
}
function byOrder(
  a: { order: number; id: string },
  b: { order: number; id: string },
) {
  return a.order - b.order || a.id.localeCompare(b.id);
}

export function progress(items: Item[], states: Record<string, ItemState>) {
  const visible = items.filter((item) => !item.hidden);
  const skipped = visible.filter(
    (item) => states[item.id]?.status === "skipped",
  ).length;
  const packed = visible.filter(
    (item) => states[item.id]?.status === "packed",
  ).length;
  const total = visible.length - skipped;
  return {
    packed,
    skipped,
    total,
    remaining: total - packed,
    fraction: total === 0 ? 0 : packed / total,
  };
}

export type ImportedItem = { slug: string; id: string; item: ItemPatch };
export function importLegacy(input: unknown): ImportedItem[] {
  if (!input || typeof input !== "object")
    throw new Error("Choose a JSON export containing checklist records.");
  const rows = Array.isArray(input)
    ? input
    : Object.entries(input).map(([checklist_slug, state]) => ({
        checklist_slug,
        state,
      }));
  const result: ImportedItem[] = [];
  for (const row of rows) {
    if (
      !row ||
      typeof row !== "object" ||
      typeof row.checklist_slug !== "string" ||
      !CHECKLIST_MAP[row.checklist_slug]
    )
      throw new Error(
        "Export contains an unknown checklist. Nothing was imported.",
      );
    const sections = CHECKLIST_MAP[row.checklist_slug].sections;
    const custom = row.state?.customItems;
    if (!custom || typeof custom !== "object") continue;
    for (const [sectionId, entries] of Object.entries(custom)) {
      if (!sections.some((s) => s.id === sectionId) || !Array.isArray(entries))
        throw new Error(
          "Export contains an unknown section or invalid items. Nothing was imported.",
        );
      entries.forEach((value: unknown, index: number) => {
        if (!value || typeof value !== "object")
          throw new Error("Invalid custom item.");
        const entry = value as Record<string, unknown>;
        if (
          typeof entry.label !== "string" ||
          !entry.label.trim() ||
          entry.label.length > 500
        )
          throw new Error("Custom item labels must contain 1–500 characters.");
        const oldId = typeof entry.id === "string" ? entry.id : `${index}`;
        const id = `import-${encodeURIComponent(sectionId)}-${encodeURIComponent(oldId)}`;
        if (id.length > 1000) throw new Error("Custom item ID is too long.");
        result.push({
          slug: row.checklist_slug,
          id,
          item: {
            sectionId,
            label: entry.label.trim(),
            kind: entry.kind === "optional" ? "optional" : "core",
            note: "",
            order: 10000 + index * 100,
            hidden: false,
            custom: true,
          },
        });
      });
    }
  }
  if (
    new Set(result.map((item) => `${item.slug}/${item.id}`)).size !==
    result.length
  )
    throw new Error("Duplicate custom item identifiers. Nothing was imported.");
  return result;
}
