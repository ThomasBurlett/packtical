import { useState } from "react";
import { Card, Chip, Link } from "@heroui/react";
import { CHECKLISTS } from "@/data/checklists";
import { getStorageKey } from "@/lib/checklist-storage";
import type { PersistedChecklistState } from "@/types/checklist";

type ResumeChecklist = {
  slug: string;
  checkedCount: number;
  totalCount: number;
  percent: number;
};

function loadResumeLists() {
  return CHECKLISTS.map((list) => {
    const totalBaseItems = list.sections.reduce((sum, section) => sum + section.items.length, 0);

    try {
      const rawState = localStorage.getItem(getStorageKey(list.slug));
      const parsedState = rawState ? (JSON.parse(rawState) as PersistedChecklistState | null) : null;

      if (!parsedState || typeof parsedState !== "object") {
        return null;
      }

      const checkedCount = Array.isArray(parsedState.checkedIds) ? parsedState.checkedIds.length : 0;
      const customItemCount =
        parsedState.customItems && typeof parsedState.customItems === "object"
          ? Object.values(parsedState.customItems).reduce(
              (sum, items) => sum + (Array.isArray(items) ? items.length : 0),
              0,
            )
          : 0;
      const totalCount = totalBaseItems + customItemCount;
      const hasSavedState =
        checkedCount > 0 ||
        customItemCount > 0 ||
        (Array.isArray(parsedState.collapsedSections) && parsedState.collapsedSections.length > 0);

      if (!hasSavedState || totalCount === 0) {
        return null;
      }

      return {
        slug: list.slug,
        checkedCount,
        totalCount,
        percent: Math.round((checkedCount / totalCount) * 100),
      };
    } catch {
      return null;
    }
  })
    .filter((list): list is ResumeChecklist => list !== null)
    .sort((left, right) => right.percent - left.percent || right.checkedCount - left.checkedCount);
}

export function HomePage() {
  const [resumeLists] = useState<ResumeChecklist[]>(loadResumeLists);

  const resumeMap = Object.fromEntries(resumeLists.map((list) => [list.slug, list]));
  const featuredResumeLists = resumeLists.slice(0, 3);

  return (
    <main className="page-frame">
      <section className="page-shell home-layout">
        <Card className="hero-card home-launch-card" variant="tertiary">
          <Card.Header className="hero-header home-launch-header">
            <div className="hero-copy-block">
              <Chip className="hero-chip" variant="soft">
                Checklist library
              </Chip>
              <Card.Title className="hero-title home-launch-title">
                Pick a checklist and start packing.
              </Card.Title>
              <Card.Description className="hero-description">
                Open an activity, keep your progress, and jump back in anytime.
              </Card.Description>
            </div>
            <div className="home-quick-nav" aria-label="Quick checklist links">
              {CHECKLISTS.map((list) => (
                <Link className="quick-link" href={`#/${list.slug}`} key={list.slug}>
                  {list.shortLabel}
                </Link>
              ))}
            </div>
          </Card.Header>
          {featuredResumeLists.length > 0 ? (
            <Card.Content className="resume-grid">
              {featuredResumeLists.map((list) => {
                const checklist = CHECKLISTS.find((entry) => entry.slug === list.slug);
                if (!checklist) return null;

                return (
                  <Link className="activity-card-link" href={`#/${checklist.slug}`} key={checklist.slug}>
                    <Card className="resume-card" variant="secondary">
                      <Card.Header className="resume-card-header">
                        <Chip className="activity-chip" variant="soft">
                          Continue
                        </Chip>
                        <Card.Title>{checklist.label}</Card.Title>
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
                        <span>Resume checklist</span>
                        <strong>{list.percent}%</strong>
                      </Card.Footer>
                    </Card>
                  </Link>
                );
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
              <Card.Title className="section-title">Choose an activity</Card.Title>
              <Card.Description className="section-description">
                Open any list below.
              </Card.Description>
            </div>
            <div className="library-summary">{CHECKLISTS.length} ready</div>
          </Card.Header>
          <Card.Content className="activity-grid">
            {CHECKLISTS.map((list) => (
              <Link className="activity-card-link" href={`#/${list.slug}`} key={list.slug}>
                <Card className="activity-card" variant="secondary">
                  <Card.Header className="activity-card-header">
                    <div className="activity-card-topline">
                      <Chip className="activity-chip" variant="soft">
                        {list.shortLabel}
                      </Chip>
                      {resumeMap[list.slug] ? (
                        <span className="activity-card-status">
                          {resumeMap[list.slug].percent}% complete
                        </span>
                      ) : null}
                    </div>
                    <Card.Title>{list.label}</Card.Title>
                    <Card.Description>{list.summary}</Card.Description>
                  </Card.Header>
                  <Card.Content className="activity-card-meta">
                    <span>{list.sections.length} sections</span>
                    <span>{list.sections.reduce((sum, section) => sum + section.items.length, 0)} items</span>
                  </Card.Content>
                  {resumeMap[list.slug] ? (
                    <Card.Content className="activity-card-progress">
                      <div
                        aria-hidden="true"
                        className="activity-card-progress-bar"
                        role="presentation"
                      >
                        <span style={{ width: `${resumeMap[list.slug].percent}%` }} />
                      </div>
                    </Card.Content>
                  ) : null}
                  <Card.Footer className="activity-card-footer">
                    <span>{resumeMap[list.slug] ? "Resume checklist" : "Open checklist"}</span>
                  </Card.Footer>
                </Card>
              </Link>
            ))}
          </Card.Content>
        </Card>
      </section>
    </main>
  );
}
