import { ChevronDown } from "lucide-react"
import { ActivityIcon } from "@/lib/activity-icons"
import type { Checklist } from "@/types/checklist"

interface ActivityNavProps {
  checklists: Checklist[]
  activeSlug: string
}

export function ActivityNav({ checklists, activeSlug }: ActivityNavProps) {
  const activeChecklist = checklists.find((item) => item.slug === activeSlug) ?? checklists[0]

  return (
    <div className="activity-switcher">
      <div className="activity-switcher-current">
        <span className="activity-switcher-icon" aria-hidden="true">
          <ActivityIcon slug={activeChecklist.slug} size={16} strokeWidth={2.1} />
        </span>
        <div className="activity-switcher-copy">
          <span className="activity-switcher-label">Activity</span>
          <strong>{activeChecklist.label}</strong>
        </div>
      </div>

      <label className="activity-switcher-field">
        <span className="sr-only">Choose activity checklist</span>
        <select
          aria-label="Choose activity checklist"
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
    </div>
  )
}
