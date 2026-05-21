import { Button, ButtonGroup, Card, Label, ProgressBar } from "@heroui/react";
import { ChevronsUpDown, RotateCcw } from "lucide-react";
import { FILTERS } from "@/constants/filters";
import type { ChecklistFilter } from "@/types/checklist";

interface ChecklistToolbarProps {
  checked: number;
  total: number;
  percent: number;
  filter: ChecklistFilter;
  hasVisibleOpenSection: boolean;
  onFilterChange: (value: ChecklistFilter) => void;
  onToggleAllSections: () => void;
  onResetChecks: () => void;
}

export function ChecklistToolbar({
  checked,
  total,
  percent,
  filter,
  hasVisibleOpenSection,
  onFilterChange,
  onToggleAllSections,
  onResetChecks,
}: ChecklistToolbarProps) {
  return (
    <div className="sticky-bar">
      <div className="page-shell sticky-inner">
        <Card className="toolbar-card" variant="secondary">
          <Card.Content className="toolbar-content">
            <div className="progress-heading">
              <div className="progress-summary">
                <Label>Packing progress</Label>
                <p className="progress-copy">
                  {checked} of {total} packed
                </p>
              </div>
              <div className="progress-percent">{percent}%</div>
            </div>

            <ProgressBar
              aria-label="Checklist progress"
              className="progress-panel"
              color="success"
              value={percent}
            >
              <ProgressBar.Track className="progress-track">
                <ProgressBar.Fill className="progress-fill" />
              </ProgressBar.Track>
            </ProgressBar>

            <div className="toolbar-actions">
              <ButtonGroup className="filter-group" size="sm" variant="secondary">
                {FILTERS.map((item) => (
                  <Button
                    className={filter === item.value ? "filter-button-active" : undefined}
                    key={item.value}
                    onPress={() => onFilterChange(item.value)}
                    variant={filter === item.value ? "primary" : "secondary"}
                  >
                    {item.label}
                  </Button>
                ))}
              </ButtonGroup>

              <div className="toolbar-cta-group">
                <Button onPress={onToggleAllSections} size="sm" variant="outline">
                  <ChevronsUpDown aria-hidden="true" size={15} strokeWidth={2.1} />
                  {hasVisibleOpenSection ? "Collapse all" : "Expand all"}
                </Button>
                <Button onPress={onResetChecks} size="sm" variant="ghost">
                  <RotateCcw aria-hidden="true" size={15} strokeWidth={2.1} />
                  Reset checks
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
