import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/auth/auth-context";
import { buildCustomItemId, cloneSections, itemMatchesFilter } from "@/lib/checklist-items";
import {
  createPersistedChecklistState,
  getEmptyChecklistState,
  normalizePersistedChecklistState,
} from "@/lib/checklist-state";
import {
  loadRemoteChecklistState,
  saveRemoteChecklistState,
} from "@/lib/remote-checklist-storage";
import type {
  Checklist,
  ChecklistFilter,
  ChecklistItem,
  ChecklistKind,
  ChecklistSyncStatus,
  ChecklistSectionState,
} from "@/types/checklist";

type DraftState = {
  kind: Exclude<ChecklistKind, "custom">;
  label: string;
  editingItemId?: string;
};

type DraftMap = Record<string, DraftState>;
type CustomItemMap = Record<string, ChecklistItem[]>;

export function useChecklistState(checklist: Checklist) {
  const { syncVersion, user } = useAuth();
  const baseSections = useMemo(() => cloneSections(checklist.sections), [checklist.sections]);
  const sectionIds = useMemo(() => baseSections.map((section) => section.id), [baseSections]);
  const defaultCollapsedSections = useMemo(
    () => new Set(sectionIds.slice(1)),
    [sectionIds],
  );
  const emptyState = useMemo(() => getEmptyChecklistState(), []);

  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => new Set(emptyState.checkedIds));
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => new Set(defaultCollapsedSections),
  );
  const [customItems, setCustomItems] = useState<CustomItemMap>(() => emptyState.customItems);
  const [filter, setFilter] = useState<ChecklistFilter>("all");
  const [drafts, setDrafts] = useState<DraftMap>({});
  const [openForms, setOpenForms] = useState<Set<string>>(() => new Set());
  const [syncStatus, setSyncStatus] = useState<ChecklistSyncStatus>("loading");
  const [remoteReadyUserId, setRemoteReadyUserId] = useState<string | null>(null);

  const persistedState = useMemo(
    () => createPersistedChecklistState(checkedIds, collapsedSections, customItems),
    [checkedIds, collapsedSections, customItems],
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [checklist.slug]);

  useEffect(() => {
    let isCancelled = false;

    if (!user) {
      window.queueMicrotask(() => {
        if (isCancelled) return;
        setRemoteReadyUserId(null);
        setCheckedIds(new Set());
        setCollapsedSections(new Set(defaultCollapsedSections));
        setCustomItems({});
        setSyncStatus("loading");
      });
      return;
    }

    window.queueMicrotask(() => {
      if (isCancelled) return;
      setRemoteReadyUserId(null);
      setSyncStatus("loading");
    });

    loadRemoteChecklistState(checklist.slug)
      .then((remoteState) => {
        if (isCancelled) return;

        const normalizedState = normalizePersistedChecklistState(remoteState, sectionIds);
        setCheckedIds(new Set(normalizedState.checkedIds));
        setCollapsedSections(
          normalizedState.collapsedSections.length > 0
            ? new Set(normalizedState.collapsedSections)
            : new Set(defaultCollapsedSections),
        );
        setCustomItems(normalizedState.customItems);

        setRemoteReadyUserId(user.id);
        setSyncStatus("synced");
      })
      .catch(() => {
        if (isCancelled) return;
        setSyncStatus("error");
      });

    return () => {
      isCancelled = true;
    };
  }, [checklist.slug, defaultCollapsedSections, sectionIds, syncVersion, user]);

  useEffect(() => {
    if (!user || remoteReadyUserId !== user.id) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSyncStatus("saving");
      saveRemoteChecklistState(user.id, checklist.slug, persistedState)
        .then(() => setSyncStatus("synced"))
        .catch(() => setSyncStatus("error"));
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [checklist.slug, persistedState, remoteReadyUserId, user]);

  const sections = useMemo<ChecklistSectionState[]>(
    () =>
      baseSections.map((section) => {
        const items = [...section.items, ...(customItems[section.id] ?? [])];
        const visibleItems = items.filter((item) => itemMatchesFilter(item, filter, checkedIds));
        const checkedCount = items.filter((item) => checkedIds.has(item.id)).length;

        return {
          ...section,
          items,
          visibleItems,
          checkedCount,
          isCollapsed: collapsedSections.has(section.id),
        };
      }),
    [baseSections, checkedIds, collapsedSections, customItems, filter],
  );

  const totals = useMemo(() => {
    const items = sections.flatMap((section) => section.items);
    const total = items.length;
    const checked = items.filter((item) => checkedIds.has(item.id)).length;
    const percent = total ? Math.round((checked / total) * 100) : 0;

    return { total, checked, percent };
  }, [checkedIds, sections]);

  const hasVisibleOpenSection = sections.some(
    (section) => section.visibleItems.length > 0 && !section.isCollapsed,
  );

  const actions = {
    setFilter: (value: ChecklistFilter) => {
      setFilter(value);
    },
    updateChecked: (itemId: string, nextChecked: boolean) => {
      setCheckedIds((current) => {
        const next = new Set(current);
        if (nextChecked) next.add(itemId);
        else next.delete(itemId);
        return next;
      });
    },
    resetChecks: () => {
      setCheckedIds(new Set());
      setCollapsedSections(new Set(defaultCollapsedSections));
      setCustomItems({});
      setFilter("all");
      setDrafts({});
      setOpenForms(new Set());
    },
    toggleSection: (sectionId: string) => {
      setCollapsedSections((current) => {
        const next = new Set(current);
        if (next.has(sectionId)) next.delete(sectionId);
        else next.add(sectionId);
        return next;
      });
    },
    setSectionCollapsed: (sectionId: string, isCollapsed: boolean) => {
      setCollapsedSections((current) => {
        const next = new Set(current);
        if (isCollapsed) next.add(sectionId);
        else next.delete(sectionId);
        return next;
      });
    },
    toggleAllSections: () => {
      setCollapsedSections((current) => {
        const visibleSectionIds = sections
          .filter((section) => section.visibleItems.length > 0)
          .map((section) => section.id);

        const hasOpenVisibleSection = visibleSectionIds.some((sectionId) => !current.has(sectionId));

        if (hasOpenVisibleSection) {
          return new Set(visibleSectionIds);
        }

        return new Set();
      });
    },
    setSectionChecked: (sectionId: string, nextChecked: boolean) => {
      const items = sections.find((section) => section.id === sectionId)?.items ?? [];
      setCheckedIds((current) => {
        const next = new Set(current);
        for (const item of items) {
          if (nextChecked) next.add(item.id);
          else next.delete(item.id);
        }
        return next;
      });
    },
    setAddFormOpen: (sectionId: string, isOpen: boolean) => {
      setOpenForms((current) => {
        const next = new Set(current);
        if (isOpen) next.add(sectionId);
        else next.delete(sectionId);
        return next;
      });
    },
    toggleAddForm: (sectionId: string) => {
      setOpenForms((current) => {
        const next = new Set(current);
        if (next.has(sectionId)) next.delete(sectionId);
        else next.add(sectionId);
        return next;
      });
    },
    setDraft: (sectionId: string, value: string) => {
      setDrafts((current) => ({
        ...current,
        [sectionId]: {
          kind: current[sectionId]?.kind ?? "core",
          label: value,
        },
      }));
    },
    setDraftKind: (sectionId: string, kind: Exclude<ChecklistKind, "custom">) => {
      setDrafts((current) => ({
        ...current,
        [sectionId]: {
          kind,
          label: current[sectionId]?.label ?? "",
        },
      }));
    },
    saveCustomItem: (sectionId: string) => {
      const label = drafts[sectionId]?.label.trim();
      if (!label) return;
      const editingItemId = drafts[sectionId]?.editingItemId;

      setCustomItems((current) => ({
        ...current,
        [sectionId]: editingItemId
          ? (current[sectionId] ?? []).map((item) =>
              item.id === editingItemId
                ? {
                    ...item,
                    label,
                    kind: drafts[sectionId]?.kind ?? "core",
                  }
                : item,
            )
          : [
              ...(current[sectionId] ?? []),
              {
                id: buildCustomItemId(sectionId),
                label,
                kind: drafts[sectionId]?.kind ?? "core",
                note: "",
                source: "custom",
              },
            ],
      }));

      setDrafts((current) => ({
        ...current,
        [sectionId]: {
          kind: "core",
          label: "",
          editingItemId: undefined,
        },
      }));
      setOpenForms((current) => {
        const next = new Set(current);
        next.delete(sectionId);
        return next;
      });
    },
    editCustomItem: (sectionId: string, itemId: string) => {
      const item = (customItems[sectionId] ?? []).find((entry) => entry.id === itemId);
      if (!item) return;

      setDrafts((current) => ({
        ...current,
        [sectionId]: {
          kind: item.kind === "optional" ? "optional" : "core",
          label: item.label,
          editingItemId: item.id,
        },
      }));

      setOpenForms((current) => {
        const next = new Set(current);
        next.add(sectionId);
        return next;
      });
    },
    deleteCustomItem: (sectionId: string, itemId: string) => {
      setCustomItems((current) => ({
        ...current,
        [sectionId]: (current[sectionId] ?? []).filter((item) => item.id !== itemId),
      }));

      setDrafts((current) => {
        if (current[sectionId]?.editingItemId !== itemId) {
          return current;
        }

        return {
          ...current,
          [sectionId]: {
            kind: "core",
            label: "",
            editingItemId: undefined,
          },
        };
      });

      setCheckedIds((current) => {
        const next = new Set(current);
        next.delete(itemId);
        return next;
      });
    },
  };

  return {
    sections,
    totals,
    filter,
    drafts,
    openForms,
    checkedIds,
    syncStatus,
    hasVisibleOpenSection,
    actions,
  };
}
