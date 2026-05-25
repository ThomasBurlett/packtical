import { useEffect, useState } from "react"
import { Card, Chip, Link } from "@heroui/react"
import { useAuth } from "@/auth/auth-context"
import { AuthStatus } from "@/components/auth/AuthStatus"
import { CHECKLISTS } from "@/data/checklists"
import { ActivityIcon } from "@/lib/activity-icons"
import { loadRemoteChecklistStates } from "@/lib/remote-checklist-storage"
import type { PersistedChecklistState } from "@/types/checklist"

type ResumeChecklist = {
  slug: string
  checkedCount: number
  totalCount: number
  percent: number
}

const CATEGORY_ORDER = ["Travel", "Outdoor", "Cycling", "Snow"]

function sortCategoryNames(left: string, right: string) {
  const leftIndex = CATEGORY_ORDER.indexOf(left)
  const rightIndex = CATEGORY_ORDER.indexOf(right)

  if (leftIndex !== -1 || rightIndex !== -1) {
    return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) -
      (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex)
  }

  return left.localeCompare(right)
}

function createResumeLists(states: Record<string, PersistedChecklistState | null | undefined>) {
  return CHECKLISTS.map((list) => {
    const totalBaseItems = list.sections.reduce(
      (sum, section) => sum + section.items.length,
      0,
    )
    const parsedState = states[list.slug]

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
  })
    .filter((list): list is ResumeChecklist => list !== null)
    .sort(
      (left, right) =>
        right.percent - left.percent || right.checkedCount - left.checkedCount,
    )
}

export function HomePage() {
  const { syncVersion, user } = useAuth()
  const [resumeLists, setResumeLists] = useState<ResumeChecklist[]>([])
  const activeResumeLists = resumeLists.filter((list) => list.percent > 0)

  useEffect(() => {
    let isCancelled = false

    if (!user) {
      window.queueMicrotask(() => {
        if (!isCancelled) {
          setResumeLists([])
        }
      })
      return
    }

    loadRemoteChecklistStates()
      .then((states) => {
        if (!isCancelled) {
          setResumeLists(createResumeLists(states))
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setResumeLists([])
        }
      })

    return () => {
      isCancelled = true
    }
  }, [syncVersion, user])

  const resumeMap = Object.fromEntries(
    activeResumeLists.map((list) => [list.slug, list]),
  )
  const orderedChecklists = [...CHECKLISTS].sort((left, right) => {
    const leftInProgress = Number((resumeMap[left.slug]?.percent ?? 0) > 0)
    const rightInProgress = Number((resumeMap[right.slug]?.percent ?? 0) > 0)

    if (leftInProgress !== rightInProgress) {
      return rightInProgress - leftInProgress
    }

    return left.label.localeCompare(right.label)
  })
  const checklistGroups = Object.entries(
    orderedChecklists.reduce<Record<string, typeof CHECKLISTS>>((groups, checklist) => {
      const category = checklist.category || "General"
      groups[category] = groups[category] ? [...groups[category], checklist] : [checklist]
      return groups
    }, {}),
  ).sort(([left], [right]) => sortCategoryNames(left, right))

  return (
    <main className="page-frame">
      <section className="page-shell home-layout">
        <header className="home-hero" aria-labelledby="home-title">
          <div className="home-hero-copy">
            <Chip className="hero-chip" variant="soft">
              Packtical
            </Chip>
            <h1 className="hero-title home-launch-title" id="home-title">
              Pick a plan and pack it right.
            </h1>
            <p className="hero-description">
              Choose an activity below, track what is ready, and come back to
              the same prep list whenever you need it.
            </p>
          </div>
          <div className="home-hero-support">
            <AuthStatus />
            <div className="home-hero-facts" aria-label="Checklist overview">
              <span className="home-hero-fact">
                {CHECKLISTS.length} checklists ready
              </span>
              <span className="home-hero-fact">
                {checklistGroups.length} categories
              </span>
              <span className="home-hero-fact">
                {activeResumeLists.length > 0
                  ? `${activeResumeLists.length} in progress`
                  : "Synced progress ready"}
              </span>
            </div>
          </div>
        </header>

        <section className="activity-library" id="activities" aria-labelledby="activities-title">
          <header className="section-heading library-heading">
            <div>
              <h2 className="section-title" id="activities-title">
                Choose an activity
              </h2>
            </div>
          </header>
          <div className="activity-groups">
            {checklistGroups.map(([category, checklists]) => (
              <section
                className="activity-group"
                key={category}
                aria-labelledby={`activity-category-${category.toLowerCase()}`}
              >
                <div className="activity-group-heading">
                  <h3 id={`activity-category-${category.toLowerCase()}`}>{category}</h3>
                  <span>{checklists.length} checklists</span>
                </div>
                <div className="activity-grid">
                  {checklists.map((list) => {
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
                                  <ActivityIcon slug={list.slug} size={18} strokeWidth={2.1} />
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
                </div>
              </section>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}
