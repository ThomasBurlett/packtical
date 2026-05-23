import { ChevronDown } from "lucide-react"
import type { Checklist } from "@/types/checklist"

interface ActivityNavProps {
  checklists: Checklist[]
  activeSlug: string
  variant?: "inline" | "hero-title"
}

export function ActivityNav({
  checklists,
  activeSlug,
  variant = "inline",
}: ActivityNavProps) {
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
            {checklists.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.label}
              </option>
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
