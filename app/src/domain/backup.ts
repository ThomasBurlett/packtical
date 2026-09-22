import { CHECKLIST_MAP } from "./catalogue";
import {
  emptySnapshot,
  materialize,
  type ItemPatch,
  type SectionPatch,
} from "./packing";

export type Backup = {
  format: "packbee-customizations";
  version: 1;
  createdAt: string;
  checklists: {
    slug: string;
    items: Record<string, ItemPatch>;
    sections: Record<string, SectionPatch>;
  }[];
};
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid backup structure.");
  return value as Record<string, unknown>;
}
function identifier(id: string) {
  if (Object.hasOwn(Object.prototype, id))
    throw new Error("Invalid backup identifier.");
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_%.-]{0,999}$/.test(id))
    throw new Error("Invalid backup identifier.");
}
function patch(value: unknown, section: boolean) {
  const data = object(value);
  const allowed = section
    ? ["title", "order", "custom"]
    : [
        "label",
        "note",
        "kind",
        "order",
        "hidden",
        "custom",
        "sectionId",
        "relatedChecklistSlug",
      ];
  for (const [key, v] of Object.entries(data)) {
    if (!allowed.includes(key))
      throw new Error(`Unsupported backup field: ${key}`);
    if (
      ["label", "title", "note", "sectionId", "relatedChecklistSlug"].includes(
        key,
      )
    ) {
      const limit =
        key === "note"
          ? 2000
          : key === "sectionId"
            ? 150
            : key === "relatedChecklistSlug"
              ? 100
              : 500;
      if (
        typeof v !== "string" ||
        v.length > limit ||
        (key !== "note" && !v.trim())
      )
        throw new Error("Invalid text in backup.");
    } else if (key === "order") {
      if (typeof v !== "number" || !Number.isFinite(v))
        throw new Error("Invalid order in backup.");
    } else if (key === "kind") {
      if (v !== "core" && v !== "optional")
        throw new Error("Invalid item kind.");
    } else if (typeof v !== "boolean") throw new Error("Invalid backup flag.");
  }
  return data;
}
export function parseBackup(raw: string): Backup {
  if (raw.length > 5_000_000)
    throw new Error("Backup is too large (5 MB maximum).");
  const data = object(JSON.parse(raw));
  if (
    data.format !== "packbee-customizations" ||
    data.version !== 1 ||
    typeof data.createdAt !== "string" ||
    !Array.isArray(data.checklists)
  )
    throw new Error("Choose a Packbee version 1 customization backup.");
  const seen = new Set<string>();
  let count = 0;
  const checklists = data.checklists.map((value) => {
    const entry = object(value);
    const slug = entry.slug;
    if (
      typeof slug !== "string" ||
      !Object.hasOwn(CHECKLIST_MAP, slug) ||
      seen.has(slug)
    )
      throw new Error("Unknown or duplicate checklist.");
    seen.add(slug);
    const base = materialize(slug, emptySnapshot());
    const baseSections = new Set(base.map((s) => s.id));
    const baseItems = new Set(base.flatMap((s) => s.items.map((i) => i.id)));
    const sections: Record<string, SectionPatch> = {};
    const items: Record<string, ItemPatch> = {};
    for (const [id, value] of Object.entries(object(entry.sections))) {
      identifier(id);
      if (id.length > 150) throw new Error("Section identifier is too long.");
      const p = patch(value, true) as SectionPatch;
      if (!baseSections.has(id) && (!p.custom || !p.title))
        throw new Error("Incomplete personal section.");
      if (baseSections.has(id) && p.custom)
        throw new Error("Built-in section cannot be personal.");
      sections[id] = p;
    }
    for (const [id, value] of Object.entries(object(entry.items))) {
      identifier(id);
      const p = patch(value, false) as ItemPatch;
      if (!baseItems.has(id) && (!p.custom || !p.label || !p.sectionId))
        throw new Error("Incomplete personal item.");
      if (baseItems.has(id) && p.custom)
        throw new Error("Built-in item cannot be personal.");
      if (
        p.sectionId &&
        !baseSections.has(p.sectionId) &&
        !Object.hasOwn(sections, p.sectionId)
      )
        throw new Error("Item refers to a missing section.");
      if (
        p.relatedChecklistSlug &&
        !Object.hasOwn(CHECKLIST_MAP, p.relatedChecklistSlug)
      )
        throw new Error("Unknown related checklist.");
      items[id] = p;
    }
    count += Object.keys(items).length + Object.keys(sections).length;
    if (count > 10000)
      throw new Error("Backup contains too many customizations.");
    return { slug, items, sections };
  });
  return {
    format: "packbee-customizations",
    version: 1,
    createdAt: data.createdAt,
    checklists,
  };
}
export function backupCount(backup: Backup) {
  return backup.checklists.reduce(
    (n, c) => n + Object.keys(c.items).length + Object.keys(c.sections).length,
    0,
  );
}
