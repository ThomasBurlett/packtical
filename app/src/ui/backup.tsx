import { useState } from "react";
import { Text, View } from "react-native";
import type { Driver } from "@/data/port";
import { exportBackup, restoreBackup } from "@/data/backup";
import { saveBackupFile, chooseBackupFile } from "@/data/backup-file";
import { backupCount, parseBackup, type Backup } from "@/domain/backup";
import { Button, Field, Sheet, styles } from "./kit";

export function BackupPanel({ driver, uid }: { driver: Driver; uid: string }) {
  const [busy, setBusy] = useState(false);
  const [showText, setShowText] = useState(false);
  const [raw, setRaw] = useState("");
  const [backup, setBackup] = useState<Backup | null>(null);
  const [mode, setMode] = useState<"export" | "restore" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>Keep a copy of your essentials.</Text>
      <Text style={styles.muted}>
        Back up personal items and sections, names, notes, order, and hidden
        items across all checklists. Packing progress and your account are not
        included. Connect to the internet first.
      </Text>
      <Button
        label={busy ? "Preparing backup..." : "Export customizations"}
        disabled={busy}
        onPress={() => {
          setBusy(true);
          setError("");
          setMessage("");
          void exportBackup(driver, uid)
            .then((value) => {
              setRaw(JSON.stringify(value, null, 2));
              setShowText(false);
              setMode("export");
            })
            .catch((e) => setError(e.message))
            .finally(() => setBusy(false));
        }}
      />
      <Button
        label="Restore a backup"
        tone="secondary"
        disabled={busy}
        onPress={() => {
          setRaw("");
          setBackup(null);
          setError("");
          setMessage("");
          setShowText(false);
          setMode("restore");
        }}
      />
      {!!message && (
        <Text accessibilityLiveRegion="polite" style={styles.body}>
          {message}
        </Text>
      )}
      {!!error && !mode && (
        <Text accessibilityRole="alert" style={styles.body}>
          {error}
        </Text>
      )}
      {mode && (
        <Sheet
          title={
            mode === "export"
              ? "Your customization backup"
              : "Restore customizations"
          }
          close={() => {
            if (!busy) setMode(null);
          }}
        >
          <Text style={styles.muted}>
            {mode === "export"
              ? "Save the backup file somewhere you control. Use it to restore your customizations later."
              : "Choose your Packbee backup file and review it before saving. Matching items and sections are updated; other additions and current packing progress stay untouched."}
          </Text>
          {mode === "restore" && (
            <Button
              label="Choose backup file"
              disabled={busy}
              onPress={() => {
                setError("");
                void chooseBackupFile()
                  .then((value) => {
                    if (value !== null) {
                      setRaw(value);
                      setBackup(null);
                      setBackup(parseBackup(value));
                    }
                  })
                  .catch((e) => setError(e.message));
              }}
            />
          )}
          <Button
            label={
              showText
                ? "Hide backup text"
                : mode === "restore"
                  ? "Paste backup text instead"
                  : "Show backup text"
            }
            tone="quiet"
            disabled={busy}
            onPress={() => setShowText(!showText)}
          />
          {showText && (
            <Field
              label="Backup JSON"
              multiline
              value={raw}
              editable={mode === "restore" && !busy}
              selectTextOnFocus
              onChangeText={(value) => {
                setRaw(value);
                setBackup(null);
                setError("");
              }}
              style={{ height: 160 }}
            />
          )}
          {!!error && (
            <Text accessibilityRole="alert" style={styles.body}>
              {error}
            </Text>
          )}
          {mode === "export" ? (
            <Button
              label="Save or share backup"
              onPress={() => {
                void saveBackupFile(raw).catch((e) => setError(e.message));
              }}
            />
          ) : backup ? (
            <>
              <Text style={styles.body}>
                {backupCount(backup)} item and section customizations across{" "}
                {
                  backup.checklists.filter(
                    (c) =>
                      Object.keys(c.items).length ||
                      Object.keys(c.sections).length,
                  ).length
                }{" "}
                checklists. Restoring the same backup again will not create
                duplicates.
              </Text>
              <Text style={styles.muted}>
                Existing matching customizations will be overwritten. If
                interrupted, reconnect and restore this file again.
              </Text>
              <Button
                label={busy ? "Restoring..." : "Restore these customizations"}
                disabled={busy || !backupCount(backup)}
                onPress={() => {
                  setBusy(true);
                  setError("");
                  void restoreBackup(driver, uid, backup)
                    .then(() => {
                      setMessage("Customizations restored and synced.");
                      setMode(null);
                    })
                    .catch((e) =>
                      setError(
                        `Restore did not finish: ${e.message}. You can safely retry.`,
                      ),
                    )
                    .finally(() => setBusy(false));
                }}
              />
            </>
          ) : (
            <Button
              label="Review backup"
              disabled={!raw.trim()}
              onPress={() => {
                try {
                  setBackup(parseBackup(raw));
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            />
          )}
        </Sheet>
      )}
    </View>
  );
}
