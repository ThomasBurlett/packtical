# Packbee architecture

## Shared app and platform boundaries

Expo, React Native, TypeScript, and React Native Web replace the previous Vite/HeroUI/Supabase stack. The app intentionally follows Mealbee's shared-UI and platform-adapter approach. A small screen switcher is enough for the current hub/checklist/settings flow; Android back returns to the hub. Native Firebase provides mobile offline persistence; the web adapter uses persistent Firestore caching and the build creates a service worker for the application shell.

## Firestore shape

`users/{uid}` stores the last checklist. Under `users/{uid}/checklists/{slug}`:

- The checklist document stores the active `cycle` identifier.
- `items/{itemId}` stores only personal overrides or added items.
- `sections/{sectionId}` stores personal section overrides or additions.
- `cycles/{cycleId}/states/{itemId}` stores packed/unpacked/skipped values.

The built-in catalogue ships with the application, requiring no reads for its 651 item rows. IDs combine section and item IDs to avoid collisions within a checklist. Custom item origin and core/optional classification are separate fields.

Reset writes a new random cycle ID. Older offline item writes may settle in their old cycle but are never read as current progress. Undo copies the prior snapshot into another fresh cycle, never reactivating an old cycle. Competing resets use the last synchronized head write; no timestamp comparison or device-clock ordering is implied. Independent item writes do not replace an entire list. Old cycles are retained initially; a future retention job can remove them without changing current behavior.

Rules isolate all records by authenticated UID and validate allowed fields and values. Google is the only enabled production provider. A clearly labeled local web preview is selected at build time only, never as an authentication fallback.

## Delivery

Firebase project: `packbee-app`. EAS project: `@thomasburlett/packbee`. Native application IDs: `com.packbee.app`.

The Android preview profile builds a standalone signed APK through EAS. The signing key is privately backed up outside the repository. iOS has a Firebase registration and Expo configuration; building/distributing iOS still requires the appropriate Apple credentials.

The Firebase project currently uses Spark and no Cloud Functions or Storage uploads are needed by this feature set. Do not assume unlimited usage or silently enable paid services.

The web build reads the Packbee service registration into Expo public environment variables and validates its project ID. Public SDK config is not an admin credential. Private signing keys and old user data never belong in Git or client bundles.

## Migration

The source catalogue was copied before replacing the old application. A private CSV from Supabase contained 13 records and zero custom items. No legacy accounts or progress are imported. The validated custom-item importer remains available in Settings for separately recovered exports. The old application source is in Git history and the original backend has not been deleted.
