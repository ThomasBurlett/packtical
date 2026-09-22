# Rebuild verification

## Completed

- Original catalogue compared directly with Git source: 11 activities and 651 item rows preserved.
- Private Supabase CSV: 13 records, zero custom items, SHA-256 `3FA8E765390B2FAA5F69C5172E5E26634E339F8924872B4B40F8706A35B2E84F`.
- Lint and TypeScript pass.
- Four domain/migration tests pass.
- Three Firestore emulator tests pass: account isolation and malformed writes; stale-cycle/undo behavior; actual offline queued writes reconnecting after another client resets.
- Browser preview: checkbox counts, skip exclusion, custom item addition, reset retaining the custom item, and undo restoring previous packed/skipped state.
- At phone width, verified reordering, editing a built-in label, hiding an item, adding a section and item, and restoring defaults: original labels/order/visibility returned while the personal section and item remained.
- Production Google sign-in succeeded with the owner completing the account chooser. Camping progress survived a page reload and reached Synced.
- Web export and Firebase Hosting/rules deployments pass.
- Android and iOS JavaScript bundles export successfully. Local Android prebuild passes.
- EAS archive inspected: source, icons, and native Firebase registrations present; signing credentials excluded from the source archive.

## Delivery notes

The first EAS build stopped in prebuild because an overly broad archive rule omitted app assets. The rule was corrected and the archive inspected before retrying. No native success is inferred from that failed build or from JavaScript export alone.

Physical Android installation, native Google sign-in, offline restart, and reconnection results will be recorded after the signed APK finishes. An iOS native binary and physical iPhone validation have not been performed.
