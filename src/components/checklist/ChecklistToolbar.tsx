import { Button, Card, Label, ProgressBar } from "@heroui/react"
import { ChevronDown, ChevronsUpDown, RotateCcw } from "lucide-react"
import { FILTERS } from "@/constants/filters"
import type { ChecklistFilter } from "@/types/checklist"

interface ChecklistToolbarProps {
  checked: number
  total: number
  percent: number
  filter: ChecklistFilter
  hasVisibleOpenSection: boolean
  onFilterChange: (value: ChecklistFilter) => void
  onToggleAllSections: () => void
  onResetChecks: () => void
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
        <Card className="toolbar-card" variant="secondary">
          <Card.Content className="toolbar-content">
            <div className="progress-heading">
              <div className="progress-summary">
                <Label>Packing progress</Label>
                <p className="progress-copy">
                  {checked} of {total} packed
                </p>
              </div>
              <div className="progress-percent">{percent}%</div>
            </div>

            <ProgressBar
              aria-label="Checklist progress"
              className="progress-panel"
              color="success"
              value={percent}
            >
              <ProgressBar.Track className="progress-track">
                <ProgressBar.Fill className="progress-fill" />
              </ProgressBar.Track>
            </ProgressBar>

            <div className="toolbar-actions toolbar-actions-compact">
              <label className="toolbar-select-field">
                <span className="toolbar-select-label">Filter</span>
                <select
                  className="toolbar-select"
                  onChange={(event) =>
                    onFilterChange(event.target.value as ChecklistFilter)
                  }
                  value={filter}
                >
                  {FILTERS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <span className="toolbar-select-chevron" aria-hidden="true">
                  <ChevronDown size={16} strokeWidth={2.2} />
                </span>
              </label>

              <div className="toolbar-cta-group">
                <Button onPress={onToggleAllSections} size="sm" variant="outline">
                  <ChevronsUpDown aria-hidden="true" size={15} strokeWidth={2.1} />
                  {hasVisibleOpenSection ? "Collapse all" : "Expand all"}
                </Button>
                <Button onPress={onResetChecks} size="sm" variant="ghost">
                  <RotateCcw aria-hidden="true" size={15} strokeWidth={2.1} />
                  Reset
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}
