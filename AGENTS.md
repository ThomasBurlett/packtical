# AGENTS.md

This file gives Codex and other coding agents Packtical-specific project context.

## Project

Packtical is a prep and packing checklist app for travel and outdoor activities. The product should feel practical, calm, mobile-first, and trustworthy.

## Ubiquitous Language

Use the project terms in [docs/ubiquitous-language.md](docs/ubiquitous-language.md) when discussing, naming, designing, or implementing features.

Core terms to keep consistent:

- **Checklist hub**: the HomePage where users choose a checklist.
- **Category**: a broad grouping of checklists, such as Travel, Outdoor, Cycling, or Snow.
- **Activity**: the user-facing checklist choice inside a category, such as Travel preparation or 1 day trip.
- **Checklist**: the actual interactive list for one activity.
- **ChecklistPage**: the route/view where a user checks items, filters items, and manages progress.
- **Section**: a titled group inside a checklist.
- **Item**: one checkable row inside a section.
- **Core item**: an item expected by default for the activity.
- **Optional item**: an item worth considering but not always needed.
- **Custom item**: an item the user added.
- **Travel preparation**: the general-purpose planning checklist for tasks before travel.
- **Packing checklist**: a duration-specific travel checklist focused on what to pack.
- **Related checklist**: another checklist linked from an item or activity context.
- **Packing progress**: the checked/total state for a checklist.
- **Sync**: persisted Supabase-backed progress and custom items.
- **Local dev auth**: the development-only auth bypass for avoiding Supabase email rate limits.

If a request introduces a new product concept, update `docs/ubiquitous-language.md` in the same change when it would help future conversations.

## Implementation Notes

- Keep UI copy aligned with the glossary. Prefer user-facing terms like "Checklist hub", "Activity", "Category", "Packing progress", and "Sync".
- Preserve the distinction between Travel preparation and packing checklists.
- Prefer mobile-first layouts. Desktop should feel like the same product with more space, not a separate app.
- For visual refinements, keep the off-white and forest-green Packtical palette calm and utilitarian.

## Verification

- Run `npm run lint` after code changes.
- Run `npm run build` for user-facing or release-bound changes.
- The build currently emits known HeroUI/Tailwind CSS minifier warnings and a bundle-size warning; treat build failure separately from those known warnings.
