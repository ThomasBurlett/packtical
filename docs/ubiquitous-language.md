# Packbee ubiquitous language

## Organization

- **Packbee**: the personal preparation and packing application, replacing Packtical.
- **Checklist hub**: the screen for browsing and selecting an activity.
- **Category**: a broad grouping such as Outdoor, Travel, Cycling, or Snow.
- **Activity**: a reusable checklist choice, such as Camping or 1 week trip.
- **Checklist**: sections and items for one activity, with personal customizations and packing progress.
- **Travel preparation**: tasks before travel, distinct from belongings to pack.
- **Packing checklist**: items to pack for an activity or duration.
- **Related checklist**: another activity linked from an item; opening it preserves both checklists' independent progress.

## Content

- **Section**: a titled group of items in a checklist.
- **Item**: one checkable row, optionally with a note and related checklist link.
- **Core item**: expected by default, but not compulsory for every person.
- **Optional item**: worth considering but not always needed.
- **Custom item**: a personal addition. Its origin is separate from whether it is core or optional.
- **Hidden item**: persistently removed from the normal packing view through customization.
- **Restore defaults**: reinstate built-in content and arrangement while retaining personal items and sections.

## Packing state

- **Packing cycle**: the current round of packing progress on a reusable checklist. It is not a named trip.
- **Packed / Checked**: packed, completed, or otherwise handled.
- **Unpacked / Unchecked**: not handled yet.
- **Skipped item**: deliberately omitted this time; excluded from remaining work and restored on reset.
- **Packing progress**: packed count against visible, non-skipped items.
- **Reset checklist**: begin a new cycle with clear checkmarks and skips, preserving customizations.
- **Undo reset**: restore the previous progress into a new cycle, never reactivate a stale cycle.
- **Filter**: show All, Remaining, Core, Optional, Skipped, or Hidden items.
- **Collapsed section**: temporarily concealed section content to reduce scrolling.

## Accounts and sync

- **Account**: a Google identity with its own private checklists. Friends and family can each sign in; accounts do not collaborate.
- **Sync**: persistence across a person's devices, including offline changes sent after reconnecting.
- **Synced**: observed data has been confirmed by the server with no pending writes in that checklist.
- **Offline-ready**: previously loaded content remains available after an offline restart.
- **Local preview**: an explicitly selected developer preview with browser-only data; not a signed-in account and not production sync.
- **Customization backup**: a portable Packbee file containing item and section customizations across all activities, excluding accounts and packing progress.
- **Restore a backup**: review and merge saved customizations into the signed-in account. Matching IDs are updated; other additions and packing progress are retained.

Use these terms consistently in code and copy. Avoid introducing trips, household sharing, or legacy Supabase terminology into the rebuilt product.
