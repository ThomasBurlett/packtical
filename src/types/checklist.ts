export type ChecklistKind = "core" | "optional" | "custom";
export type ChecklistFilter = "all" | "unchecked" | ChecklistKind;
export type ItemSource = "base" | "custom";

export type ChecklistItemTuple = [
  id: string,
  label: string,
  kind: Exclude<ChecklistKind, "custom">,
  note?: string,
];

export interface ChecklistItem {
  id: string;
  label: string;
  kind: ChecklistKind;
  note: string;
  source: ItemSource;
}

export interface ChecklistSectionData {
  id: string;
  title: string;
  items: ChecklistItemTuple[];
}

export interface Checklist {
  slug: string;
  label: string;
  shortLabel: string;
  subtitle: string;
  summary: string;
  sourceUrl: string;
  sourceLabel: string;
  sections: ChecklistSectionData[];
}

export interface ChecklistSectionState {
  id: string;
  title: string;
  items: ChecklistItem[];
  visibleItems: ChecklistItem[];
  checkedCount: number;
  isCollapsed: boolean;
}

export interface PersistedChecklistState {
  checkedIds: string[];
  collapsedSections: string[];
  customItems: Record<string, Array<Pick<ChecklistItem, "id" | "label">>>;
}
