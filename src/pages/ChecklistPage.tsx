import { Card, Chip, Link, Switch } from "@heroui/react";
import { ActivityNav } from "@/components/checklist/ActivityNav";
import { ChecklistSection } from "@/components/checklist/ChecklistSection";
import { ChecklistToolbar } from "@/components/checklist/ChecklistToolbar";
import { CHECKLISTS, CHECKLIST_MAP } from "@/data/checklists";
import { useChecklistState } from "@/hooks/useChecklistState";

interface ChecklistPageProps {
  slug: string;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function ChecklistPage({ slug, isDark, onToggleTheme }: ChecklistPageProps) {
  const list = CHECKLIST_MAP[slug];

  if (!list) {
    return (
      <main className="page-shell page-main">
        <p>Unknown checklist.</p>
        <Link className="hero-link" href="#/">
          Back to checklist hub
        </Link>
      </main>
    );
  }

  return <ChecklistPageContent checklist={list} isDark={isDark} onToggleTheme={onToggleTheme} />;
}

function ChecklistPageContent({
  checklist,
  isDark,
  onToggleTheme,
}: {
  checklist: (typeof CHECKLISTS)[number];
  isDark: boolean;
  onToggleTheme: () => void;
}) {
  const { sections, totals, filter, drafts, openForms, checkedIds, hasVisibleOpenSection, actions } =
    useChecklistState(checklist);

  return (
    <main className="page-frame">
      <header className="page-shell page-header">
        <Card className="page-hero" variant="tertiary">
          <Card.Header className="page-hero-header">
            <div className="page-hero-copy">
              <Link className="back-link" href="#/">
                Adventure Checklist Hub
              </Link>
              <Chip className="section-chip" variant="soft">
                REI-inspired checklist
              </Chip>
              <Card.Title className="page-title">{checklist.label}</Card.Title>
              <Card.Description className="page-subtitle">{checklist.subtitle}</Card.Description>
            </div>
            <Card className="theme-toggle-card" variant="secondary">
              <Card.Content className="theme-toggle-content">
                <span className="theme-toggle-label">Theme</span>
                <Switch isSelected={isDark} onChange={onToggleTheme} size="sm">
                  <Switch.Control />
                </Switch>
              </Card.Content>
            </Card>
          </Card.Header>
          <Card.Footer className="page-hero-footer">
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
        <div className="summary-grid">
          <Card className="summary-card" variant="secondary">
            <Card.Title>How it works</Card.Title>
            <Card.Description>
              Check items as you pack. Progress, collapsed sections, and custom items persist for
              this activity only.
            </Card.Description>
          </Card>
          <Card className="summary-card" variant="secondary">
            <Card.Title>Make it yours</Card.Title>
            <Card.Description>
              Add section-specific custom items without disturbing the original checklist order.
            </Card.Description>
          </Card>
          <Card className="summary-card" variant="secondary">
            <Card.Title>Source</Card.Title>
            <Card.Description>
              Adapted from{" "}
              <Link href={checklist.sourceUrl} rel="noreferrer" target="_blank">
                {checklist.sourceLabel}
              </Link>
              .
            </Card.Description>
          </Card>
        </div>

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
  );
}
