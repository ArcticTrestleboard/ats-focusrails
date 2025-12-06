# FocusRails Web v1 — UX & Visual Specification

---

## Product Overview

FocusRails Web v1 is a personal productivity web application, built for desktop use, centered around a streamlined Today board for deep focus. The product is intentionally minimalist, enforcing just-in-time task capture, an enforced NOW (active) list, and ADHD-friendly constraints. Interactions, cues, and structures are designed to reduce noise, minimize cognitive load, and enable frictionless focus via any laptop or desktop browser.

**Core Principles:**

* **Desktop-Web, Desktop-First:** Primary user experience is optimized for laptops and desktops.

* **Today-Only:** Tasks are strictly for today—no weeks, future, or recurring items.

* **Single-Board System:** Each user has one canonical daily board, comprising NOW, Today, and Parking Lot lists.

* **Maximal Simplicity:** Fixed constraints, enforced limits, and minimal options.

* **No Analytics or Social Features:** Solely personal; all data is private.

---

## Platforms & Identity

* **Supported Platforms:** Desktop and laptop browsers (Web App). Companion mobile app planned for the future.

* **Account Model:**

  * **OAuth-Based Authentication:** Users sign in via Google, GitHub, Microsoft, Apple, or Facebook.

  * **No passwords, no email entry, no magic links.**

  * **Privacy-First:** OAuth providers only used for secure identity verification. We never access your social data or share your information.

  * No usernames, avatars, or social discovery.

* **Privacy Model:**

  * No analytics.

  * No external tracking.

  * Data exists solely to serve your board and sync across your own devices (see Privacy section below).

**Theming:**

* Light mode only. No user theming or dark mode settings.

* Brand colors are fixed and consistent across all surfaces.

---

## Data & Sync Model

* **Canonical Board:** Each user has one Today Board (no calendar, no week, no history).

* **Lists:**

  * **NOW** (max 3)

  * **Today** (unlimited)

  * **Parking Lot** (unlimited)

  * Meeting Mode artifacts and timer state are tied into the same board.

* **Sync Model:**

  * Real-time or near-real-time sync across all active browser sessions (and future devices).

  * Simple last-write-wins logic per update—no conflict resolution, no version history.

  * No collaboration or sharing.

* **Storage:**

  * Data is securely stored on the server for the purpose of powering and syncing the user’s board.

  * There is no export, import, backup, or data history.

* **Privacy:**

  * Data is never analyzed, resold, or shared.

  * Deleted instantly on account removal.

  * No integrations, no analytics, no third-party storage.

---

## Color System

*Accessibility: All color choices maintain at least 4.5:1 contrast.*

---

## Typography

* **All-caps** for primary list headers (NOW, TODAY, PARKING LOT).

* Letter spacing, padding, and font sizing tuned for large desktop screens.

* No user font customization.

---

## Core Screens & Flows

### 1\. Onboarding & Login

* **Flow:**

  1. **Welcome Screen:** Brief introduction to FocusRails ("Get Focused, Stay Uncluttered").

  2. **Privacy Promise:** Concise, plain-language statement emphasizing no analytics, tracking, or social features; data stored only for your personal use.

  3. **OAuth Provider Selection:**

    * User chooses from 5 secure sign-in options:

      * Google

      * GitHub

      * Microsoft

      * Apple

      * Facebook

    * Single-click authentication—no password required.

    * Providers only used for secure identity verification.

  4. **How It Works:** Visual walkthrough or guided sheet:

    * Board structure (NOW, Today, Parking Lot)

    * Focus Timer basics

    * Meeting Mode

  5. **Authentication:**

    * User clicks preferred OAuth provider button

    * Redirects to provider's secure login page

    * After authentication, returns to FocusRails board

    * Session persists across browser restarts

  6. **Skippable Content:** Core onboarding explanations are optional.

---

### 2\. Daily Board / Lists

**Screen Structure:**

* Single page with **three vertical lists**:

  1. **NOW** (max 3, always at top, accent highlight)

  2. **Today** (for today’s intentions, unlimited)

  3. **Parking Lot** (for quick distraction/idea capture)

* Lists always visible and vertically stacked; responsive for varying window sizes.

---

Card Controls & Quick-Move Interactions

**Quick-Move Controls:**

Each task card on the Daily Board includes **lightweight quick-move buttons** to enable seamless movement of tasks between the NOW, Today, and Parking Lot lists—directly from the card, without entering a full edit dialog.

**Behavior by List:**

* **Cards in Today:**

  * *Move to NOW*:

    * Show a small "Move to NOW" icon/button (upward arrow).

    * Tooltip on hover: "To NOW".

    * On click: Moves the task into the NOW list, respecting the NOW limit (max 3 tasks).

    * If the NOW list is full: Display a gentle, inline message on the card (e.g., “NOW is full—demote one to add”) instead of performing the move.

  * *Move to Parking Lot*:

    * Show a small "Move to Parking Lot" icon/button (downward or down/right arrow).

    * Tooltip on hover: "To Parking Lot".

    * On click: Moves the task to Parking Lot.

* **Cards in Parking Lot:**

  * *Move to Today*:

    * Show a small "Move to Today" button (upward arrow).

    * Tooltip on hover: "To Today".

    * On click: Moves the task to the Today list.

  * *Move to NOW* (optional, to reduce crowding):

    * If space is available in NOW, show a secondary "Move to NOW" quick button, accessible via a simple overflow menu (`...`).

    * Tooltip on hover: "To NOW".

    * Only visible if NOW is not full.

* **Cards in NOW:**

  * *Demote to Today:*

    * Show a subtle "Demote to Today" button (downward arrow).

    * Tooltip on hover: "To Today".

    * On click: Moves the task back to Today.

    * **No direct move to Parking Lot from NOW.** (Tasks must be demoted to Today before moving to Parking Lot to preserve a clear mental workflow.)

**Visual Treatment:**

* **Placement:** All quick-move controls appear in the **bottom-right corner** of each task card.

* **Design:** Use crisp, minimal, icon-only buttons. Avoid large or primary-colored buttons so cards remain visually clean and uncluttered.

* **Tooltips:** Every button includes a clear tooltip (e.g., "To NOW", "To Today", "To Parking Lot") with a short label shown on hover.

* **Feedback:** Invalid actions (such as trying to move to NOW when it's full) trigger a gentle, inline message rather than a disruptive modal or alert.

* **Accessibility:** All quick-move buttons are keyboard-accessible and labeled for screen readers.

**Quick-Move Controls Summary Table**

*Icons: ↑ = upward arrow, ↓ = downward arrow, … = overflow menu button*

---

Other Board Interactions

* **Add/Edit Item:** Floating "Add" button or inline entry. Input always defaults to Today, unless triggered as Parking Lot capture.

* **Move Item:** Drag-and-drop or quick-move controls as above. All moves to NOW enforce the max 3 rule.

* **Complete/Delete:** Checkbox or swipe for completion, trash for permanent removal.

* **Edit:** Inline or dialog; only task text editable—no priority, subtasks, etc.

* **Meeting Mode:** Accessed via main screen—opens as full-screen panel or modal.

---

Undo Behavior

* When a task is marked Done or moved into the Done state (from any list), a subtle banner appears at the bottom of the screen:*"Task marked done · Undo"*

  * Banner is small, unobtrusive, and persists for approximately 10–15 seconds.

  * Clicking **Undo** will immediately restore the task to its previous list and position.

  * If Undo is not clicked before the timeout, the banner disappears and the action becomes final for that session.

* **Global Undo:** Dedicated global undo command (see Shortcuts section) reverts the most recent undoable action.

---

* **Visuals:**

  * Subtle card shadows, soft-indented card styling, consistent color roles.

  * Highlighted accent for the NOW list.

  * Responsive layout, accessible tab order.

---

### 3\. Focus Panel / TODAY Board: NOW Card Progress Indicators

Enhanced NOW Card Progress Feedback

* **Partial Progress Indicator:**For each NOW task with an active or paused timer and some elapsed time in the current 25-minute block, display a *subtle partial progress indicator* on the NOW card. This indicator communicates real-time focus progress for that task.

  * **Visuals:** Thin circular ring around the card icon or a slim progress bar at the edge, using muted color (neutral Slate or low-opacity Lime). Caption text below task title (e.g., '5 min focused' or '20:00 left') indicates progress.

  * **Logic:** Indicator appears for any NOW task with a non-zero, non-complete focus block. Hidden if timer hasn't started. Clears upon completing the focus block.

---

Focus Timer / Focus Panel Behavior

* Per-NOW-task focus timer (25:00 default) with persistent state per day.

* Only one NOW task timer active at a time; switching pauses the current.

* All timer states are retained individually per NOW task and reset at end of day or upon completion.

---

### 4\. Meeting Mode

* **Meeting notes:** One vertical list with title, optional note, and routing pill (“Today” or “Parking Lot”). Items are routed after ending the meeting.

* **Preservation:** Meeting notes persist until meeting is ended; changing app sections does not discard in-process notes.

* **End Meeting:** All notes are moved to their routed lists. Notes are tagged `[Meeting]`.

---

## UX Principles & Constraints

* **Enforced Simplicity**: Three lists, today-only, no future/past boards or features.

* **Low Cognitive Load**: Visual clarity, minimum distractions, no notification clutter.

* **Respect for Privacy**: No analytics, sharing, or external connections.

* **Accessibility:** Minimum 4.5:1 contrast, keyboard accessible, screenreader labeled.

* **No Feature Bloat:** No tags, reminders, multi-board, theming, or advanced options.

* **Sync Resilience:** Optimistic, real-time sync with simple last-write-wins model.

---

## Shortcuts & Productivity Aids

---

## Open Questions & Future Work

---

## Appendix: Features Explicitly Omitted in v1

* Calendar navigation or week/task history

* Task recurrence, reminders, routines

* Projects, workflows, tagging, grouping

* Any user profile, personalization, or sharing

* Analytics, integrations, notifications

* Theming, color preferences, advanced settings

---

*End of FocusRails Web v1 UX & Visual Specification.*