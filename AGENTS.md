# Packbee project guidance

Packbee is a personal prep and packing app for travel and outdoor activities, rebuilt from Packtical. Follow `CONTEXT.md`, `docs/ubiquitous-language.md`, and the accepted decisions in `docs/rebuild-plan.md`.

## Architecture

- The shared Expo / React Native / TypeScript app is in `app/` and targets web, Android, and iPhone.
- Firebase Auth (Google only), Firestore, and Firebase Hosting use the separate `packbee-app` project.
- Keep pure packing behavior in `app/src/domain` and platform Firebase code in `app/src/data/driver.ts` and `driver.web.ts`.
- Every account owns private checklists. No shared packing or named trips yet.
- Never copy Mealbee service registrations or personal data into this app.
- Keep private exports and signing credentials out of Git. The EAS APK profile uses the existing signing key; do not regenerate it.

## Product and design

- Preserve all catalogue content and stable IDs. Keep Travel preparation distinct from packing checklists.
- Use the Mealbee family palette: warm cream, charcoal, honey gold, sage, and clay. Packbee has its own backpack-and-bee mark.
- Make mobile packing fast and accessible; desktop is the same product with more room.
- Reset clears packed/skipped state by moving to a new cycle. Old-cycle writes must not affect current progress. Customizations persist.
- Restore defaults keeps personal custom items and sections.
- Label preview mode clearly. Never silently fall back from failed authentication to a local preview.

## Verification

Run `npm run lint`, `npm test`, and `npm run build` for user-facing changes. Run `npm run test:rules` for data/security changes (JDK 21 required). Test real Android behavior on a device; web checks do not establish native correctness. EAS Android builds are deliberate standalone APK releases, not automatic on every push.
