import { Card, Chip, Link } from "@heroui/react"
import { ArrowLeft, CheckCircle2, FolderSync, ListChecks } from "lucide-react"
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

  return (
    <main className="page-frame">
      <header className="page-shell page-header">
        <Card className="page-hero checklist-hero" variant="tertiary">
          <Card.Header className="page-hero-header checklist-hero-header">
            <div className="page-hero-copy">
              <Link className="page-back-link" href="#/">
                <ArrowLeft aria-hidden="true" size={16} strokeWidth={2.2} />
                Back to checklist hub
              </Link>

              <div className="checklist-hero-title-row">
                <span className="checklist-hero-icon" aria-hidden="true">
                  <ActivityIcon slug={checklist.slug} size={28} strokeWidth={2.1} />
                </span>
                <div className="checklist-hero-title-block">
                  <Chip className="section-chip" variant="soft">
                    {checklist.label} checklist
                  </Chip>
                  <Card.Title className="page-title">{checklist.label}</Card.Title>
                </div>
              </div>

              <Card.Description className="page-subtitle">
                {checklist.subtitle}
              </Card.Description>
            </div>

            <div className="checklist-hero-stats">
              <Card className="summary-card checklist-stat-card" variant="secondary">
                <div className="checklist-stat-topline">
                  <CheckCircle2 aria-hidden="true" size={16} strokeWidth={2.1} />
                  <span>Progress</span>
                </div>
                <strong>
                  {totals.checked}/{totals.total}
                </strong>
                <p>{totals.percent}% packed</p>
              </Card>

              <Card className="summary-card checklist-stat-card" variant="secondary">
                <div className="checklist-stat-topline">
                  <ListChecks aria-hidden="true" size={16} strokeWidth={2.1} />
                  <span>Sections</span>
                </div>
                <strong>{sections.length}</strong>
                <p>Organized by category</p>
              </Card>

              <Card className="summary-card checklist-stat-card" variant="secondary">
                <div className="checklist-stat-topline">
                  <FolderSync aria-hidden="true" size={16} strokeWidth={2.1} />
                  <span>Saved</span>
                </div>
                <strong>Auto</strong>
                <p>Checks and custom items persist</p>
              </Card>
            </div>
          </Card.Header>

          <Card.Footer className="page-hero-footer checklist-hero-footer">
            <ActivityNav activeSlug={checklist.slug} checklists={CHECKLISTS} />
          </Card.Footer>
        </Card>
      </header>

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

      <section className="page-shell page-main">
        <div className="sections-wrap">
          {sections.map((section) => (
            <ChecklistSection
              checkedIds={checkedIds}
              draftValue={drafts[section.id] ?? ""}
              isFormOpen={openForms.has(section.id)}
              key={section.id}
              onAddCustomItem={actions.addCustomItem}
              onDeleteCustomItem={actions.deleteCustomItem}
              onDraftChange={actions.setDraft}
              onSetSectionChecked={actions.setSectionChecked}
              onSetSectionCollapsed={actions.setSectionCollapsed}
              onToggleAddForm={actions.toggleAddForm}
              onUpdateChecked={actions.updateChecked}
              section={section}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
