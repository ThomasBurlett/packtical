import { File, Paths } from "expo-file-system";
import { getDocumentAsync } from "expo-document-picker";
import { isAvailableAsync, shareAsync } from "expo-sharing";
export async function saveBackupFile(raw: string) {
  if (!(await isAvailableAsync()))
    throw new Error(
      "File sharing is unavailable. You can copy the backup text instead.",
    );
  const file = new File(Paths.cache, `packbee-backup-${Date.now()}.json`);
  file.create();
  file.write(raw);
  await shareAsync(file.uri, {
    mimeType: "application/json",
    UTI: "public.json",
    dialogTitle: "Save your Packbee backup",
  });
}
export async function chooseBackupFile(): Promise<string | null> {
  const result = await getDocumentAsync({
    type: ["application/json", "text/plain"],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;
  const file = new File(result.assets[0].uri);
  if (file.size > 5_000_000)
    throw new Error("Backup is too large (5 MB maximum).");
  return file.text();
}
