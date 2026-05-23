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
  const energy = (0.2 + progressRatio * 0.8).toFixed(3)
  const progressHue = 18 + progressRatio * 132
  const progressPanelStyle = {
    "--progress-energy": energy,
    "--progress-glow-strength": glowStrength,
    "--progress-glow-blur": `${10 + progressRatio * 22}px`,
    "--progress-glow-spread": `${2 + progressRatio * 8}px`,
    "--progress-hue": progressHue.toFixed(1),
    "--progress-pulse-depth": `${1 + progressRatio * 0.22}`,
    "--progress-shimmer-duration": `${3.2 - progressRatio * 1.35}s`,
  } as CSSProperties
  const isComplete = percent === 100 && total > 0

  return (
    <div className="hero-toolbar">
      <div className="hero-toolbar-status">
        <div className="hero-toolbar-summary">
          <div className="hero-toolbar-summary-topline">
            <Label>Packing progress</Label>
            <div className={`progress-percent compact${isComplete ? " complete" : ""}`}>{percent}%</div>
          </div>
          <div className="hero-toolbar-metric-line">
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
            <div className="progress-track-grid" aria-hidden="true" />
            <div className="progress-track-aurora" aria-hidden="true" />
            <ProgressBar.Fill className="progress-fill">
              <span className="progress-fill-surface" aria-hidden="true" />
              <span className="progress-fill-shine" aria-hidden="true" />
              <span className="progress-fill-spark progress-fill-spark-a" aria-hidden="true" />
              <span className="progress-fill-spark progress-fill-spark-b" aria-hidden="true" />
              <span className="progress-fill-spark progress-fill-spark-c" aria-hidden="true" />
            </ProgressBar.Fill>
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
