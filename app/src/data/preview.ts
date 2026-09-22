import type { Driver, RecordData } from "./port";

// Explicit, build-time web preview only. Never an authentication fallback.
export function createPreviewDriver(): Driver {
  const key = "packbee:preview:v1";
  let records: Record<string, RecordData> = JSON.parse(
    localStorage.getItem(key) || "{}",
  );
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  window.addEventListener("storage", (event) => {
    if (event.key === key) {
      records = JSON.parse(event.newValue || "{}");
      emit();
    }
  });
  return {
    preview: true,
    auth(next) {
      next({
        uid: "preview",
        name: "Explorer",
        email: "Local preview · not synced",
      });
      return () => {};
    },
    async signIn() {},
    async signOut() {},
    watch(path, list, next) {
      const update = () => {
        const entries = Object.entries(records)
          .filter(([p]) =>
            list
              ? p.startsWith(`${path}/`) &&
                p.split("/").length === path.split("/").length + 1
              : p === path,
          )
          .map(([p, data]) => ({ id: p.split("/").at(-1)!, data }));
        next(entries, { pending: false, cached: false });
      };
      listeners.add(update);
      update();
      return () => {
        listeners.delete(update);
      };
    },
    async write(writes) {
      const updated = { ...records };
      for (const write of writes) {
        if (write.remove) delete updated[write.path];
        else updated[write.path] = { ...updated[write.path], ...write.data };
      }
      localStorage.setItem(key, JSON.stringify(updated));
      records = updated;
      emit();
    },
  };
}
