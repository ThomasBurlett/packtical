import { FILTERS } from "@/constants/filters";
import type { ChecklistFilter } from "@/types/checklist";

interface ChecklistToolbarProps {
  checked: number;
  total: number;
  percent: number;
  filter: ChecklistFilter;
  hasVisibleOpenSection: boolean;
  onFilterChange: (value: ChecklistFilter) => void;
  onToggleAllSections: () => void;
  onResetChecks: () => void;
}

export function ChecklistToolbar({
  checked,
  total,
  percent,
  filter,
  hasVisibleOpenSection,
  onFilterChange,
  onToggleAllSections,
  onResetChecks,
}: ChecklistToolbarProps) {
  return (
    <div className="sticky-bar">
      <div className="page-shell sticky-inner">
        <div className="progress-panel">
          <div className="progress-track">
            <div id="progress-fill" style={{ width: `${percent}%` }} />
          </div>
          <div className="progress-copy">
            {checked} / {total} complete ({percent}%)
          </div>
        </div>
        <div className="toolbar">
          <label className="select-wrap">
            <span className="sr-only">Filter items</span>
            <select
              value={filter}
              onChange={(event) => onFilterChange(event.target.value as ChecklistFilter)}
            >
              {FILTERS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <button onClick={onToggleAllSections} type="button">
            {hasVisibleOpenSection ? "Collapse all" : "Expand all"}
          </button>
          <button onClick={onResetChecks} type="button">
            Reset checks
          </button>
        </div>
      </div>
    </div>
  );
}
