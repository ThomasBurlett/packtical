# Packbee

Pack well. Wander more.

Packbee replaces Packtical with a shared Expo / React Native application for Android, iPhone, and web. Each Google account gets private reusable checklists backed by Firebase, with offline edits and a warm visual identity aligned with Mealbee.

- [Open Packbee](https://packbee-app.web.app)
- [Download Android APK, version 1.0.0 (3)](https://expo.dev/artifacts/eas/oAuQ-aDJg---4Ozqu0CGO2ZKNX5947neTGRh4x4SWMo.apk)
- [Android build record](https://expo.dev/accounts/thomasburlett/projects/packbee/builds/881071fa-b859-41eb-9669-496b33ed525a)

## Run

Use Node 24 and npm. From the repository root:

```sh
npm ci
npm run dev
npm run lint
npm test
npm run test:rules
npm run build
```

The app lives in `app/`. Service registrations belong in `app/native-config/`; see its README. `npm run build` requires the Packbee Firebase registration and produces `app/dist`. `npm run build:preview` builds an explicitly labeled local-only preview in `app/dist-preview` without Google sign-in. Never deploy that preview as production.

## Packing behavior

- Eleven preserved activities, including separate Travel preparation and duration-based packing checklists.
- Check, skip this time, search, filter, and collapse sections.
- Add/edit/hide/reorder items and edit/reorder/add sections.
- Reset starts a new packing cycle, retaining customizations. Undo copies previous progress into a fresh cycle; stale offline writes never revive an old cycle.
- Restore defaults retains personal additions.
- Previously loaded data persists offline; the web build includes an offline application shell.
- The most recent checklist resumes at launch. Each Google account owns its own data.

## Build and deploy

```sh
cd app
npx firebase deploy --only firestore:rules,hosting --project packbee-app
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform ios --profile production
```

Android preview builds are standalone signed APKs, not development clients. iOS builds need Apple signing credentials; no app-store submission is configured. Signing files and private exports are excluded from Git. Native Firebase and Google sign-in require a custom Expo build, not Expo Go.

## Project structure

- `app/src/domain`: preserved catalogue, pure packing model, and migration validation.
- `app/src/data`: Firebase platform adapters and checklist subscriptions.
- `app/src/ui`: shared native/web screens and design primitives.
- `app/firestore.rules`: per-account isolation and document validation.
- `app/tests`: domain, migration, security, and reset-race checks.
- `docs/rebuild-plan.md`: accepted product decisions and delivery record.
- `docs/legacy`: reference-only Supabase schema and old email guidance.

The old Vite/Supabase implementation remains available in Git history. No old accounts or checked progress are migrated. A private CSV export was verified before cutover; its 13 records contained zero custom items.
