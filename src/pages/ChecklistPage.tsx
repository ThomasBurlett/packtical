import { Link } from "react-router-dom";
import { ActivityNav } from "@/components/checklist/ActivityNav";
import { ChecklistSection } from "@/components/checklist/ChecklistSection";
import { ChecklistToolbar } from "@/components/checklist/ChecklistToolbar";
import { CHECKLISTS, CHECKLIST_MAP } from "@/data/checklists";
import { useChecklistState } from "@/hooks/useChecklistState";

interface ChecklistPageProps {
  slug: string;
}

export function ChecklistPage({ slug }: ChecklistPageProps) {
  const list = CHECKLIST_MAP[slug];

  if (!list) {
    return (
      <main className="page-shell page-main">
        <p>Unknown checklist.</p>
        <Link className="home-link" to="/">
          Back to checklist hub
        </Link>
      </main>
    );
  }

  return <ChecklistPageContent checklist={list} />;
}

function ChecklistPageContent({ checklist }: { checklist: (typeof CHECKLISTS)[number] }) {
  const { sections, totals, filter, drafts, openForms, checkedIds, hasVisibleOpenSection, actions } =
    useChecklistState(checklist);

  return (
    <>
      <header className="page-shell page-header">
        <Link className="home-link" to="/">
          Adventure Checklist Hub
        </Link>
        <p className="eyebrow">REI-inspired checklist</p>
        <h1>{checklist.label}</h1>
        <p className="page-subtitle">{checklist.subtitle}</p>
        <ActivityNav checklists={CHECKLISTS} />
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

      <main className="page-shell page-main">
        <section className="summary-grid">
          <article className="summary-card">
            <strong>How it works</strong>
            <span>Check items as you pack. Progress saves only for this activity.</span>
          </article>
          <article className="summary-card">
            <strong>Make it yours</strong>
            <span>Add section-specific custom items without disturbing the base list order.</span>
          </article>
          <article className="summary-card">
            <strong>Source</strong>
            <span>
              Adapted from{" "}
              <a href={checklist.sourceUrl} rel="noreferrer" target="_blank">
                {checklist.sourceLabel}
              </a>
              .
            </span>
          </article>
        </section>

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
              onToggleAddForm={actions.toggleAddForm}
              onToggleSection={actions.toggleSection}
              onUpdateChecked={actions.updateChecked}
              section={section}
            />
          ))}
        </div>
      </main>
    </>
  );
}
