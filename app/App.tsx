import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowRight,
  Backpack,
  Check,
  Grid2X2,
  LogOut,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react-native";
import { createDriver } from "@/data/driver";
import type { Driver, User } from "@/data/port";
import { CHECKLIST_MAP } from "@/domain/catalogue";
import { importLegacy, type ImportedItem } from "@/domain/packing";
import {
  Button,
  colors,
  Field,
  IconButton,
  Landscape,
  Mark,
  Sheet,
  styles,
} from "@/ui/kit";
import { BackupPanel } from "@/ui/backup";
import { Hub } from "@/ui/hub";
import { ChecklistScreen } from "@/ui/checklist";

let service: Driver | undefined;
let setupError = "";
try {
  service = createDriver();
} catch (error) {
  setupError =
    error instanceof Error ? error.message : "Unable to start Packbee.";
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!service);
  const [error, setError] = useState("");
  const fail = useCallback((value: Error) => setError(value.message), []);
  useEffect(
    () =>
      service?.auth((value) => {
        setUser(value);
        setLoading(false);
      }),
    [],
  );
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
        <StatusBar style="dark" />
        <View
          style={{
            flex: 1,
            width: "100%",
            maxWidth: 1040,
            alignSelf: "center",
            backgroundColor: colors.paper,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: colors.line,
          }}
        >
          {loading ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
              }}
            >
              <Mark size={80} />
              <ActivityIndicator color={colors.green} />
            </View>
          ) : user && service ? (
            <Workspace
              key={user.uid}
              user={user}
              driver={service}
              fail={fail}
            />
          ) : (
            <Welcome
              error={setupError}
              signIn={() => {
                if (service) void service.signIn().catch(fail);
              }}
            />
          )}
          {!!error && (
            <View
              accessibilityRole="alert"
              style={{
                position: "absolute",
                left: 16,
                right: 16,
                bottom: 80,
                backgroundColor: colors.cream,
                borderColor: colors.clay,
                borderWidth: 1,
                borderRadius: 14,
                padding: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Text selectable style={[styles.body, { flex: 1 }]}>
                {error}
              </Text>
              <IconButton
                label="Dismiss message"
                icon={X}
                onPress={() => setError("")}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
function Welcome({ signIn, error }: { signIn: () => void; error: string }) {
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        padding: 32,
        gap: 30,
      }}
    >
      <View style={styles.row}>
        <Mark size={52} />
        <Text style={[styles.heading, { fontSize: 30 }]}>packbee</Text>
      </View>
      <View style={{ gap: 18, maxWidth: 580 }}>
        <Text style={styles.eyebrow}>Pack well. Wander more.</Text>
        <Text style={[styles.title, { fontSize: 52 }]}>
          A lighter mind.{"\n"}A ready backpack.
        </Text>
        <Text style={[styles.body, { color: colors.muted }]}>
          Thoughtful checklists for everyday adventures. Make them yours, pack
          at your pace, and take them offline.
        </Text>
      </View>
      <Landscape />
      <View style={{ gap: 14, maxWidth: 440 }}>
        <Button
          label="Continue with Google"
          icon={ArrowRight}
          onPress={signIn}
          disabled={!!error}
        />
        <Text style={styles.muted}>
          Your checklists, privately synced across your devices.
        </Text>
        {!!error && (
          <Text selectable style={[styles.muted, { color: colors.clay }]}>
            {error}
          </Text>
        )}
      </View>
      <Text style={styles.eyebrow}>Made for the way you get out there.</Text>
    </ScrollView>
  );
}
function Workspace({
  user,
  driver,
  fail,
}: {
  user: User;
  driver: Driver;
  fail: (error: Error) => void;
}) {
  const [screen, setScreen] = useState<"hub" | "checklist" | "settings">("hub");
  const [slug, setSlug] = useState("");
  const [resumed, setResumed] = useState(false);
  useEffect(() => {
    let first = true;
    return driver.watch(
      `users/${user.uid}`,
      false,
      (entries) => {
        if (!first) return;
        first = false;
        const last = entries[0]?.data.lastChecklist;
        if (typeof last === "string" && CHECKLIST_MAP[last]) {
          setSlug(last);
          setScreen("checklist");
        }
        setResumed(true);
      },
      (error) => {
        setResumed(true);
        fail(error);
      },
    );
  }, [driver, user.uid, fail]);
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (screen !== "hub") {
          setScreen("hub");
          return true;
        }
        return false;
      },
    );
    return () => subscription.remove();
  }, [screen]);
  const open = (next: string) => {
    setSlug(next);
    setScreen("checklist");
    void driver
      .write([{ path: `users/${user.uid}`, data: { lastChecklist: next } }])
      .catch(fail);
  };
  return (
    <>
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderColor: colors.line,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Packbee checklist hub"
          onPress={() => setScreen("hub")}
          style={styles.row}
        >
          <Mark size={40} />
          <Text style={[styles.heading, { fontSize: 24, letterSpacing: -0.8 }]}>
            packbee
          </Text>
        </Pressable>
        <Text style={[styles.muted, { fontSize: 12 }]}>
          {driver.preview ? "LOCAL PREVIEW" : "PACK WELL. WANDER MORE."}
        </Text>
      </View>
      {!resumed ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.green} />
      ) : screen === "hub" ? (
        <Hub open={open} />
      ) : screen === "checklist" && slug ? (
        <ChecklistScreen
          key={slug}
          driver={driver}
          uid={user.uid}
          slug={slug}
          open={open}
          back={() => setScreen("hub")}
          fail={fail}
        />
      ) : (
        <SettingsScreen user={user} driver={driver} fail={fail} />
      )}
      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderColor: colors.line,
          paddingVertical: 7,
          paddingHorizontal: 12,
          backgroundColor: colors.paper,
        }}
      >
        {[
          { title: "Checklists", icon: Grid2X2, screen: "hub" },
          ...(slug
            ? [{ title: "Packing", icon: Backpack, screen: "checklist" }]
            : []),
          { title: "Settings", icon: Settings, screen: "settings" },
        ].map((tab) => (
          <Pressable
            key={tab.title}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab.screen === screen }}
            onPress={() => setScreen(tab.screen as typeof screen)}
            style={{
              flex: 1,
              minHeight: 52,
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <tab.icon
              size={20}
              color={tab.screen === screen ? colors.clay : colors.muted}
            />
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: tab.screen === screen ? colors.clay : colors.muted,
              }}
            >
              {tab.title}
            </Text>
          </Pressable>
        ))}
      </View>
    </>
  );
}
function SettingsScreen({
  user,
  driver,
  fail,
}: {
  user: User;
  driver: Driver;
  fail: (error: Error) => void;
}) {
  const [importing, setImporting] = useState(false);
  const [raw, setRaw] = useState("");
  const [items, setItems] = useState<ImportedItem[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [logout, setLogout] = useState(false);
  const [pending, setPending] = useState(false);
  // Root metadata does not cover every pending item, so sign-out asks users to verify sync.
  useEffect(
    () =>
      driver.watch(
        `users/${user.uid}`,
        false,
        (_entries, meta) => setPending(meta.pending || meta.cached),
        fail,
      ),
    [driver, user.uid, fail],
  );
  async function migrate() {
    if (!items) return;
    setBusy(true);
    try {
      for (let index = 0; index < items.length; index += 400)
        await driver.write(
          items.slice(index, index + 400).map((entry) => ({
            path: `users/${user.uid}/checklists/${entry.slug}/items/${entry.id}`,
            data: entry.item,
          })),
        );
      setMessage(
        `${items.length} custom items imported. Your built-in checklists are unchanged.`,
      );
      setImporting(false);
      setRaw("");
      setItems(null);
    } catch (error) {
      fail(error as Error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 24, gap: 24 }}
    >
      <Text style={styles.eyebrow}>Your packing space</Text>
      <Text accessibilityRole="header" style={styles.title}>
        Settings
      </Text>
      <View style={styles.panel}>
        <View style={styles.row}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.cream,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={styles.heading}>{user.name.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heading}>{user.name}</Text>
            <Text selectable style={styles.muted}>
              {user.email}
            </Text>
          </View>
        </View>
        <Text style={styles.muted}>
          Private to your Google account. Your packing progress and
          customizations follow you across devices.
        </Text>
        <Button
          label="Sign out"
          tone="quiet"
          icon={LogOut}
          disabled={driver.preview}
          onPress={() => setLogout(true)}
        />
      </View>
      <View style={styles.panel}>
        <ShieldCheck color={colors.green} size={26} />
        <Text style={styles.heading}>Ready, even without reception.</Text>
        <Text style={styles.body}>
          Open a checklist online once, then keep packing offline. Changes sync
          when you reconnect. On the web, install Packbee for easy access and
          keep your browser’s site data.
        </Text>
        <Text style={styles.muted}>
          Reset starts a fresh packing cycle. Old offline checkmarks stay in the
          past; your custom items stay with you.
        </Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.heading}>Bring your own essentials.</Text>
        <Text style={styles.muted}>
          Import your custom items from a Packtical JSON export. Review the item
          count before importing; old accounts and checkmarks are left behind.
        </Text>
        <Button
          label="Import custom items"
          tone="secondary"
          onPress={() => setImporting(true)}
        />
        {!!message && (
          <Text accessibilityLiveRegion="polite" style={styles.body}>
            {message}
          </Text>
        )}
      </View>
      <BackupPanel driver={driver} uid={user.uid} />
      <View style={{ alignItems: "center", gap: 10, padding: 20 }}>
        <Mark size={70} />
        <Text style={styles.heading}>packbee</Text>
        <Text style={styles.muted}>Pack well. Wander more.</Text>
        <Text style={styles.muted}>
          Version 1.0.0 · A little preparation goes a long way.
        </Text>
      </View>
      {importing && (
        <Sheet
          title="Import custom items"
          close={() => {
            if (!busy) setImporting(false);
          }}
        >
          <Text style={styles.muted}>
            Paste the JSON export from Packtical. Nothing is saved until you
            review and import.
          </Text>
          <Field
            label="Packtical JSON"
            multiline
            value={raw}
            onChangeText={(value) => {
              setRaw(value);
              setItems(null);
            }}
            style={{ minHeight: 180 }}
            editable={!busy}
          />
          {items ? (
            <>
              <Text style={styles.body}>
                {items.length} custom items across{" "}
                {new Set(items.map((item) => item.slug)).size} checklists.
                Matching imported IDs will be updated if imported again.
              </Text>
              <Button
                label={busy ? "Importing…" : `Import ${items.length} items`}
                icon={Check}
                disabled={busy || !items.length}
                onPress={() => void migrate()}
              />
            </>
          ) : (
            <Button
              label="Review import"
              disabled={!raw.trim()}
              onPress={() => {
                try {
                  setItems(importLegacy(JSON.parse(raw)));
                } catch (error) {
                  fail(error as Error);
                }
              }}
            />
          )}
        </Sheet>
      )}
      {logout && (
        <Sheet title="Sign out of Packbee?" close={() => setLogout(false)}>
          <Text style={styles.body}>
            Make sure your checklists show Synced before signing out. Changes
            waiting for a connection have not reached your other devices.
          </Text>
          {pending && (
            <Text style={styles.muted}>Reconnect before signing out.</Text>
          )}
          <Button
            label="Sign out of this device"
            disabled={pending}
            onPress={() => void driver.signOut().catch(fail)}
          />
          <Button
            label="Stay signed in"
            tone="quiet"
            onPress={() => setLogout(false)}
          />
        </Sheet>
      )}
    </ScrollView>
  );
}
