import type { ChecklistItem, ChecklistSectionState } from "@/types/checklist";

interface ChecklistSectionProps {
  section: ChecklistSectionState;
  checkedIds: ReadonlySet<string>;
  draftValue: string;
  isFormOpen: boolean;
  onToggleSection: (sectionId: string) => void;
  onSetSectionChecked: (sectionId: string, nextChecked: boolean) => void;
  onToggleAddForm: (sectionId: string) => void;
  onDraftChange: (sectionId: string, value: string) => void;
  onAddCustomItem: (sectionId: string) => void;
  onDeleteCustomItem: (sectionId: string, itemId: string) => void;
  onUpdateChecked: (itemId: string, nextChecked: boolean) => void;
}

export function ChecklistSection({
  section,
  checkedIds,
  draftValue,
  isFormOpen,
  onToggleSection,
  onSetSectionChecked,
  onToggleAddForm,
  onDraftChange,
  onAddCustomItem,
  onDeleteCustomItem,
  onUpdateChecked,
}: ChecklistSectionProps) {
  const isFilteredOut = section.visibleItems.length === 0;

  return (
    <section
      className={`list-section${section.isCollapsed ? " collapsed" : ""}${
        isFilteredOut ? " filtered-out" : ""
      }`}
    >
      <button className="section-header" onClick={() => onToggleSection(section.id)} type="button">
        <span className="section-heading">
          <span className="chevron">{section.isCollapsed ? "▸" : "▾"}</span>
          <span>
            <strong>{section.title}</strong>
          </span>
        </span>
        <span className="section-count">
          {section.checkedCount}/{section.items.length}
        </span>
      </button>

      <div className="section-tools">
        <button className="mini-btn" onClick={() => onSetSectionChecked(section.id, true)} type="button">
          Select all
        </button>
        <button className="mini-btn" onClick={() => onSetSectionChecked(section.id, false)} type="button">
          Clear
        </button>
        <button className="mini-btn" onClick={() => onToggleAddForm(section.id)} type="button">
          Add item
        </button>
      </div>

      <form
        className={`add-item-form${isFormOpen ? "" : " hidden"}`}
        onSubmit={(event) => {
          event.preventDefault();
          onAddCustomItem(section.id);
        }}
      >
        <input
          aria-label={`Add custom item to ${section.title}`}
          onChange={(event) => onDraftChange(section.id, event.target.value)}
          placeholder={`Add your own item to ${section.title}`}
          type="text"
          value={draftValue}
        />
        <button type="submit">Save</button>
      </form>

      <div className="items">
        {section.visibleItems.map((item) => (
          <ChecklistSectionItem
            checked={checkedIds.has(item.id)}
            item={item}
            key={item.id}
            sectionId={section.id}
            onDeleteCustomItem={onDeleteCustomItem}
            onUpdateChecked={onUpdateChecked}
          />
        ))}
      </div>
    </section>
  );
}

interface ChecklistSectionItemProps {
  sectionId: string;
  item: ChecklistItem;
  checked: boolean;
  onDeleteCustomItem: (sectionId: string, itemId: string) => void;
  onUpdateChecked: (itemId: string, nextChecked: boolean) => void;
}

function ChecklistSectionItem({
  sectionId,
  item,
  checked,
  onDeleteCustomItem,
  onUpdateChecked,
}: ChecklistSectionItemProps) {
  const inputId = `${sectionId}-${item.id}`;

  return (
    <div className={`item-card${checked ? " checked" : ""}`}>
      <input
        checked={checked}
        id={inputId}
        onChange={(event) => onUpdateChecked(item.id, event.target.checked)}
        type="checkbox"
      />
      <label className="item-body" htmlFor={inputId}>
        <span className="item-label">{item.label}</span>
        {item.note ? <small>{item.note}</small> : null}
      </label>
      <div className="item-meta">
        <span className={`tag ${item.kind}`}>{getItemKindLabel(item.kind)}</span>
        {item.source === "custom" ? (
          <button
            aria-label={`Delete ${item.label}`}
            className="icon-btn"
            onClick={() => onDeleteCustomItem(sectionId, item.id)}
            type="button"
          >
            &times;
          </button>
        ) : null}
      </div>
    </div>
  );
}

function getItemKindLabel(kind: ChecklistItem["kind"]) {
  switch (kind) {
    case "core":
      return "Core";
    case "optional":
      return "Optional";
    default:
      return "Custom";
  }
}
