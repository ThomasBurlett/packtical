# Packbee rebuild

Status: implemented and delivered on Firebase Hosting and as a signed Expo EAS Android APK. Installed on the owner's Pixel 8; the owner confirmed native sign-in, cross-device progress, offline restart, and reconnection. See validation.md for evidence and the remaining web offline cold-start and native iOS validation limitations.

## Owner requirements

- Rebuild the application around the existing checklist content and the basic packing workflow.
- Align the architecture and visual identity with Mealbee; Firebase is preferred over Supabase for personal-use economics.
- Build a shared Expo application for web, Android, and iPhone. Initial delivery is web plus an Android APK built through Expo EAS, without app-store publication.
- Authentication, UI, branding, and technology can be replaced. There are no other current users to accommodate.
- Use the grill-with-docs interview workflow and record resolved terminology and consequential decisions during planning.

## Inspected baseline

Packtical currently uses Vite, React DOM, HeroUI, Tailwind, and Supabase. `src/data/checklists.ts` contains 11 checklists spanning Outdoor, Travel, Snow, and Cycling. Preserve their sections, item identifiers, labels, core/optional distinctions, notes, and related-checklist links. Current persisted state is one record per user and checklist slug, containing checked items, collapsed sections, and custom items.

Mealbee's local checkout at `D:/dev/mealbee`, commit `6f01f58`, uses Expo, React Native, TypeScript, React Native Web, Firebase Auth, Firestore, platform-specific data drivers, and a shared native UI kit. Its branding uses warm cream, charcoal, honey gold, clay, and sage. Its documented backend includes static Firebase Hosting. Remote HEAD was `f80598f83a238044b29ea7d268edff410654820a` during inspection; compare that revision before selecting implementation details. Earlier references to the mealbee-foundation checkout are outdated for this inspection.

## Proposed direction

Use Expo, React Native, TypeScript, and React Native Web with a small domain layer, platform-specific Firebase adapters, and accessible shared UI components. Use native Firebase SDKs on mobile and the Firebase web SDK with persistent caching on web. Adapt Mealbee's patterns and visual tokens to packing. Use a separate Packbee Firebase project for Google authentication, Firestore, and static Firebase Hosting. Do not copy Mealbee project identifiers, credentials, or private data.

## Resolved first round

- Use quick reusable checklists. The owner packs for one outing at a time; named trips are a possible future feature, not part of this rebuild's initial model.
- Personal checklists per account. Friends and family may sign in with their own Google accounts; no households, sharing, assignments, or collaboration in the initial version.
- Preserve the built-in catalogue and personal custom items. Checked progress and existing accounts do not need migration. A hard backend cutover is acceptable; backward compatibility and dual backend operation are not required.
- Previously loaded checklists must remain usable offline after reopening the app, including checking and adding items, with synchronization after reconnection. Validate on web and physical Android.
- The owner selected Packbee in round two: a sibling identity aligned with Mealbee, with warm shared colors and a distinct bee-and-backpack direction. Domain and trademark availability have not been checked.

## Resolved second round

- Allow adding, editing, reordering, and hiding items, plus editing sections. Provide restore defaults per checklist, preserving personal additions as resolved in round three.
- Reset clears checkmarks and preserves customizations. Switching activities preserves each checklist's progress until explicitly reset. Provide undo for accidental reset.
- Support Skip this time, distinct from checked and permanently hidden. Skipped items do not count toward remaining packing work and return on reset.
- Google sign-in only, with existing sessions usable offline. Do not implement email/password or guest sign-in for the initial release.
- The new product name is Packbee.

## Resolved third round

- Restore defaults reinstates original built-in items and arrangement while retaining custom items and sections. Deleting personal additions is a separate explicit action.
- Reset starts a new packing cycle. Changes to checkmarks from an older offline cycle must not reappear after reconnecting. Within a cycle, the last synchronized change to the same item wins; different items remain independent.
- Any Google account may sign in and receive private checklists. The owner expects friends and family to use the app.
- Use a separate Packbee Firebase project for Auth, Firestore, and web hosting. Begin with its provided web address.
- Use Expo for Android and iPhone builds. The owner explicitly selected an Expo-built Android APK for initial installation, superseding the proposed local-only Android build. Configure EAS internal APK distribution; do not publish to stores. iOS is a supported target, with distribution and signing setup deferred until an iPhone build is requested.
- Resume the most recently opened checklist, with a clear activity switcher. First launch opens the checklist hub.

Preservation verified: downloaded the existing Supabase table into `D:/dev/packbee-private-backups/packtical-2026-09-21.csv`. All 13 records have empty custom-item collections. The built-in catalogue exactly matches the original source (11 activities, 651 items). No legacy accounts or checked progress are imported; the old backend has not been deleted. A custom-item importer remains available for separately recovered JSON exports.

## Delivery sequence

1. Preserve the catalogue and export personal custom items from the existing data source into a private, reviewable migration artifact. Verify section mappings and item counts before backend cutover; do not put personal data in Git.
2. Inspect the current Mealbee remote revision and build Packbee's Expo foundation, shared UI primitives, brand assets, and domain logic. Keep native and web Firebase details behind adapters.
3. Implement the checklist hub, resume behavior, packing interaction, editing, skips, reset/undo, restore defaults, and settings. Keep Travel preparation distinct from packing checklists.
4. Implement Google sign-in, per-user security rules, offline persistence and web application-shell caching, and clear pending/synced/error feedback. Store item changes independently and isolate checked/skipped state by packing cycle. Verify concurrent resets and undo do not revive stale offline progress; personal edits survive cycle changes.
5. Provision/configure the separate Firebase and Expo projects, import preserved custom items into the owner's new account, and validate isolation using separate test accounts. No old account or checked-progress migration is needed.
6. Run lint, type checks, domain and security-rule tests, web production build, browser interaction checks, and Android device checks for offline restart/reconnect. Build a standalone EAS Android APK that does not require a development server, then deploy the web app and verify both delivered artifacts.

Implementation discretion: choose navigation, component boundaries, document layout, and accessible interaction details that satisfy the accepted behavior. No further product interview is needed unless implementation exposes a material contradiction.

## Design tree history

First round (resolved above):

1. Packing lifecycle: reusable activity progress, distinct trips, or both.
2. Ownership: personal packing or collaborative packing with a partner/group.
3. Preservation: built-in catalogue only, or also personal custom items and saved progress.
4. Offline contract: what remains usable without connectivity, including after restarting the app.
5. Brand relationship: retain Packtical as a sibling brand or explore a new name and identity.

Dependent rounds:

- Lifecycle determines checklist instances, reset/archive behavior, activity combinations, and item customization.
- Ownership determines sharing, attribution, authorization, and concurrent-edit behavior.
- Offline requirements determine caching, sync feedback, conflict policy, and device acceptance tests.
- Preservation determines export, migration, and cutover requirements.
- Brand and workflow decisions determine navigation and reviewable screen designs.
- Resolve sign-in, Firebase project separation, deployment, and Android distribution before implementation/release.

## Acceptance criteria

- All 11 existing checklists retain their sections, content, core/optional distinctions, notes, and related-checklist links.
- Personal custom items are verified in the new account; old accounts and checked progress are intentionally not migrated.
- Customization, restore defaults, reset, undo, and skips satisfy the resolved behavior above.
- First launch opens the hub; later launches resume the last checklist.
- Each Google account can access only its own saved data.
- Previously loaded checklists work after an offline restart, and reconnecting preserves independent changes without resurrecting old-cycle progress.
- Web is deployed to Firebase Hosting and a standalone Android APK is delivered through EAS. iPhone configuration is included, but do not claim an iOS build or physical iPhone validation unless actually performed.
- Lint and production builds pass, along with meaningful domain, security, web, and physical Android validation. Preserve access to the existing application/data until required content preservation and replacement are verified; no dual-write compatibility layer is required.

## Interview sources

- https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md
- https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md
- https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md

Use the existing `docs/ubiquitous-language.md` as the vocabulary baseline; update resolved concepts as the interview progresses.
