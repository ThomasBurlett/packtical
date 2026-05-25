import { ChevronDown } from "lucide-react"
import type { Checklist } from "@/types/checklist"

interface ActivityNavProps {
  checklists: Checklist[]
  activeSlug: string
  variant?: "inline" | "hero-title"
}

function groupChecklists(checklists: Checklist[]) {
  return Object.entries(
    checklists.reduce<Record<string, Checklist[]>>((groups, checklist) => {
      const category = checklist.category || "General"
      groups[category] = groups[category] ? [...groups[category], checklist] : [checklist]
      return groups
    }, {}),
  )
}

export function ActivityNav({
  checklists,
  activeSlug,
  variant = "inline",
}: ActivityNavProps) {
  const checklistGroups = groupChecklists(checklists)

  if (variant === "hero-title") {
    return (
      <label className="activity-switcher-hero">
        <span className="activity-switcher-hero-hint">Choose activity</span>
        <span className="activity-switcher-hero-title-wrap">
          <select
            aria-label="Switch activity checklist"
            className="activity-switcher-hero-select"
            onChange={(event) => {
              window.location.hash = `#/${event.target.value}`
            }}
            value={activeSlug}
          >
            {checklistGroups.map(([category, items]) => (
              <optgroup key={category} label={category}>
                {items.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <span className="activity-switcher-hero-chevron" aria-hidden="true">
            <ChevronDown size={18} strokeWidth={2.2} />
          </span>
        </span>
      </label>
    )
  }

  return (
    <label className="activity-switcher-field activity-switcher-inline">
      <span className="activity-switcher-inline-label">Switch checklist</span>
      <select
        aria-label="Switch activity checklist"
        className="activity-switcher-select"
        onChange={(event) => {
          window.location.hash = `#/${event.target.value}`
        }}
        value={activeSlug}
      >
        {checklistGroups.map(([category, items]) => (
          <optgroup key={category} label={category}>
            {items.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <span className="activity-switcher-chevron" aria-hidden="true">
        <ChevronDown size={16} strokeWidth={2.2} />
      </span>
    </label>
  )
}
