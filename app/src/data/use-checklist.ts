import { useEffect, useState } from "react";
import { randomUUID } from "expo-crypto";
import {
  emptySnapshot,
  type Snapshot,
  type Item,
  type Section,
  type PackingStatus,
  type ItemState,
} from "@/domain/packing";
import type { Driver, Meta, Write } from "./port";

export function useChecklist(
  driver: Driver,
  uid: string,
  slug: string,
  fail: (error: Error) => void,
) {
  const root = `users/${uid}/checklists/${slug}`;
  const [snapshot, setSnapshot] = useState<Snapshot>(emptySnapshot);
  const [meta, setMeta] = useState<Record<string, Meta>>({});
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    setSnapshot(emptySnapshot());
    setMeta({});
    let stopCycle = () => {};
    let cycle: string | undefined;
    const updateMeta = (key: string, value: Meta) =>
      setMeta((previous) => ({ ...previous, [key]: value }));
    const stops = [
      driver.watch(
        root,
        false,
        (records, status) => {
          updateMeta("head", status);
          const next = String(records[0]?.data.cycle || "initial");
          if (next === cycle) return;
          cycle = next;
          stopCycle();
          setReady(false);
          setSnapshot((previous) => ({ ...previous, cycle: next, states: {} }));
          stopCycle = driver.watch(
            `${root}/cycles/${next}/states`,
            true,
            (entries, stateMeta) => {
              updateMeta("states", stateMeta);
              setSnapshot((previous) => ({
                ...previous,
                states: Object.fromEntries(
                  entries.map((entry) => [entry.id, entry.data as ItemState]),
                ),
              }));
              setReady(true);
            },
            fail,
          );
        },
        fail,
      ),
      ...(["items", "sections"] as const).map((kind) =>
        driver.watch(
          `${root}/${kind}`,
          true,
          (entries, status) => {
            updateMeta(kind, status);
            setSnapshot((previous) => ({
              ...previous,
              [kind]: Object.fromEntries(
                entries.map((entry) => [entry.id, entry.data]),
              ),
            }));
          },
          fail,
        ),
      ),
    ];
    return () => {
      stops.forEach((stop) => stop());
      stopCycle();
    };
  }, [driver, root, fail]);
  const write = (changes: Write[]) => {
    void driver.write(changes).catch(fail);
  };
  return {
    snapshot,
    ready: ready && !!meta.items && !!meta.sections,
    pending: Object.values(meta).some((value) => value.pending),
    cached: Object.values(meta).some((value) => value.cached),
    status(id: string, status: PackingStatus) {
      write([
        {
          path: `${root}/cycles/${snapshot.cycle}/states/${id}`,
          data: { status },
        },
      ]);
    },
    item(id: string, data: Partial<Item>) {
      write([{ path: `${root}/items/${id}`, data }]);
    },
    section(id: string, data: Partial<Section>) {
      write([{ path: `${root}/sections/${id}`, data }]);
    },
    removeItem(id: string) {
      write([{ path: `${root}/items/${id}`, remove: true }]);
    },
    reset(states: Record<string, ItemState> = {}) {
      const cycle = randomUUID();
      write([
        { path: root, data: { cycle } },
        ...Object.entries(states).map(([id, data]) => ({
          path: `${root}/cycles/${cycle}/states/${id}`,
          data,
        })),
      ]);
      return cycle;
    },
    restore() {
      const changes: Write[] = [];
      for (const kind of ["items", "sections"] as const)
        for (const [id, value] of Object.entries(snapshot[kind]))
          if (!value.custom)
            changes.push({ path: `${root}/${kind}/${id}`, remove: true });
      write(changes);
    },
    reorder(items: Array<{ id: string }>, kind: "items" | "sections") {
      write(
        items.map((item, index) => ({
          path: `${root}/${kind}/${item.id}`,
          data: { order: index * 100 },
        })),
      );
    },
  };
}
