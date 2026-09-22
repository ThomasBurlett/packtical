import { spawnSync } from "node:child_process";
const result = spawnSync(
  process.execPath,
  [
    "node_modules/expo/bin/cli",
    "export",
    "--platform",
    "web",
    "--clear",
    "--output-dir",
    "dist-preview",
  ],
  { stdio: "inherit", env: { ...process.env, EXPO_PUBLIC_PREVIEW: "true" } },
);
if (result.status) process.exit(result.status);
process.env.PACKBEE_WEB_OUTPUT = "dist-preview";
await import("./finish-web.mjs");
