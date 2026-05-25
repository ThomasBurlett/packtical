import { useEffect, useState } from "react"
import { Card, Chip, Link } from "@heroui/react"
import { useAuth } from "@/auth/auth-context"
import { AuthStatus } from "@/components/auth/AuthStatus"
import { CHECKLISTS } from "@/data/checklists"
import { ActivityIcon } from "@/lib/activity-icons"
import { loadChecklistState } from "@/lib/checklist-storage"
import { loadRemoteChecklistStates } from "@/lib/remote-checklist-storage"
import type { PersistedChecklistState } from "@/types/checklist"

type ResumeChecklist = {
  slug: string
  checkedCount: number
  totalCount: number
  percent: number
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

function loadLocalResumeLists() {
  return createResumeLists(
    Object.fromEntries(
      CHECKLISTS.map((list) => {
        try {
          const sectionIds = list.sections.map((section) => section.id)
          return [list.slug, loadChecklistState(list.slug, sectionIds)]
        } catch {
          return [list.slug, null]
        }
      }),
    ),
  )
}

export function HomePage() {
  const { user } = useAuth()
  const [resumeLists, setResumeLists] = useState<ResumeChecklist[]>(loadLocalResumeLists)
  const activeResumeLists = resumeLists.filter((list) => list.percent > 0)

  useEffect(() => {
    let isCancelled = false

    if (!user) {
      window.queueMicrotask(() => {
        if (!isCancelled) {
          setResumeLists(loadLocalResumeLists())
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
          setResumeLists(loadLocalResumeLists())
        }
      })

    return () => {
      isCancelled = true
    }
  }, [user])

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
                {CHECKLISTS.length} activities ready
              </span>
              <span className="home-hero-fact">
                {activeResumeLists.length > 0
                  ? `${activeResumeLists.length} in progress`
                  : "Progress saves automatically"}
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
          <div className="activity-grid">
            {orderedChecklists.map((list) => {
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
      </section>
    </main>
  )
}
