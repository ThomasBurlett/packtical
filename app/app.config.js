const fs = require("node:fs");
const path = require("node:path");
const read = (file) =>
  fs.existsSync(path.join(__dirname, file))
    ? JSON.parse(fs.readFileSync(path.join(__dirname, file), "utf8"))
    : {};
const web = read("native-config/web-config.json");
const project = read("native-config/project.json");
const androidFile =
  process.env.GOOGLE_SERVICES_JSON || "./native-config/google-services.json";
const iosFile =
  process.env.GOOGLE_SERVICES_PLIST ||
  "./native-config/GoogleService-Info.plist";
module.exports = {
  expo: {
    name: "Packbee",
    slug: "packbee",
    version: "1.0.0",
    scheme: "packbee",
    orientation: "default",
    userInterfaceStyle: "light",
    icon: "./assets/icon.png",
    ...(project.owner ? { owner: project.owner } : {}),
    android: {
      package: "com.packbee.app",
      ...(fs.existsSync(androidFile)
        ? { googleServicesFile: androidFile }
        : {}),
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFF4DE",
      },
    },
    ios: {
      bundleIdentifier: "com.packbee.app",
      supportsTablet: true,
      ...(fs.existsSync(iosFile) ? { googleServicesFile: iosFile } : {}),
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
      name: "Packbee",
      shortName: "Packbee",
    },
    extra: {
      firebase: web,
      googleWebClientId: project.googleWebClientId || "",
      ...(project.projectId ? { eas: { projectId: project.projectId } } : {}),
    },
    plugins: [
      "expo-sharing",
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      project.iosUrlScheme
        ? [
            "@react-native-google-signin/google-signin",
            { iosUrlScheme: project.iosUrlScheme },
          ]
        : "@react-native-google-signin/google-signin",
      ["expo-build-properties", { ios: { useFrameworks: "static" } }],
    ],
  },
};
