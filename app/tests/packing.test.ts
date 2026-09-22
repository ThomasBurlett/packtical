import { test } from "node:test";
import assert from "node:assert/strict";
import { CHECKLISTS } from "../src/domain/catalogue";
import {
  emptySnapshot,
  materialize,
  progress,
  importLegacy,
} from "../src/domain/packing";

test("catalogue has all eleven activities with unique stable item keys and valid links", () => {
  assert.equal(CHECKLISTS.length, 11);
  for (const checklist of CHECKLISTS) {
    const sections = materialize(checklist.slug, emptySnapshot());
    const items = sections.flatMap((section) => section.items);
    assert.equal(
      items.length,
      checklist.sections.reduce(
        (count, section) => count + section.items.length,
        0,
      ),
    );
    assert.equal(new Set(items.map((item) => item.id)).size, items.length);
    for (const item of items)
      if (item.relatedChecklistSlug)
        assert.ok(
          CHECKLISTS.some((list) => list.slug === item.relatedChecklistSlug),
        );
  }
});
test("hidden and skipped items are distinct and do not inflate remaining work", () => {
  const snapshot = emptySnapshot();
  const items = materialize("camping", snapshot)[0].items.slice(0, 4);
  items[3].hidden = true;
  assert.deepEqual(
    progress(items, {
      [items[0].id]: { status: "packed" },
      [items[1].id]: { status: "skipped" },
    }),
    { packed: 1, skipped: 1, total: 2, remaining: 1, fraction: 0.5 },
  );
});
test("custom content and built-in edits materialize without changing catalogue", () => {
  const snapshot = emptySnapshot();
  snapshot.items["campsite--tent"] = { label: "Our tent", hidden: true };
  snapshot.sections["custom-section"] = {
    custom: true,
    title: "My essentials",
    order: -1,
  };
  snapshot.items.custom1 = {
    custom: true,
    sectionId: "custom-section",
    label: "Test item",
    kind: "optional",
  };
  const sections = materialize("camping", snapshot);
  assert.equal(sections[0].items[0].label, "Test item");
  assert.equal(
    sections.flatMap((s) => s.items).find((i) => i.id === "campsite--tent")
      ?.hidden,
    true,
  );
  assert.equal(
    materialize("camping", emptySnapshot())[0].items[0].label,
    "Tent with footprint and stakes",
  );
});
test("migration preserves optional items with stable IDs and ignores old checkmarks", () => {
  const rows = [
    {
      checklist_slug: "camping",
      state: {
        checkedIds: ["tent"],
        customItems: {
          campsite: [{ id: "mine", label: "Sample item", kind: "optional" }],
        },
      },
    },
  ];
  const imported = importLegacy(rows);
  assert.equal(imported.length, 1);
  assert.equal(imported[0].item.kind, "optional");
  assert.equal(imported[0].id, importLegacy(rows)[0].id);
  assert.equal("checkedIds" in imported[0].item, false);
  assert.throws(() => importLegacy([{ checklist_slug: "missing", state: {} }]));
  assert.throws(() =>
    importLegacy([
      { checklist_slug: "camping", state: { customItems: { missing: [] } } },
    ]),
  );
});
