import type { ChecklistFilter } from "@/types/checklist";

export const FILTERS: Array<{ value: ChecklistFilter; label: string }> = [
  { value: "all", label: "Show all" },
  { value: "unchecked", label: "Unchecked only" },
  { value: "core", label: "Core only" },
  { value: "optional", label: "Optional only" },
  { value: "custom", label: "Custom only" },
];
