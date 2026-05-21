import type { ChecklistFilter } from "@/types/checklist";

export const FILTERS: Array<{ value: ChecklistFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "unchecked", label: "Unchecked" },
  { value: "core", label: "Core" },
  { value: "optional", label: "Optional" },
  { value: "custom", label: "Custom" },
]
