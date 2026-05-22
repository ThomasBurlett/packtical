import { Button, ButtonGroup, Card, Checkbox, Chip, Input, Label } from "@heroui/react"
import { Check, ChevronDown, Plus, Trash2, X } from "lucide-react"
import type { ChecklistItem, ChecklistSectionState } from "@/types/checklist"

interface ChecklistSectionProps {
  section: ChecklistSectionState
  checkedIds: ReadonlySet<string>
  draftValue: string
  isFormOpen: boolean
  onSetSectionCollapsed: (sectionId: string, isCollapsed: boolean) => void
  onSetSectionChecked: (sectionId: string, nextChecked: boolean) => void
  onToggleAddForm: (sectionId: string) => void
  onDraftChange: (sectionId: string, value: string) => void
  onAddCustomItem: (sectionId: string) => void
  onDeleteCustomItem: (sectionId: string, itemId: string) => void
  onUpdateChecked: (itemId: string, nextChecked: boolean) => void
}

export function ChecklistSection({
  section,
  checkedIds,
  draftValue,
  isFormOpen,
  onSetSectionCollapsed,
  onSetSectionChecked,
  onToggleAddForm,
  onDraftChange,
  onAddCustomItem,
  onDeleteCustomItem,
  onUpdateChecked,
}: ChecklistSectionProps) {
  if (section.visibleItems.length === 0) {
    return null
  }

  return (
    <Card className="section-card" variant="secondary">
      <button
        className="section-header section-header-button"
        onClick={() => onSetSectionCollapsed(section.id, !section.isCollapsed)}
        type="button"
      >
        <div className="section-heading">
          <div>
            <div className="section-title-row">
              <strong>{section.title}</strong>
              <Chip className="section-count-chip" variant="soft">
                {section.checkedCount}/{section.items.length}
              </Chip>
            </div>
            <span className="section-count">
              {section.visibleItems.length} visible item
              {section.visibleItems.length === 1 ? "" : "s"}
            </span>
          </div>
          <span
            className={`section-chevron${section.isCollapsed ? "" : " open"}`}
            aria-hidden="true"
          >
            <ChevronDown size={18} strokeWidth={2.2} />
          </span>
        </div>
      </button>

      {!section.isCollapsed ? (
        <Card.Content className="section-body">
          <ButtonGroup className="section-tools" size="sm" variant="secondary">
            <Button onPress={() => onSetSectionChecked(section.id, true)}>
              <Check aria-hidden="true" size={15} strokeWidth={2.2} />
              Select all
            </Button>
            <Button onPress={() => onSetSectionChecked(section.id, false)}>
              <X aria-hidden="true" size={15} strokeWidth={2.2} />
              Clear
            </Button>
            <Button onPress={() => onToggleAddForm(section.id)}>
              <Plus aria-hidden="true" size={15} strokeWidth={2.2} />
              Add item
            </Button>
          </ButtonGroup>

          {isFormOpen ? (
            <form
              className="add-item-form"
              onSubmit={(event) => {
                event.preventDefault()
                onAddCustomItem(section.id)
              }}
            >
              <Label className="sr-only" htmlFor={`custom-item-${section.id}`}>
                Add custom item to {section.title}
              </Label>
              <Input
                className="add-item-input"
                fullWidth
                id={`custom-item-${section.id}`}
                onChange={(event) => onDraftChange(section.id, event.target.value)}
                placeholder={`Add your own item to ${section.title}`}
                value={draftValue}
                variant="secondary"
              />
              <Button type="submit">Save item</Button>
            </form>
          ) : null}

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
        </Card.Content>
      ) : null}
    </Card>
  )
}

interface ChecklistSectionItemProps {
  sectionId: string
  item: ChecklistItem
  checked: boolean
  onDeleteCustomItem: (sectionId: string, itemId: string) => void
  onUpdateChecked: (itemId: string, nextChecked: boolean) => void
}

function ChecklistSectionItem({
  sectionId,
  item,
  checked,
  onDeleteCustomItem,
  onUpdateChecked,
}: ChecklistSectionItemProps) {
  const inputId = `${sectionId}-${item.id}`

  return (
    <Card className={`item-card${checked ? " checked" : ""}`} variant="secondary">
      <Card.Content className="item-card-content">
        <Checkbox
          className="item-checkbox"
          id={inputId}
          isSelected={checked}
          onChange={(isSelected) => onUpdateChecked(item.id, isSelected)}
          variant="secondary"
        >
          <Checkbox.Control className="item-checkbox-control">
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content className="item-body">
            <div className="item-topline">
              <Label className="item-label" htmlFor={inputId}>
                {item.label}
              </Label>
              <div className="item-side-meta">
                <Chip
                  className="item-tag"
                  color={getItemChipColor(item.kind)}
                  size="sm"
                  variant="soft"
                >
                  {getItemKindLabel(item.kind)}
                </Chip>
                {item.source === "custom" ? (
                  <Button
                    aria-label={`Delete ${item.label}`}
                    className="item-delete-button"
                    isIconOnly
                    onPress={() => onDeleteCustomItem(sectionId, item.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 aria-hidden="true" size={15} strokeWidth={2.1} />
                  </Button>
                ) : null}
              </div>
            </div>
            {item.note ? <span className="item-note">{item.note}</span> : null}
          </Checkbox.Content>
        </Checkbox>
      </Card.Content>
    </Card>
  )
}

function getItemKindLabel(kind: ChecklistItem["kind"]) {
  switch (kind) {
    case "core":
      return "Core"
    case "optional":
      return "Optional"
    default:
      return "Custom"
  }
}

function getItemChipColor(kind: ChecklistItem["kind"]) {
  switch (kind) {
    case "core":
      return "success"
    case "optional":
      return "warning"
    default:
      return "accent"
  }
}
