import { Card, Link } from "@heroui/react"
import { ArrowLeft, Layers3 } from "lucide-react"
import { ActivityNav } from "@/components/checklist/ActivityNav"
import { ChecklistSection } from "@/components/checklist/ChecklistSection"
import { ChecklistToolbar } from "@/components/checklist/ChecklistToolbar"
import { CHECKLISTS, CHECKLIST_MAP } from "@/data/checklists"
import { ActivityIcon } from "@/lib/activity-icons"
import { useChecklistState } from "@/hooks/useChecklistState"

interface ChecklistPageProps {
  slug: string
}

export function ChecklistPage({ slug }: ChecklistPageProps) {
  const list = CHECKLIST_MAP[slug]

  if (!list) {
    return (
      <main className="page-frame">
        <section className="page-shell page-main">
          <Card className="page-hero checklist-hero" variant="tertiary">
            <Card.Content className="unknown-card-body">
              <p className="unknown-card-copy">Unknown checklist.</p>
              <Link className="page-back-link" href="#/">
                <ArrowLeft aria-hidden="true" size={16} strokeWidth={2.2} />
                Back to checklist hub
              </Link>
            </Card.Content>
          </Card>
        </section>
      </main>
    )
  }

  return <ChecklistPageContent checklist={list} />
}

function ChecklistPageContent({ checklist }: { checklist: (typeof CHECKLISTS)[number] }) {
  const {
    sections,
    totals,
    filter,
    drafts,
    openForms,
    checkedIds,
    hasVisibleOpenSection,
    actions,
  } = useChecklistState(checklist)

  const sectionsCount = sections.length
  return (
    <main className="page-frame checklist-page">
      <header className="page-shell checklist-shell page-header checklist-page-header">
        <section className="home-hero checklist-hero" aria-labelledby="checklist-title">
          <div className="checklist-hero-topbar">
            <Link className="page-back-link" href="#/">
              <ArrowLeft aria-hidden="true" size={16} strokeWidth={2.2} />
              Back to checklist hub
            </Link>

            <div className="checklist-hero-switcher">
              <ActivityNav activeSlug={checklist.slug} checklists={CHECKLISTS} />
            </div>
          </div>

          <div className="home-hero-copy checklist-hero-copy">
            <div className="checklist-hero-main">
              <span className="checklist-hero-icon align-center" aria-hidden="true">
                <ActivityIcon slug={checklist.slug} size={28} strokeWidth={2.1} />
              </span>
              <div className="checklist-hero-title-block">
                <Card.Title className="page-title" id="checklist-title">
                  {checklist.label}
                </Card.Title>
                <Card.Description className="page-subtitle">
                  {checklist.subtitle}
                </Card.Description>
              </div>
            </div>

            <div className="home-hero-facts checklist-hero-facts" aria-label="Checklist summary">
              <div className="home-hero-fact checklist-hero-fact">
                <Layers3 aria-hidden="true" size={15} strokeWidth={2.1} />
                <span>{sectionsCount} sections</span>
              </div>
            </div>
          </div>
        </section>

        <div className="checklist-hero-controls">
          <ChecklistToolbar
            checked={totals.checked}
            filter={filter}
            hasVisibleOpenSection={hasVisibleOpenSection}
            onFilterChange={actions.setFilter}
            onResetChecks={actions.resetChecks}
            onToggleAllSections={actions.toggleAllSections}
            percent={totals.percent}
            total={totals.total}
          />
        </div>
      </header>

      <section className="page-shell checklist-shell page-main checklist-sections-shell">
        <div className="sections-wrap">
          {sections.map((section) => (
            <ChecklistSection
              checkedIds={checkedIds}
              draftKind={drafts[section.id]?.kind ?? "core"}
              draftValue={drafts[section.id]?.label ?? ""}
              isFormOpen={openForms.has(section.id)}
              key={section.id}
              onAddCustomItem={actions.addCustomItem}
              onDeleteCustomItem={actions.deleteCustomItem}
              onDraftChange={actions.setDraft}
              onDraftKindChange={actions.setDraftKind}
              onSetAddFormOpen={actions.setAddFormOpen}
              onSetSectionChecked={actions.setSectionChecked}
              onSetSectionCollapsed={actions.setSectionCollapsed}
              onUpdateChecked={actions.updateChecked}
              section={section}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
