# Packtical Ubiquitous Language

This glossary keeps product, design, and engineering language consistent across Packtical. Use these terms in code, UI copy, issues, commits, and conversations unless there is a strong reason to introduce a new concept.

## Product Frame

**Packtical**

The application. Packtical is an interactive prep and packing hub for travel and outdoor activities.

**Packing space**

A friendly phrase for the user's synced Packtical workspace. Good for auth and email copy. Avoid using it as a technical object name.

**Checklist hub**

The HomePage. Users land here to browse categories, expand a category, and choose an activity/checklist.

Do not call this "dashboard" unless the page becomes more analytical or account-heavy.

## Organization

**Category**

A broad grouping of activities/checklists, such as Travel, Outdoor, Cycling, or Snow. Categories are collapsible on the Checklist hub.

Use "category" for grouping. Avoid "folder" unless referring to an icon or visual metaphor.

**Activity**

The user-facing choice inside a category, such as Travel preparation, 1 day trip, Camping, or Mountain biking. An activity usually opens exactly one checklist.

Use "activity" when talking about what the user chooses. Use "checklist" when talking about the interactive list itself.

**Checklist**

The interactive list for one activity. A checklist contains sections and items and has saved packing progress.

**Related checklist**

Another checklist linked from an item or activity context. Use this for add-ons like skiing, hiking essentials, running essentials, or other activity-specific packing needs.

## Travel

**Travel**

The category for travel-related activities and checklists.

**Travel preparation**

The general-purpose planning checklist for tasks before travel, such as booking, documents, home shutdown, and departure prep.

This is not a packing checklist and should not be replaced by duration-specific packing lists.

**Packing checklist**

A checklist focused on what to pack. For travel, duration-specific packing checklists include 1 day trip, 3 day trip, 1 week trip, and 2 week trip.

**Trip duration**

The length represented by a travel packing checklist. Current duration labels are 1 day, 3 day, 1 week, and 2 week.

**Activity add-on**

An optional related checklist for a specific activity or context, such as skiing, hiking essentials, or running essentials.

## Checklist Structure

**Section**

A titled group inside a checklist, such as Clothing, Toiletries, Carry-on, or Additional tasks before leaving.

**Item**

One checkable row inside a section.

**Core item**

An item expected by default for the activity. Core does not mean mandatory for every person; it means the app treats it as part of the main packing flow.

**Optional item**

An item worth considering but not always needed. Optional items can be filtered separately.

**Custom item**

An item the user added to a section. Custom items are saved with the user's checklist progress.

**Item note**

Supplemental guidance attached to an item. Use notes for lightweight clarification, not as a replacement for a separate item.

## Progress And State

**Packing progress**

The checked/total state for a checklist, shown as a percentage and count.

**Checked**

An item state meaning the user has packed, completed, or otherwise handled the item.

**Unchecked**

An item state meaning the user has not handled the item yet.

**Collapsed section**

A section hidden by the user to reduce scrolling.

**Filter**

A checklist toolbar control that changes visible items by state or kind, such as All, Unchecked, Core, Optional, or Custom.

## Account And Sync

**Sync**

Supabase-backed persistence for checklist progress and custom items.

**Synced**

The state where current checklist progress has been saved.

**Guest session**

An anonymous Supabase-backed session. Guest progress can later be connected to an email account.

**Account**

The user's email-backed identity for sign-in and sync.

**Display name**

An optional first and/or last name stored on the user's account metadata. When present, show the display name in account affordances instead of the email address.

**Magic link**

The passwordless sign-in email sent by Supabase.

**Local dev auth**

The development-only auth bypass controlled by `VITE_USE_LOCAL_AUTH=true`. It signs the app in as `local-dev@packtical.test` and stores progress in local browser storage instead of Supabase.

## Routes And Screens

**HomePage**

The React page component for the Checklist hub.

**ChecklistPage**

The React page component for one checklist.

**AccountPage**

The React page component for account and sync management.

**AuthGate**

The app gate shown while auth is loading, unavailable, or needed before the main app can be used.

## UI Language

**Hero**

The top content area of a page. On ChecklistPage, the hero includes checklist navigation, category badge, activity switcher, subtitle, facts, and packing progress controls.

**Activity switcher**

The ChecklistPage control used to view or change the active activity/checklist.

**Category badge**

The small visual cue above the activity switcher showing the current category.

**Checklist nav**

The lightweight top navigation on ChecklistPage. On mobile, it should remain compact and focused.

**Toast**

A temporary user-facing message, usually for sync/auth failures or important status updates.

## Naming Preferences

- Prefer "Checklist hub" over "home dashboard".
- Prefer "Activity" over "template" or "list card" when referring to the user's choice.
- Prefer "Checklist" over "list" when referring to the full interactive experience.
- Prefer "Item" over "task" unless the item is truly a before-leaving task.
- Prefer "Sync" over "database" in user-facing copy.
- Prefer "Travel preparation" for the planning checklist and "packing checklist" for duration-based travel lists.

## When To Update This File

Update this glossary when:

- A new product concept is introduced.
- A term starts being used two different ways.
- UI copy creates ambiguity.
- A domain distinction matters for future engineering or design work.
