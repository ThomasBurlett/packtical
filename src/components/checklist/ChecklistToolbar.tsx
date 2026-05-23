import type { CSSProperties } from "react"
import { Button, Label, ProgressBar } from "@heroui/react"
import { ChevronsUpDown, RotateCcw } from "lucide-react"
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
  const remaining = Math.max(total - checked, 0)
  const statusLabel = remaining === 0 ? "Everything packed" : `${remaining} left`
  const progressRatio = Math.min(Math.max(percent / 100, 0), 1)
  const glowStrength = (0.18 + progressRatio * 0.82).toFixed(3)
  const progressPanelStyle = {
    "--progress-glow-strength": glowStrength,
    "--progress-glow-blur": `${10 + progressRatio * 22}px`,
    "--progress-glow-spread": `${2 + progressRatio * 8}px`,
  } as CSSProperties
  const isComplete = percent === 100 && total > 0

  return (
    <div className="hero-toolbar">
      <div className="hero-toolbar-status">
        <div className="hero-toolbar-summary">
          <Label>Packing progress</Label>
          <div className="hero-toolbar-metric-line">
            <div className={`progress-percent compact${isComplete ? " complete" : ""}`}>{percent}%</div>
            <p className="progress-copy">
              {checked}/{total} packed
            </p>
            <p className="hero-toolbar-note">{statusLabel}</p>
          </div>
        </div>
        <ProgressBar
          aria-label="Checklist progress"
          className={`progress-panel${isComplete ? " is-complete" : ""}`}
          color="success"
          style={progressPanelStyle}
          value={percent}
        >
          <ProgressBar.Track className="progress-track">
            <ProgressBar.Fill className="progress-fill" />
          </ProgressBar.Track>
        </ProgressBar>
      </div>

      <div className="hero-toolbar-view">
        <span className="toolbar-group-label">Show</span>
        <div className="toolbar-filter-group" role="tablist" aria-label="Checklist filter">
          {FILTERS.map((item) => {
            const isActive = filter === item.value

            return (
              <button
                aria-pressed={isActive}
                className={`toolbar-filter-chip${isActive ? " active" : ""}`}
                key={item.value}
                onClick={() => onFilterChange(item.value)}
                type="button"
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="hero-toolbar-actions">
        <span className="toolbar-group-label">Actions</span>
        <div className="toolbar-cta-group compact">
          <Button className="toolbar-action-button" onPress={onToggleAllSections} size="sm" variant="outline">
            <ChevronsUpDown aria-hidden="true" size={15} strokeWidth={2.1} />
            {hasVisibleOpenSection ? "Collapse all" : "Expand all"}
          </Button>
          <Button className="toolbar-action-button subtle" onPress={onResetChecks} size="sm" variant="ghost">
            <RotateCcw aria-hidden="true" size={15} strokeWidth={2.1} />
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
