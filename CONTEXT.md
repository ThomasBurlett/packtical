# Packing

Packbee is a personal tool for preparing and packing with reusable checklists, replacing Packtical.

## Language

**Activity**:
The user's checklist choice, such as Camping or Travel preparation.
_Avoid_: Trip, when referring to a reusable activity.

**Checklist**:
A reusable personal collection of sections and checkable items for one activity, with saved packing progress.
_Avoid_: Trip instance.

**Custom item**:
An item the user added to a checklist section. These personal additions are content to preserve through the rebuild.

**Travel preparation**:
A checklist of tasks to handle before travel, distinct from the belongings on a packing checklist.

**Packing checklist**:
A checklist focused on belongings to pack for an activity or duration.

**Sync**:
Persistence of personal checklist changes across devices, including changes made offline and sent after reconnection.

**Skipped item**:
An item deliberately left out of the current packing cycle. It does not count toward remaining packing work and returns when the checklist is reset.

**Hidden item**:
An item the user has removed from their normal packing view as a persistent customization.

**Reset checklist**:
Start packing again by clearing checkmarks and skips while retaining customizations.

**Packing cycle**:
The current round of progress on a reusable checklist. Reset starts a new cycle; older offline progress cannot reappear in it.
_Avoid_: Trip, booking, itinerary.

**Restore defaults**:
Reinstate a checklist's original built-in content and arrangement while keeping personal custom items and sections.

**Account**:
A person's Google sign-in identity with its own private checklists and customizations. Accounts do not share packing progress.

The full project vocabulary is maintained in [the ubiquitous language glossary](docs/ubiquitous-language.md).
