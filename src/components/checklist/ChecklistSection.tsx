import { Button, Card, Checkbox, Chip, Input, Label, Modal } from "@heroui/react"
import { Check, ChevronDown, Plus, Trash2, X } from "lucide-react"
import { getViewportOrigin, type ConfettiOrigin } from "@/lib/confetti"
import type { ChecklistItem, ChecklistSectionState, ChecklistKind } from "@/types/checklist"

interface ChecklistSectionProps {
  section: ChecklistSectionState
  checkedIds: ReadonlySet<string>
  draftValue: string
  draftKind: Exclude<ChecklistKind, "custom">
  isFormOpen: boolean
  onSetAddFormOpen: (sectionId: string, isOpen: boolean) => void
  onSetSectionCollapsed: (sectionId: string, isCollapsed: boolean) => void
  onSetSectionChecked: (sectionId: string, nextChecked: boolean) => void
  onDraftChange: (sectionId: string, value: string) => void
  onDraftKindChange: (sectionId: string, kind: Exclude<ChecklistKind, "custom">) => void
  onAddCustomItem: (sectionId: string) => void
  onDeleteCustomItem: (sectionId: string, itemId: string) => void
  onUpdateChecked: (itemId: string, nextChecked: boolean, origin?: ConfettiOrigin) => void
}

export function ChecklistSection({
  section,
  checkedIds,
  draftKind,
  draftValue,
  isFormOpen,
  onSetAddFormOpen,
  onSetSectionCollapsed,
  onSetSectionChecked,
  onDraftChange,
  onDraftKindChange,
  onAddCustomItem,
  onDeleteCustomItem,
  onUpdateChecked,
}: ChecklistSectionProps) {
  if (section.visibleItems.length === 0) {
    return null
  }

  const areAllItemsChecked = section.items.length > 0 && section.checkedCount === section.items.length

  return (
    <Card className="section-card" variant="secondary">
      <div className="section-header">
        <button
          className="section-header-button"
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
            </div>
            <span
              className={`section-chevron${section.isCollapsed ? "" : " open"}`}
              aria-hidden="true"
            >
              <ChevronDown size={18} strokeWidth={2.2} />
            </span>
          </div>
        </button>

        <div className="section-header-actions" aria-label={`${section.title} actions`}>
          <Button
            className="section-tool-button"
            onPress={() => onSetSectionChecked(section.id, !areAllItemsChecked)}
            size="sm"
            variant="secondary"
          >
            <Check aria-hidden="true" size={14} strokeWidth={2.2} />
            Mark all
          </Button>
          <Button
            className="section-tool-button"
            onPress={() => onSetSectionChecked(section.id, false)}
            size="sm"
            variant="secondary"
          >
            <X aria-hidden="true" size={14} strokeWidth={2.2} />
            Clear
          </Button>
          <Button
            className="section-tool-button"
            onPress={() => onSetAddFormOpen(section.id, true)}
            size="sm"
            variant="secondary"
          >
            <Plus aria-hidden="true" size={14} strokeWidth={2.2} />
            Add
          </Button>
        </div>
      </div>

      {!section.isCollapsed ? (
        <Card.Content className="section-body">
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

      <Modal>
        <Modal.Backdrop
          isDismissable
          isOpen={isFormOpen}
          isKeyboardDismissDisabled={false}
          onOpenChange={(isOpen) => onSetAddFormOpen(section.id, isOpen)}
          variant="blur"
        >
        <Modal.Container placement="center" size="md">
          <Modal.Dialog className="add-item-modal">
            <form
              className="add-item-modal-form"
              onSubmit={(event) => {
                event.preventDefault()
                onAddCustomItem(section.id)
              }}
            >
              <Modal.Header className="add-item-modal-header">
                <Modal.Heading>Add Item</Modal.Heading>
              </Modal.Header>
              <Modal.Body className="add-item-modal-body">
                <p className="add-item-modal-copy">
                  Add a custom checklist item to {section.title} and choose whether it should read
                  as a core or optional piece of gear.
                </p>
                <div className="add-item-modal-field">
                  <Label htmlFor={`custom-item-${section.id}`}>Item name</Label>
                  <Input
                    autoFocus
                    className="add-item-input"
                    fullWidth
                    id={`custom-item-${section.id}`}
                    onChange={(event) => onDraftChange(section.id, event.target.value)}
                    placeholder={`Add your own item to ${section.title}`}
                    value={draftValue}
                    variant="secondary"
                  />
                </div>
                <div className="add-item-modal-field">
                  <Label htmlFor={`custom-kind-${section.id}`}>Priority</Label>
                  <select
                    className="activity-switcher-select add-item-kind-select"
                    id={`custom-kind-${section.id}`}
                    onChange={(event) =>
                      onDraftKindChange(
                        section.id,
                        event.target.value === "optional" ? "optional" : "core",
                      )
                    }
                    value={draftKind}
                  >
                    <option value="core">Core</option>
                    <option value="optional">Optional</option>
                  </select>
                </div>
              </Modal.Body>
              <Modal.Footer className="add-item-modal-footer">
                <Button onPress={() => onSetAddFormOpen(section.id, false)} variant="ghost">
                  Cancel
                </Button>
                <Button type="submit">Save item</Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </Card>
  )
}

interface ChecklistSectionItemProps {
  sectionId: string
  item: ChecklistItem
  checked: boolean
  onDeleteCustomItem: (sectionId: string, itemId: string) => void
  onUpdateChecked: (itemId: string, nextChecked: boolean, origin?: ConfettiOrigin) => void
}

function ChecklistSectionItem({
  sectionId,
  item,
  checked,
  onDeleteCustomItem,
  onUpdateChecked,
}: ChecklistSectionItemProps) {
  const inputId = `${sectionId}-${item.id}`
  const pointerOriginRef = React.useRef<ConfettiOrigin | undefined>(undefined)

  const rememberPressOrigin = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerOriginRef.current = getViewportOrigin(event.clientX, event.clientY)
  }

  const consumePressOrigin = () => {
    const origin = pointerOriginRef.current
    pointerOriginRef.current = undefined
    return origin
  }

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement

    if (target.closest(".item-checkbox")) {
      return
    }

    onUpdateChecked(item.id, !checked, consumePressOrigin())
  }

  return (
    <Card
      className={`item-card${checked ? " checked" : ""}`}
      data-checklist-item-id={item.id}
      onClick={handleCardClick}
      onPointerDownCapture={rememberPressOrigin}
      variant="secondary"
    >
      <Card.Content className="item-card-content">
        <Checkbox
          className="item-checkbox"
          id={inputId}
          isSelected={checked}
          onChange={(isSelected) => onUpdateChecked(item.id, isSelected, consumePressOrigin())}
          variant="secondary"
        >
          <Checkbox.Control className="item-checkbox-control">
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content className="item-body">
            <div className="item-topline">
              <div className="item-main-meta">
                <Label className="item-label" htmlFor={inputId}>
                  {item.label}
                </Label>
                <Chip
                  className="item-tag"
                  color={getItemChipColor(item.kind)}
                  size="sm"
                  variant="soft"
                >
                  {getItemKindLabel(item.kind)}
                </Chip>
              </div>
              <div className="item-side-meta">
                {item.source === "custom" ? (
                  <>
                    <span className="item-source-indicator">Added by you</span>
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
                  </>
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
