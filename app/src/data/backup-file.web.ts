export async function saveBackupFile(raw: string) {
  const url = URL.createObjectURL(
    new Blob([raw], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `packbee-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
export function chooseBackupFile(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json,text/plain";
    input.oncancel = () => resolve(null);
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      if (file.size > 5_000_000) {
        reject(new Error("Backup is too large (5 MB maximum)."));
        return;
      }
      void file.text().then(resolve, reject);
    };
    input.click();
  });
}
