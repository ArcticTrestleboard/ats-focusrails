# FocusRails Web v1 – Figma Prototype Specification

**Objective:**  

Produce a detailed, interactive Figma prototype for **FocusRails Web v1**, capturing the unique, minimalist daily focus workflow—*not* a generic project or kanban app. This prototype must reflect the real product experience: a **single, streamlined day view with no projects, boards, columns, tags, or assignees**, just a focused TODAY rail with precise feature interactions and visuals.

---

## Prototype Structure

### 1\. Full TODAY Board (Main Web View)

Layout & Organization

* *Single page,* one vertical column layout—**without any left navigation, multi-board/project controls, or sidebar.**

* **Stacked vertical sections:**

  1. **NOW:** (topmost section, limited capacity)

  2. **Today:** (middle, standard daily tasks)

  3. **Parking Lot:** (bottom, lower/future priorities)

* Each section is labeled clearly with its title.

Task Cards

* Simple vertical lists in each section; cards display **only:**

  * Short title (primary, top line)

  * Optional small note/description (secondary, below title)

* **Absolutely no other metadata** (no due dates, assignees, avatars, priorities, tags, filter/search bar, etc.).

Functional Interactions

* **NOW Section:**

  * *Maximum 3 cards visible at a time.*

    * If limit is reached, show a subtle "full" indicator or a disabled/ghosted placeholder to make the 3-item max obvious.

    * Users **cannot add directly into NOW;** only via drag in.

* **Today & Parking Lot Sections:**

  * No explicit list limits.

  * Each list has a **simple "+ Add"** control at its bottom to create new cards (which can be edited inline).

* **Card Interactions:**

  * **Drag-and-drop** to move or reorder cards across or within NOW, Today, and Parking Lot.

  * **Inline editing:** Clicking a card allows direct edit of its title and note.

Card Quick-Move Controls

Add subtle, icon-only **quick-move buttons** to the bottom-right area of every task card for fast movement between lists without opening a modal or dragging. Implement these interactions as follows:

* **For Today Cards:**

  * A small icon-only button in the bottom-right, with hover tooltip:

    * `To NOW` — Moves the card to the NOW list.

      * *If NOW is at its maximum (3 cards),* either disable this button (with a tooltip "NOW is full") or annotate near the section with "NOW is full."

    * `To Parking Lot` — Moves the card to the Parking Lot list.

* **For Parking Lot Cards:**

  * A small icon-only button:

    * `To Today` — Moves the card into the Today list.

  * Optionally, for illustration (if menus are not feasible), add a second small icon:

    * `To NOW` — Moves the card directly into the NOW list. (If unavailable due to NOW's capacity, disable as above.)

* **For NOW Cards:**

  * A small, subtle icon-only button:

    * `To Today` — Moves the card back to the Today list.

  * *Do not provide a direct* `To Parking Lot` *button for NOW cards.*

**Visual Style:**

* Place quick-move buttons at the bottom-right of each task card, using small, gray icons that highlight on hover—matching the design system's visual language.

* Keep these controls visually minimal and low-emphasis, so they do not overpower card content but are discoverable on hover.

*Annotate these controls directly in the prototype with brief notes or hover text, ensuring quick-move flows are testable and clearly visible to reviewers.*

Task Completion

* Completing a task visually marks it as done (e.g., strike-through and fade effect).

* Completed items auto-move to a subtle, separated **"Done today"** area or state (shown below the three main lists, or at the bottom of the Today section).

Navigation Chrome

* Only a minimal top bar:

  * **App name:** FocusRails (left)

  * **Account/avatar:** (right; click for simple logout/profile actions only)

* **No search, filters, project/workspace selectors, recent/fav/archive.**

---

Visual & UX Guidelines

* **Color & Typography:**

  * *Primary color:* Indigo (see spec)

  * *Accent color:* Lime (used to highlight NOW section and timer elements)

  * *Typography:* Simple, clear hierarchy using Inter family

* **Overall Theme:**

  * Crisp, high-contrast, modern **light mode only**

  * No visual clutter; no unnecessary chrome or controls

---

### 2\. Focus Panel (Desktop Companion Window)

Layout & Structure

* **Separate, compact frame** representing a *persistent, always-on-top* mini-window.

* **Components:**

  * *Tiny header bar:*

    * FocusRails logo/name (left)

    * Close / minimize icons (right)

  * *Main content area:*

    1. **Active NOW Task:**

      * Prominently displayed row showing the current, selected NOW task (title and optional note).

    2. **Timer:**

      * Large, clear countdown (default "25:00"), placed directly under (or beside) the active NOW task title.

    3. **Next up:**

      * Up to **two additional NOW tasks**, shown in a distinct "Next up" list below.

    4. **Empty state:**

      * If no task is active, display hint: *“Choose your next NOW”*.

Key Functionality

* **Selecting Active Task:**

  * Click any NOW task (from list) to make it the "active" focus item (highlighted, timer binds to it).

* **Timer Controls:**

  * **Start/Pause/Reset** functionality (visually clear controls).

  * **Running:** When timer is under 2 minutes, outer circle/border pulses gently (lime accent).

  * **Paused:** Use a different, slower pulse to indicate paused state.

* **Mark Complete:**

  * Complete the active task via a simple action/button:

    * Card is marked visually complete (checkmark and fade), and timer resets (25:00).

    * “Choose your next NOW” hint appears—user must manually pick the next task.

* **Demote Task:**

  * Provide a dropdown or icon next to each task to move it back to Today or Parking Lot.

* **Navigation Buttons:**

  * "Open Board" button: returns user to the Full TODAY Board frame.

  * "Meeting Mode" button: opens the Meeting Mode frame.

* **No auto-advance:** Finishing a task does not select the next NOW—user must choose.

Visuals

* **Accent usage:** Lime (timer, NOW highlight); Indigo (labels, borders).

* **Minimalist, accessible, clear controls.**

---

Per-task Timer Behavior

**Timer state is bound to the selected NOW task, not a global timer.**

* **Timer Association**

  * Timer always displays the countdown for the *currently selected Active NOW task only*.

  * Switching the Active task automatically pauses any running timer on the previous task and shows the timer/remaining time for the new selection.

* **Starting a Different NOW Task**

  * If that task has not run today, timer begins at **25:00**.

  * If previously paused, resumes from corresponding remaining time.

* **Switching Tasks with Timers Running**

  * Previously active task's remaining time is stored and shown on its card (e.g., badge *"20:00 left"*).

  * New task's timer loads up its last value and is start-ready.

* **Only One Running Timer**

  * Only one timer runs at any moment; switching tasks always pauses the previous.

* **Annotations**

  * Clearly annotate:  

    *“Timer state is per-task for the current day (remaining time + status). Focus Panel always shows the timer for the currently active NOW task, but each task keeps its own remaining time when paused.”*

---

NOW Card Progress Indicator

**Partial Progress Cues On NOW Cards**

* **Daily Board Frame:**

  * On any NOW card with elapsed time, display a **subtle progress indicator**:

    * *Thin horizontal bar* along the bottom edge;  

      *or*  

      *Small circular ring icon* at card corner, filling to percent complete.

    * Use a light Lime accent or neutral tone—visually subtle.

    * Add a tiny elapsed/remaining time label under the title (e.g., `5 min focused`, `20:00 left`).

  * On block completion, clear the indicator; optionally show `1 block done`.

* **Focus Panel Frame:**

  * "Next up" list shows the same partial progress cues—horizontal bar or ring, plus tiny elapsed/remaining label.

* **Design Notes:**

  * Keep indicators visually lightweight; accent with faint Lime/neutral only.

  * These are at-a-glance cues only.

---

### 3\. Meeting Mode (Revised)

Layout & Structure

* **Separate frame** for "meeting capture".

* **Header row:**

  * Meeting title, inline-editable or static (e.g., “Team Sync – June 21”)

  * *Small timer*, subtly styled.

* **Main area:**

  * **Single vertical list** labeled "Meeting notes".

  * Each item appears as a stacked row:

    * **Title** (main)

    * **Optional small note**

    * **Routing pill/toggle** with two states:

      * `Parking Lot` (default)

      * `Today` (toggleable)

  * **"+ Add item"** control at bottom for new items.

Controls & Interactions

* **Toggle Routing:** Routing pill switches between `Parking Lot` and `Today`, visually updating state. (Routing applies only when meeting ends.)

* **Remove Item:** Each row can be deleted via minimal icon.

* **Editing:** Inline editing on title and note.

Footer Controls

* **"End meeting"** primary action at bottom:

  * On click, confirms: "End meeting? This will distribute all meeting notes to Today and Parking Lot."

  * On confirmation, returns to the Daily Board; meeting items move to respective lists, and Meeting Mode is reset.

* **Back Navigation:**

  * Visible “Back to board” near the top; returning before "End meeting" preserves all in-progress notes and routing states.

---

Critical Meeting Mode Behaviors

* All notes are in a *single, vertically stacked list*—no columns or item type separation.

* Each item can be routed individually.

* **No sync to board until “End meeting” is clicked.**

  * If user navigates away and returns, state is restored as left.

* **After meeting ends:**

  * `Today`-routed items to Today list.

  * `Parking Lot`-routed items to Parking Lot list.

  * Meeting Mode is cleared.

---

### 4\. Interaction Table

---

### 5\. Pages & Frames to Include

* Full TODAY Board (main frame)

* Focus Panel (mini always-on-top companion window)

* Meeting Mode (unified meeting capture window)

* *Linked navigation flows as described (no project/board selection)*

---

## Accessibility, Visual, & Data Requirements

* Ensure strong contrast and legibility (light theme only).

* Use Inter font; Indigo for heads/accents, Lime for NOW/timer states.

* Do not surface any project, workspace, column, or assignment features.

* Simulate realistic flows and state with sample cards/tasks; annotate key prototype points, especially Meeting Mode outputs.

---

## Figma Make Prompt

**INSTRUCTIONS FOR FIGMA MAKE:**

Produce an interactive Figma prototype for FocusRails Web v1 as detailed above.

* **No project, board, kanban, or meta-management features**—*absolutely no generic columns, multiple boards, navigation, or assignments.*

* **TODAY Board:**

  * Three vertical sections: NOW (limit three), Today, Parking Lot—*single user's day only*.

  * For each task card, provide drag-and-drop *and* **quick-move button controls** at the bottom right, per the card quick-move controls spec:

    * **Today cards:**

      * `To NOW` and `To Parking Lot` buttons; `To NOW` disables (or annotates) if NOW is full.

    * **Parking Lot cards:**

      * `To Today` button; may include `To NOW` if simple, with disable/annotation if NOW full.

    * NOW cards include a small progress meta row under the description with a clock icon and label (e.g., "Just started"). This label is **automatic only** and should visually suggest progress based on focus sessions, not a numeric percentage.

  * Show at least the following example states in your designs: "Just started", "In progress", and an optional "Nearly done" state for heavier tasks.

  * Assume the label updates automatically based on focus time; designers should not add any manual controls for this.

  * When a task is marked complete in the NOW list, hide the progress label in the card and in any Done representation.

  * When a task is moved between NOW/Today/Parking Lot, preserve the current label; completion is the only thing that clears it.

    * `To Today` button only.

    * All buttons: small, gray icons; highlight on hover; labels via tooltip or annotation.

* **Partial Progress Indicators:**

  * Subtle horizontal bars or circular rings on NOW cards in Board and "Next up" in Focus Panel,

  * Elapsed/remaining mini-labels under titles,

  * Clear indicator on block completion,

  * Use faint Lime/neutral accent only.

* **Focus Panel:**

  * Timer is tied to currently active NOW task only,

  * Switching/focus/mark complete per per-task timer rules,

  * Animated timer border behaviors, "Next up" partial progress, demote task controls, no auto-advance.

* **Meeting Mode:**

  * Single "Meeting notes" list, routing pill per item, "+ Add item" at list bottom,

  * "End meeting" distributes notes as per routing, clears meeting list, and returns to Board,

  * Back navigation resumes meeting state.

* **Undo Behaviors:**

  * Show board toast on Mark Done (with Undo, restores task),

  * Show Focus Panel toast on completion (with Undo, restores task & timer),

  * Clearly annotate shortcut: **Undo last action (Ctrl+Z / Cmd+Z)**; acts as "Undo" for latest visible toast, or last undoable action,

  * No full history, just single-level undo.

* Use authentic FocusRails color palette; Inter font; light-mode visual; minimal navigation (top bar only).

* Prototype all key flows with annotations—drag/drop, quick-move, card add/edit, completion/undo, timer states and switching, progress cues, meeting item routing/capture/send, etc.

* **Absolutely do NOT implement or hint toward project management, kanban flows, or multi-discipline planning.**

  * *Focus on single-day, single-user, single-rail clarity and flow.*

---