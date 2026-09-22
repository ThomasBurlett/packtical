// One-time Android signing setup. Never prints passwords or private key material.
const fs = require("node:fs");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
if (fs.existsSync("credentials.json"))
  throw new Error(
    "Signing credentials already exist; refusing to replace them.",
  );
const keytool = process.argv[2];
if (!keytool) throw new Error("Pass the installed JDK keytool path.");
const password = crypto.randomBytes(30).toString("base64url");
const keystorePath = path.resolve("../.private/packbee-release.jks");
fs.mkdirSync(path.dirname(keystorePath), { recursive: true });
const env = { ...process.env, PACKBEE_KEY_PASSWORD: password };
const result = spawnSync(
  keytool,
  [
    "-genkeypair",
    "-v",
    "-storetype",
    "JKS",
    "-keystore",
    keystorePath,
    "-alias",
    "packbee",
    "-keyalg",
    "RSA",
    "-keysize",
    "2048",
    "-validity",
    "10000",
    "-dname",
    "CN=Packbee, OU=Mobile, O=Packbee, L=Denver, ST=Colorado, C=US",
    "-storepass:env",
    "PACKBEE_KEY_PASSWORD",
    "-keypass:env",
    "PACKBEE_KEY_PASSWORD",
  ],
  { env, stdio: "inherit" },
);
if (result.status) process.exit(result.status);
fs.writeFileSync(
  "credentials.json",
  JSON.stringify(
    {
      android: {
        keystore: {
          keystorePath,
          keystorePassword: password,
          keyAlias: "packbee",
          keyPassword: password,
        },
      },
    },
    null,
    2,
  ),
);
const cert = spawnSync(
  keytool,
  [
    "-list",
    "-v",
    "-keystore",
    keystorePath,
    "-alias",
    "packbee",
    "-storepass:env",
    "PACKBEE_KEY_PASSWORD",
  ],
  { env, encoding: "utf8" },
);
console.log(
  cert.stdout
    .split("\n")
    .filter((line) => /SHA1:|SHA256:/.test(line))
    .join("\n"),
);
