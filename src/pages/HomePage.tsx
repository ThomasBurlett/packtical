import { useState } from "react"
import { Card, Chip, Link } from "@heroui/react"
import {
  Backpack,
  Bike,
  Briefcase,
  Flame,
  Mountain,
  Trees,
  type LucideIcon,
} from "lucide-react"
import { CHECKLISTS } from "@/data/checklists"
import { getStorageKey } from "@/lib/checklist-storage"
import type { PersistedChecklistState } from "@/types/checklist"

type ResumeChecklist = {
  slug: string
  checkedCount: number
  totalCount: number
  percent: number
}

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  camping: Flame,
  "trail-running": Trees,
  "travel-preparation": Briefcase,
  backpacking: Backpack,
  "basic-cycling": Bike,
  "mountain-biking": Mountain,
}

function loadResumeLists() {
  return CHECKLISTS.map((list) => {
    const totalBaseItems = list.sections.reduce(
      (sum, section) => sum + section.items.length,
      0,
    )

    try {
      const rawState = localStorage.getItem(getStorageKey(list.slug))
      const parsedState = rawState
        ? (JSON.parse(rawState) as PersistedChecklistState | null)
        : null

      if (!parsedState || typeof parsedState !== "object") {
        return null
      }

      const checkedCount = Array.isArray(parsedState.checkedIds)
        ? parsedState.checkedIds.length
        : 0
      const customItemCount =
        parsedState.customItems && typeof parsedState.customItems === "object"
          ? Object.values(parsedState.customItems).reduce(
              (sum, items) => sum + (Array.isArray(items) ? items.length : 0),
              0,
            )
          : 0
      const totalCount = totalBaseItems + customItemCount
      const hasSavedState =
        checkedCount > 0 ||
        customItemCount > 0 ||
        (Array.isArray(parsedState.collapsedSections) &&
          parsedState.collapsedSections.length > 0)

      if (!hasSavedState || totalCount === 0) {
        return null
      }

      return {
        slug: list.slug,
        checkedCount,
        totalCount,
        percent: Math.round((checkedCount / totalCount) * 100),
      }
    } catch {
      return null
    }
  })
    .filter((list): list is ResumeChecklist => list !== null)
    .sort(
      (left, right) =>
        right.percent - left.percent || right.checkedCount - left.checkedCount,
    )
}

export function HomePage() {
  const [resumeLists] = useState<ResumeChecklist[]>(loadResumeLists)

  const resumeMap = Object.fromEntries(
    resumeLists.map((list) => [list.slug, list]),
  )
  const featuredResumeLists = resumeLists.slice(0, 3)

  return (
    <main className="page-frame">
      <section className="page-shell home-layout">
        <Card className="hero-card home-launch-card" variant="tertiary">
          <Card.Header className="hero-header home-launch-header">
            <div className="hero-copy-block">
              <Chip className="hero-chip" variant="soft">
                Checklist Hub
              </Chip>
              <Card.Title className="hero-title home-launch-title">
                Pick a checklist and start packing.
              </Card.Title>
              <Card.Description className="hero-description">
                Open an activity, keep your progress, and jump back in anytime.
              </Card.Description>
            </div>
          </Card.Header>
          {featuredResumeLists.length > 0 ? (
            <Card.Content className="resume-grid">
              {featuredResumeLists.map((list) => {
                const checklist = CHECKLISTS.find(
                  (entry) => entry.slug === list.slug,
                )
                if (!checklist) return null
                const Icon = ACTIVITY_ICONS[checklist.slug] ?? Backpack

                return (
                  <Link
                    className="activity-card-link"
                    href={`#/${checklist.slug}`}
                    key={checklist.slug}
                  >
                    <Card className="resume-card" variant="secondary">
                      <Card.Header className="resume-card-header">
                        <div className="activity-card-topline">
                          <div className="activity-card-title-row">
                            <span
                              className="activity-card-icon"
                              aria-hidden="true"
                            >
                              <Icon size={18} strokeWidth={2.1} />
                            </span>
                            <Card.Title>{checklist.label}</Card.Title>
                          </div>
                          <span className="activity-card-status">Continue</span>
                        </div>
                        <Card.Description>
                          {list.checkedCount} of {list.totalCount} items packed
                        </Card.Description>
                      </Card.Header>
                      <Card.Content className="resume-progress-block">
                        <div
                          aria-hidden="true"
                          className="activity-card-progress-bar"
                          role="presentation"
                        >
                          <span style={{ width: `${list.percent}%` }} />
                        </div>
                      </Card.Content>
                      <Card.Footer className="activity-card-footer">
                        <span>
                          Resume checklist{" "}
                          <span aria-hidden="true">&rarr;</span>
                        </span>
                        <strong>{list.percent}%</strong>
                      </Card.Footer>
                    </Card>
                  </Link>
                )
              })}
            </Card.Content>
          ) : null}
        </Card>

        <Card className="library-card" id="activities" variant="default">
          <Card.Header className="section-heading library-heading">
            <div className="library-copy">
              <Chip className="section-chip" variant="soft">
                All checklists
              </Chip>
              <Card.Title className="section-title">
                Choose an activity
              </Card.Title>
            </div>
          </Card.Header>
          <Card.Content className="activity-grid">
            {CHECKLISTS.map((list) => {
              const Icon = ACTIVITY_ICONS[list.slug] ?? Backpack
              const progress = resumeMap[list.slug]

              return (
                <Link
                  className="activity-card-link"
                  href={`#/${list.slug}`}
                  key={list.slug}
                >
                  <Card className="activity-card" variant="secondary">
                    <Card.Header className="activity-card-header">
                      <div className="activity-card-topline">
                        <div className="activity-card-title-row">
                          <span
                            className="activity-card-icon"
                            aria-hidden="true"
                          >
                            <Icon size={18} strokeWidth={2.1} />
                          </span>
                          <Card.Title>{list.label}</Card.Title>
                        </div>
                        {progress ? (
                          <span className="activity-card-status">
                            {progress.percent}% complete
                          </span>
                        ) : null}
                      </div>
                      <Card.Description>{list.summary}</Card.Description>
                    </Card.Header>
                    <Card.Content
                      className={`activity-card-progress${progress ? "" : " activity-card-progress-empty"}`}
                    >
                      <div
                        aria-hidden="true"
                        className="activity-card-progress-bar"
                        role="presentation"
                      >
                        <span style={{ width: `${progress?.percent ?? 0}%` }} />
                      </div>
                    </Card.Content>
                    <Card.Footer className="activity-card-footer">
                      <span>
                        {progress ? "Resume checklist " : "Open checklist "}
                        <span aria-hidden="true">&rarr;</span>
                      </span>
                    </Card.Footer>
                  </Card>
                </Link>
              )
            })}
          </Card.Content>
        </Card>
      </section>
    </main>
  )
}
