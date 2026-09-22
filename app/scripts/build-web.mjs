import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
const config = JSON.parse(
  await readFile("native-config/web-config.json", "utf8"),
);
if (config.projectId !== "packbee-app" || !config.apiKey || !config.appId)
  throw new Error("Expected the Packbee Firebase web registration.");
const env = {
  ...process.env,
  EXPO_PUBLIC_PREVIEW: "false",
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: config.projectId,
  EXPO_PUBLIC_FIREBASE_API_KEY: config.apiKey,
  EXPO_PUBLIC_FIREBASE_APP_ID: config.appId,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: config.authDomain,
};
const args = process.argv.includes("--dev")
  ? ["start", "--web"]
  : ["export", "--platform", "web", "--clear"];
const result = spawnSync(
  process.execPath,
  ["node_modules/expo/bin/cli", ...args],
  { stdio: "inherit", env },
);
if (result.status) process.exit(result.status);
if (!process.argv.includes("--dev")) await import("./finish-web.mjs");
