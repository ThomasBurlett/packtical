import { ChevronDown } from "lucide-react"
import type { Checklist } from "@/types/checklist"

interface ActivityNavProps {
  checklists: Checklist[]
  activeSlug: string
}

export function ActivityNav({ checklists, activeSlug }: ActivityNavProps) {
  return (
    <label className="activity-switcher-field">
      <span className="toolbar-select-label">Switch activity</span>
      <select
        aria-label="Switch activity checklist"
        className="activity-switcher-select"
        onChange={(event) => {
          window.location.hash = `#/${event.target.value}`
        }}
        value={activeSlug}
      >
        {checklists.map((item) => (
          <option key={item.slug} value={item.slug}>
            {item.label}
          </option>
        ))}
      </select>
      <span className="activity-switcher-chevron" aria-hidden="true">
        <ChevronDown size={16} strokeWidth={2.2} />
      </span>
    </label>
  )
}
