import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Eye,
  EyeOff,
  ListFilter,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SkipForward,
  Trash2,
} from "lucide-react-native";
import { randomUUID } from "expo-crypto";
import { CHECKLIST_MAP } from "@/domain/catalogue";
import {
  materialize,
  progress,
  type Item,
  type ItemState,
  type Section,
} from "@/domain/packing";
import type { Driver } from "@/data/port";
import { useChecklist } from "@/data/use-checklist";
import { Button, colors, Field, IconButton, Sheet, styles } from "./kit";

type Filter = "all" | "remaining" | "core" | "optional" | "skipped" | "hidden";
type Editor =
  { type: "item"; item: Item } | { type: "section"; section: Section };
export function ChecklistScreen({
  driver,
  uid,
  slug,
  back,
  open,
  fail,
}: {
  driver: Driver;
  uid: string;
  slug: string;
  back: () => void;
  open: (slug: string) => void;
  fail: (error: Error) => void;
}) {
  const list = CHECKLIST_MAP[slug];
  const data = useChecklist(driver, uid, slug, fail);
  const sections = useMemo(
    () => materialize(slug, data.snapshot),
    [slug, data.snapshot],
  );
  const counts = progress(
    sections.flatMap((section) => section.items),
    data.snapshot.states,
  );
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [menu, setMenu] = useState(false);
  const [confirm, setConfirm] = useState<"reset" | "restore" | null>(null);
  const [undo, setUndo] = useState<{
    cycle: string;
    states: Record<string, ItemState>;
  } | null>(null);
  useEffect(() => {
    if (!undo) return;
    const timer = setTimeout(() => setUndo(null), 15000);
    return () => clearTimeout(timer);
  }, [undo]);
  const toggleSection = (id: string) =>
    setCollapsed((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const matches = (item: Item) =>
    (filter === "hidden" ? item.hidden : !item.hidden) &&
    (filter !== "remaining" ||
      !["packed", "skipped"].includes(data.snapshot.states[item.id]?.status)) &&
    (filter !== "skipped" ||
      data.snapshot.states[item.id]?.status === "skipped") &&
    (!["core", "optional"].includes(filter) || item.kind === filter) &&
    `${item.label} ${item.note}`.toLowerCase().includes(query.toLowerCase());
  const move = (
    ids: { id: string }[],
    index: number,
    delta: number,
    kind: "items" | "sections",
  ) => {
    const next = [...ids];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    data.reorder(next, kind);
  };
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 24, paddingBottom: 44, gap: 22 }}
      >
        <View style={[styles.row, { justifyContent: "space-between" }]}>
          <Button
            label="All checklists"
            icon={ArrowLeft}
            tone="quiet"
            onPress={back}
          />
          <IconButton
            label="Checklist options"
            icon={MoreHorizontal}
            onPress={() => setMenu(true)}
          />
        </View>
        <View style={{ gap: 10 }}>
          <Text style={styles.eyebrow}>
            {list.category} / Your packing space
          </Text>
          <Text accessibilityRole="header" style={styles.title}>
            {list.label}
          </Text>
          <Text style={styles.muted}>{list.summary}</Text>
        </View>
        <View
          style={{
            backgroundColor: colors.green,
            padding: 20,
            borderRadius: 20,
            gap: 13,
          }}
        >
          <View style={[styles.row, { justifyContent: "space-between" }]}>
            <Text
              style={{ color: colors.paper, fontSize: 16, fontWeight: "600" }}
            >
              {counts.remaining === 0
                ? "You’re ready to go."
                : "A little closer to ready."}
            </Text>
            <Text
              accessibilityLabel="Packing progress"
              style={{
                color: colors.cream,
                fontWeight: "700",
                fontVariant: ["tabular-nums"],
              }}
            >
              {counts.packed} / {counts.total}
            </Text>
          </View>
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: counts.total,
              now: counts.packed,
            }}
            style={{ height: 6, backgroundColor: "#ffffff30", borderRadius: 3 }}
          >
            <View
              style={{
                height: 6,
                width: `${counts.fraction * 100}%`,
                backgroundColor: colors.gold,
                borderRadius: 3,
              }}
            />
          </View>
          <Text style={{ color: "#E4EBD8", fontSize: 12 }}>
            {counts.remaining} remaining
            {counts.skipped ? ` · ${counts.skipped} skipped this time` : ""} ·{" "}
            {driver.preview
              ? "Local preview"
              : data.pending
                ? "Changes waiting to sync"
                : data.cached
                  ? "Offline-ready · showing saved data"
                  : "Synced"}
          </Text>
        </View>
        <View style={[styles.row, styles.input]}>
          <Search size={18} color={colors.muted} />
          <TextInput
            accessibilityLabel="Search items"
            placeholder="Find an item…"
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            style={{ flex: 1, fontSize: 16, color: colors.ink, minHeight: 24 }}
          />
          <IconButton
            label={editing ? "Finish editing" : "Customize checklist"}
            icon={editing ? Check : Pencil}
            onPress={() => setEditing(!editing)}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          <ListFilter
            size={18}
            color={colors.muted}
            style={{ marginTop: 12, marginRight: 4 }}
          />
          {(
            [
              "all",
              "remaining",
              "core",
              "optional",
              "skipped",
              "hidden",
            ] as Filter[]
          ).map((value) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{ selected: value === filter }}
              onPress={() => setFilter(value)}
              style={{
                minHeight: 44,
                paddingHorizontal: 16,
                justifyContent: "center",
                borderRadius: 22,
                backgroundColor: filter === value ? colors.ink : colors.paper,
                borderWidth: 1,
                borderColor: filter === value ? colors.ink : colors.line,
              }}
            >
              <Text
                style={{
                  fontWeight: "600",
                  color: filter === value ? colors.paper : colors.muted,
                }}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        {editing && (
          <Text style={styles.muted}>
            Make this checklist yours. Edit items and sections, or use the
            arrows to reorder. Your changes stay when you reset.
          </Text>
        )}
        {!data.ready ? (
          <ActivityIndicator
            color={colors.green}
            accessibilityLabel="Loading checklist"
          />
        ) : (
          sections.map((section, sectionIndex) => {
            const visible = section.items.filter(matches);
            if (!visible.length && !editing) return null;
            const sectionProgress = progress(
              section.items,
              data.snapshot.states,
            );
            return (
              <View key={section.id} style={{ gap: 8 }}>
                <View style={[styles.row, { flexWrap: "wrap" }]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{
                      expanded: !collapsed.has(section.id),
                    }}
                    accessibilityLabel={`${section.title} section`}
                    onPress={() => toggleSection(section.id)}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      minHeight: 48,
                      gap: 8,
                    }}
                  >
                    {collapsed.has(section.id) ? (
                      <ChevronRight size={17} color={colors.muted} />
                    ) : (
                      <ChevronDown size={17} color={colors.muted} />
                    )}
                    <Text style={[styles.heading, { fontSize: 18, flex: 1 }]}>
                      {section.title}
                    </Text>
                    <Text style={styles.muted}>
                      {sectionProgress.packed}/{sectionProgress.total}
                    </Text>
                  </Pressable>
                  {editing && (
                    <View style={styles.row}>
                      <IconButton
                        label={`Edit ${section.title} section`}
                        icon={Pencil}
                        onPress={() => setEditor({ type: "section", section })}
                      />
                      <IconButton
                        label={`Move ${section.title} section up`}
                        icon={ArrowUp}
                        disabled={sectionIndex === 0}
                        onPress={() =>
                          move(sections, sectionIndex, -1, "sections")
                        }
                      />
                      <IconButton
                        label={`Move ${section.title} section down`}
                        icon={ArrowDown}
                        disabled={sectionIndex === sections.length - 1}
                        onPress={() =>
                          move(sections, sectionIndex, 1, "sections")
                        }
                      />
                    </View>
                  )}
                </View>
                {!collapsed.has(section.id) && (
                  <View
                    style={{
                      borderRadius: 16,
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: colors.line,
                      backgroundColor: colors.paper,
                    }}
                  >
                    {visible.map((item) => {
                      const status =
                        data.snapshot.states[item.id]?.status || "unpacked";
                      const index = section.items.findIndex(
                        (value) => value.id === item.id,
                      );
                      return (
                        <View
                          key={item.id}
                          style={{
                            borderBottomWidth: 1,
                            borderBottomColor: colors.line,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            backgroundColor:
                              status === "packed" ? "#F2F4EB" : colors.paper,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Pressable
                              accessibilityRole="checkbox"
                              accessibilityState={{
                                checked: status === "packed",
                              }}
                              accessibilityLabel={item.label}
                              onPress={() => {
                                setUndo(null);
                                data.status(
                                  item.id,
                                  status === "packed" ? "unpacked" : "packed",
                                );
                              }}
                              style={{
                                flex: 1,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 13,
                                minHeight: 52,
                                paddingVertical: 7,
                              }}
                            >
                              <View
                                style={{
                                  width: 25,
                                  height: 25,
                                  borderRadius: 8,
                                  borderWidth: status === "packed" ? 0 : 1.5,
                                  borderColor: colors.sage,
                                  backgroundColor:
                                    status === "packed"
                                      ? colors.green
                                      : "transparent",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {status === "packed" ? (
                                  <Check size={17} color={colors.paper} />
                                ) : status === "skipped" ? (
                                  <SkipForward size={15} color={colors.muted} />
                                ) : null}
                              </View>
                              <View style={{ flex: 1, gap: 4 }}>
                                <Text
                                  style={{
                                    fontSize: 16,
                                    lineHeight: 22,
                                    color:
                                      status === "unpacked"
                                        ? colors.ink
                                        : colors.muted,
                                    textDecorationLine:
                                      status === "packed"
                                        ? "line-through"
                                        : "none",
                                  }}
                                >
                                  {item.label}
                                </Text>
                                {(item.kind === "optional" ||
                                  item.custom ||
                                  status === "skipped") && (
                                  <Text
                                    style={{
                                      fontSize: 11,
                                      color: colors.muted,
                                    }}
                                  >
                                    {[
                                      item.custom ? "Added by you" : "",
                                      item.kind === "optional"
                                        ? "Optional"
                                        : "",
                                      status === "skipped"
                                        ? "Skipped this time"
                                        : "",
                                    ]
                                      .filter(Boolean)
                                      .join(" · ")}
                                  </Text>
                                )}
                                {!!item.note && (
                                  <Text
                                    style={[styles.muted, { fontSize: 12 }]}
                                  >
                                    {item.note}
                                  </Text>
                                )}
                              </View>
                            </Pressable>
                            <IconButton
                              label={
                                editing
                                  ? `Edit ${item.label}`
                                  : status === "skipped"
                                    ? `Include ${item.label}`
                                    : `Skip ${item.label}`
                              }
                              icon={
                                editing
                                  ? Pencil
                                  : status === "skipped"
                                    ? RotateCcw
                                    : SkipForward
                              }
                              onPress={() => {
                                if (editing) setEditor({ type: "item", item });
                                else {
                                  setUndo(null);
                                  data.status(
                                    item.id,
                                    status === "skipped"
                                      ? "unpacked"
                                      : "skipped",
                                  );
                                }
                              }}
                            />
                          </View>
                          {item.relatedChecklistSlug &&
                            CHECKLIST_MAP[item.relatedChecklistSlug] && (
                              <Button
                                label={`Open ${CHECKLIST_MAP[item.relatedChecklistSlug].label}`}
                                tone="quiet"
                                icon={ChevronRight}
                                onPress={() => open(item.relatedChecklistSlug!)}
                              />
                            )}
                          {editing && (
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "flex-end",
                              }}
                            >
                              <IconButton
                                label={`${item.hidden ? "Show" : "Hide"} ${item.label}`}
                                icon={item.hidden ? Eye : EyeOff}
                                onPress={() =>
                                  data.item(item.id, { hidden: !item.hidden })
                                }
                              />
                              <IconButton
                                label={`Move ${item.label} up`}
                                icon={ArrowUp}
                                disabled={index === 0}
                                onPress={() =>
                                  move(section.items, index, -1, "items")
                                }
                              />
                              <IconButton
                                label={`Move ${item.label} down`}
                                icon={ArrowDown}
                                disabled={index === section.items.length - 1}
                                onPress={() =>
                                  move(section.items, index, 1, "items")
                                }
                              />
                            </View>
                          )}
                        </View>
                      );
                    })}
                    <Button
                      label={`Add item to ${section.title}`}
                      icon={Plus}
                      tone="quiet"
                      onPress={() =>
                        setEditor({
                          type: "item",
                          item: {
                            id: `custom-${randomUUID()}`,
                            sectionId: section.id,
                            label: "",
                            kind: "core",
                            note: "",
                            order:
                              Math.max(
                                0,
                                ...section.items.map((item) => item.order),
                              ) + 100,
                            custom: true,
                            hidden: false,
                          },
                        })
                      }
                    />
                  </View>
                )}
              </View>
            );
          })
        )}
        {data.ready &&
          !sections.some((section) => section.items.some(matches)) &&
          !editing && (
            <View style={styles.panel}>
              <CircleHelp size={24} color={colors.sage} />
              <Text style={styles.heading}>
                {filter === "remaining"
                  ? "Nothing left to pack."
                  : "No matching items."}
              </Text>
              <Text style={styles.muted}>
                Change the filter or search to see more of your checklist.
              </Text>
              <Button
                label="Show all items"
                tone="secondary"
                onPress={() => {
                  setFilter("all");
                  setQuery("");
                }}
              />
            </View>
          )}
        {editing && (
          <Button
            label="Add section"
            tone="secondary"
            icon={Plus}
            onPress={() =>
              setEditor({
                type: "section",
                section: {
                  id: `custom-${randomUUID()}`,
                  title: "",
                  order:
                    Math.max(0, ...sections.map((section) => section.order)) +
                    100,
                  custom: true,
                },
              })
            }
          />
        )}
      </ScrollView>
      {undo && (
        <View
          accessibilityLiveRegion="polite"
          style={{
            position: "absolute",
            bottom: 12,
            left: 20,
            right: 20,
            borderRadius: 14,
            padding: 12,
            backgroundColor: colors.ink,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: colors.paper }}>Checklist reset</Text>
          <Button
            label="Undo"
            disabled={data.snapshot.cycle !== undo.cycle}
            onPress={() => {
              data.reset(undo.states);
              setUndo(null);
            }}
          />
        </View>
      )}
      {menu && (
        <Sheet title="Your checklist" close={() => setMenu(false)}>
          <Button
            label={editing ? "Finish customizing" : "Customize checklist"}
            icon={Pencil}
            tone="secondary"
            onPress={() => {
              setEditing(!editing);
              setMenu(false);
            }}
          />
          <Button
            label="Reset packing progress"
            icon={RotateCcw}
            tone="secondary"
            onPress={() => {
              setConfirm("reset");
              setMenu(false);
            }}
          />
          <Button
            label="Restore defaults"
            tone="quiet"
            onPress={() => {
              setConfirm("restore");
              setMenu(false);
            }}
          />
        </Sheet>
      )}
      {confirm && (
        <Sheet
          title={
            confirm === "reset"
              ? "Ready for a fresh start?"
              : "Restore the original checklist?"
          }
          close={() => setConfirm(null)}
        >
          <Text style={styles.body}>
            {confirm === "reset"
              ? "Clear checkmarks and skipped items. Your custom items, edits, and hidden items will stay."
              : "Restore built-in items, section names, and their original order. Your added items and sections will stay."}
          </Text>
          <Button
            label={confirm === "reset" ? "Reset checklist" : "Restore defaults"}
            onPress={() => {
              if (confirm === "reset") {
                const states = data.snapshot.states;
                const cycle = data.reset();
                setUndo({ states, cycle });
              } else data.restore();
              setConfirm(null);
            }}
          />
          <Button
            label="Keep as is"
            tone="quiet"
            onPress={() => setConfirm(null)}
          />
        </Sheet>
      )}
      {editor && (
        <EditSheet
          key={editor.type === "item" ? editor.item.id : editor.section.id}
          editor={editor}
          close={() => setEditor(null)}
          save={(label, note, kind) => {
            if (editor.type === "item") {
              const { id, ...item } = editor.item;
              data.item(id, { ...item, label, note, kind });
            } else {
              const { id, ...section } = editor.section;
              data.section(id, { ...section, title: label });
            }
            setEditor(null);
          }}
          remove={
            editor.type === "item" &&
            editor.item.custom &&
            !!data.snapshot.items[editor.item.id]
              ? () => {
                  data.removeItem(editor.item.id);
                  setEditor(null);
                }
              : undefined
          }
        />
      )}
    </View>
  );
}

function EditSheet({
  editor,
  close,
  save,
  remove,
}: {
  editor: Editor;
  close: () => void;
  save: (label: string, note: string, kind: "core" | "optional") => void;
  remove?: () => void;
}) {
  const [label, setLabel] = useState(
    editor.type === "item" ? editor.item.label : editor.section.title,
  );
  const [note, setNote] = useState(
    editor.type === "item" ? editor.item.note : "",
  );
  const [kind, setKind] = useState<"core" | "optional">(
    editor.type === "item" ? editor.item.kind : "core",
  );
  const [deleting, setDeleting] = useState(false);
  return (
    <Sheet
      title={
        editor.type === "item"
          ? editor.item.label
            ? "Edit item"
            : "Add an item"
          : editor.section.title
            ? "Edit section"
            : "Add a section"
      }
      close={close}
    >
      <Field
        label={editor.type === "item" ? "Item name" : "Section name"}
        value={label}
        onChangeText={setLabel}
        autoFocus
        maxLength={500}
      />
      {editor.type === "item" && (
        <>
          <Field
            label="Note"
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={2000}
          />
          <View style={styles.row}>
            <Button
              label="Core"
              tone={kind === "core" ? "primary" : "secondary"}
              onPress={() => setKind("core")}
            />
            <Button
              label="Optional"
              tone={kind === "optional" ? "primary" : "secondary"}
              onPress={() => setKind("optional")}
            />
          </View>
        </>
      )}
      <Button
        label="Save changes"
        disabled={!label.trim()}
        onPress={() => save(label.trim(), note.trim(), kind)}
      />
      {remove && (
        <Button
          label={
            deleting ? "Confirm delete personal item" : "Delete personal item"
          }
          tone="danger"
          icon={Trash2}
          onPress={() => (deleting ? remove() : setDeleting(true))}
        />
      )}
    </Sheet>
  );
}
