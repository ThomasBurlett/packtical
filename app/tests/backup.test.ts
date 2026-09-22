import { test } from "node:test";
import assert from "node:assert/strict";
import { parseBackup, backupCount, type Backup } from "../src/domain/backup";
import { backupWrites, exportBackup, restoreBackup } from "../src/data/backup";
import type { Driver, RecordData } from "../src/data/port";

const fixture = (): Backup => ({
  format: "packbee-customizations",
  version: 1,
  createdAt: "2026-09-22T00:00:00Z",
  checklists: [
    {
      slug: "camping",
      sections: {
        "custom-section": { title: "Essentials", custom: true, order: 99 },
      },
      items: {
        "campsite--tent": { label: "Our tent", hidden: true, order: 200 },
        "custom-item": {
          label: "Travel mug",
          sectionId: "custom-section",
          custom: true,
          note: "Blue",
          kind: "optional",
          order: 100,
        },
      },
    },
  ],
});

test("backup round-trip preserves edits, hidden state, ordering, and personal sections", () => {
  const value = fixture();
  assert.deepEqual(parseBackup(JSON.stringify(value)), value);
  assert.equal(backupCount(value), 3);
  const writes = backupWrites(value, "current-user");
  assert.ok(
    writes.every((w) =>
      w.path.startsWith("users/current-user/checklists/camping/"),
    ),
  );
  assert.ok(writes.every((w) => !w.path.includes("cycles")));
});

test("backup rejects unsafe paths, unknown versions, dangling sections, and invalid fields before writes", () => {
  const cases = [
    (b: Backup) => {
      b.version = 2 as 1;
    },
    (b: Backup) => {
      b.checklists[0].slug = "../someone";
    },
    (b: Backup) => {
      b.checklists[0].items["../item"] = { label: "bad" };
    },
    (b: Backup) => {
      b.checklists[0].items["custom-item"].sectionId = "missing";
    },
    (b: Backup) => {
      b.checklists[0].items["custom-item"].label = "x".repeat(501);
    },
    (b: Backup) => {
      Object.assign(b.checklists[0].items["custom-item"], { status: "packed" });
    },
    (b: Backup) => {
      b.checklists.push(b.checklists[0]);
    },
  ];
  for (const mutate of cases) {
    const value = fixture();
    mutate(value);
    assert.throws(() => backupWrites(value, "owner"));
  }
});

test("repeated restores are idempotent and retain unrelated additions and packing progress", async () => {
  const records: Record<string, RecordData> = {
    "users/owner/checklists/camping/items/unrelated": { label: "Keep me" },
    "users/owner/checklists/camping/cycles/current/states/campsite--tent": {
      status: "packed",
    },
  };
  const driver = {
    write: async (writes) => {
      for (const w of writes)
        records[w.path] = { ...records[w.path], ...w.data };
    },
  } as Driver;
  await restoreBackup(driver, "owner", fixture());
  const first = JSON.stringify(records);
  await restoreBackup(driver, "owner", fixture());
  assert.equal(JSON.stringify(records), first);
  assert.equal(Object.keys(records).length, 5);
  assert.equal(
    records[
      "users/owner/checklists/camping/cycles/current/states/campsite--tent"
    ].status,
    "packed",
  );
});

test("export waits for synchronized data and releases all subscriptions", async () => {
  let stopped = 0;
  const driver = {
    preview: false,
    auth: () => () => {},
    signIn: async () => {},
    signOut: async () => {},
    write: async () => {},
    watch: (_path, _list, next) => {
      next([{ id: "invalid-cached-record", data: {} }], {
        cached: true,
        pending: false,
      });
      queueMicrotask(() => next([], { cached: false, pending: false }));
      return () => {
        stopped++;
      };
    },
  } as Driver;
  const backup = await exportBackup(driver, "owner");
  assert.equal(backup.checklists.length, 11);
  assert.equal(backupCount(backup), 0);
  assert.equal(stopped, 22);
});

test("export includes effective defaults so restoring a renamed item also restores its saved visibility", async () => {
  const driver: Driver = {
    preview: true,
    auth: () => () => {},
    signIn: async () => {},
    signOut: async () => {},
    write: async () => {},
    watch(path, _list, next) {
      next(
        path.endsWith("/camping/items")
          ? [{ id: "campsite--tent", data: { label: "Our tent" } }]
          : [],
        { cached: false, pending: false },
      );
      return () => {};
    },
  };
  const backup = await exportBackup(driver, "owner");
  const saved = backup.checklists.find((c) => c.slug === "camping")!.items[
    "campsite--tent"
  ];
  assert.equal(saved.label, "Our tent");
  assert.equal(saved.hidden, false);
  assert.equal(saved.kind, "core");
  assert.equal(saved.sectionId, "campsite");
  assert.equal(parseBackup(JSON.stringify(backup)).checklists.length, 11);
});
