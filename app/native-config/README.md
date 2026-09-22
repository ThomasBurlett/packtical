# Packbee service registration

This directory holds local Packbee configuration. Do not copy Mealbee configuration.

- `web-config.json`: Firebase web registration (apiKey, authDomain, projectId, appId, messagingSenderId).
- `google-services.json`: Android Firebase registration for `com.packbee.app` with the EAS signing certificate registered.
- `GoogleService-Info.plist`: iOS Firebase registration for `com.packbee.app`.
- `project.json`: Expo `owner`, EAS `projectId`, Google `googleWebClientId`, and iOS `iosUrlScheme`.

Google sign-in must be enabled in Firebase. These client configuration files are not admin credentials, but are deliberately kept separate from source. Supply native registration files to EAS via its file environment variables when needed.
