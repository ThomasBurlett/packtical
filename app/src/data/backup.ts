import { CHECKLIST_MAP } from "@/domain/catalogue";
import { parseBackup, type Backup } from "@/domain/backup";
import { emptySnapshot, materialize } from "@/domain/packing";
import type { Driver, Entry, Write } from "./port";

function readSynced(driver: Driver, path: string): Promise<Entry[]> {
  return new Promise((resolve, reject) => {
    let stop = () => {};
    let settled = false;
    const finish = (error?: Error, entries?: Entry[]) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      stop();
      if (error) reject(error);
      else resolve(entries!);
    };
    const timer = setTimeout(
      () =>
        finish(
          new Error(
            "Reconnect and wait for sync before exporting a complete backup.",
          ),
        ),
      15000,
    );
    stop = driver.watch(
      path,
      true,
      (entries, meta) => {
        if (!meta.cached && !meta.pending) finish(undefined, entries);
      },
      (error) => finish(error),
    );
    if (settled) stop();
  });
}
export async function exportBackup(
  driver: Driver,
  uid: string,
): Promise<Backup> {
  const checklists = await Promise.all(
    Object.keys(CHECKLIST_MAP).map(async (slug) => {
      const root = `users/${uid}/checklists/${slug}`;
      const [items, sections] = await Promise.all([
        readSynced(driver, `${root}/items`),
        readSynced(driver, `${root}/sections`),
      ]);
      return {
        slug,
        items: Object.fromEntries(items.map((e) => [e.id, e.data])),
        sections: Object.fromEntries(sections.map((e) => [e.id, e.data])),
      };
    }),
  );
  const validated = parseBackup(
    JSON.stringify({
      format: "packbee-customizations",
      version: 1,
      createdAt: new Date().toISOString(),
      checklists,
    }),
  );
  // Include effective defaults for each changed record so a later restore also
  // reverses fields edited after the backup (for example hiding a renamed item).
  return {
    ...validated,
    checklists: validated.checklists.map((c) => {
      const effective = materialize(c.slug, {
        ...emptySnapshot(),
        items: c.items,
        sections: c.sections,
      });
      return {
        slug: c.slug,
        items: Object.fromEntries(
          effective
            .flatMap((s) => s.items)
            .filter((i) => Object.hasOwn(c.items, i.id))
            .map(({ id, ...item }) => [id, item]),
        ),
        sections: Object.fromEntries(
          effective
            .filter((s) => Object.hasOwn(c.sections, s.id))
            .map((s) => [
              s.id,
              { title: s.title, order: s.order, custom: s.custom },
            ]),
        ),
      };
    }),
  };
}
export function backupWrites(backup: Backup, uid: string): Write[] {
  // Validate again at the persistence boundary. No file-supplied user or path is used.
  const valid = parseBackup(JSON.stringify(backup));
  return valid.checklists.flatMap((c) =>
    (["sections", "items"] as const).flatMap((kind) =>
      Object.entries(c[kind]).map(([id, data]) => ({
        path: `users/${uid}/checklists/${c.slug}/${kind}/${id}`,
        data,
      })),
    ),
  );
}
export async function restoreBackup(
  driver: Driver,
  uid: string,
  backup: Backup,
) {
  const writes = backupWrites(backup, uid);
  for (let i = 0; i < writes.length; i += 400)
    await driver.write(writes.slice(i, i + 400));
}
