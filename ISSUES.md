# Known Issues

## Drag and Drop Reordering

**Status:** Needs improvement
**Priority:** Medium
**Affected Component:** Task reordering within same list

### Description
When dragging and dropping tasks to reorder them within the same list (e.g., reordering tasks within the "Today" section), the reordering logic doesn't work correctly. The task positions don't update as expected.

### Current Behavior
- Dragging a task to a new position within the same list triggers the move logic
- Database is updated with new positions
- UI may not reflect the correct order consistently

### Expected Behavior
- Tasks should be smoothly reorderable via drag and drop within the same list
- Visual feedback should be immediate
- Order should persist after page reload

### Technical Details
- Location: `src/App.tsx:172-191` (moveTask function, same-list reordering logic)
- The logic attempts to reorder by:
  1. Detecting same-list moves
  2. Removing task from current position
  3. Inserting at target position
  4. Updating all positions in the list

### Workarounds
- Quick move buttons (To NOW, To Today, To Parking Lot) work correctly for moving between lists
- Drag and drop between different lists works correctly

### Investigation Notes
- Network requests show multiple PATCH operations updating positions
- May need to optimize the position calculation algorithm
- Consider debouncing or batching position updates
- React DnD integration may need adjustment for same-list drops

### Related Files
- `src/App.tsx` - moveTask function
- `src/components/TaskCard.tsx` - Drag source/target configuration
- `src/components/TaskSection.tsx` - Drop zone configuration
- `src/hooks/useTasks.ts` - Task data management

---

## Per-Task Timer State Not Persisting

**Status:** Critical - Not Implemented According to Spec
**Priority:** High
**Affected Component:** Focus Panel timer, NOW card progress indicators
**Spec References:**
- `docs/figma-prototype.md` lines 209-241 (Per-task Timer Behavior)
- `docs/focusrails-visual-spec.md` lines 265-285 (Focus Panel / Timer State)

### Description
The timer state is not being properly persisted to the database, violating the core specification requirement that "Timer state is per-task for the current day (remaining time + status)". Currently, timer state is stored only in client-side state (`remainingTime` field on Task object), which means:
- Timer state is lost on page reload
- Timer state is not synced across browser sessions
- Each task's individual timer progress is not maintained across the day

### Current Behavior
1. Timer state is stored as `remainingTime` in client-side Task object (see `src/lib/types.ts:118`)
2. FocusPanel attempts to save timer state via `onUpdateTask` callback (`src/components/FocusPanel.tsx:62-66`)
3. However, the `tasks` table schema has NO `remaining_time` column (see `supabase/migrations/001_initial_schema.sql:5-15`)
4. The `timer_states` table EXISTS in the database but is NEVER used (`supabase/migrations/001_initial_schema.sql:17-27`)
5. Timer state is lost on page reload

### Expected Behavior (Per Specification)
**From figma-prototype.md:**
- "Timer state is bound to the selected NOW task, not a global timer"
- "Timer always displays the countdown for the currently selected Active NOW task only"
- "Switching the Active task automatically pauses any running timer on the previous task and shows the timer/remaining time for the new selection"
- "If that task has not run today, timer begins at 25:00"
- "If previously paused, resumes from corresponding remaining time"
- "Previously active task's remaining time is stored and shown on its card (e.g., badge '20:00 left')"
- "Only one timer runs at any moment; switching tasks always pauses the previous"
- "Timer state is per-task for the current day (remaining time + status)"

**From focusrails-visual-spec.md:**
- "Per-NOW-task focus timer (25:00 default) with persistent state per day"
- "Only one NOW task timer active at a time; switching pauses the current"
- "All timer states are retained individually per NOW task and reset at end of day or upon completion"

### Required Implementation
1. **Use the `timer_states` table:**
   - Store `elapsed_seconds` (25*60 - remainingSeconds)
   - Store `is_active` (whether timer is currently running)
   - Store `started_at` (when current timer session started)
   - Unique constraint per `task_id` already exists

2. **Update data flow:**
   - When loading tasks, JOIN with `timer_states` to get timer data
   - Calculate `remainingTime` as `(25 * 60) - elapsed_seconds`
   - When timer updates, persist to `timer_states` table
   - When switching active task, save current timer state before loading next

3. **Update types:**
   - Task type should include `timerState?: TimerState` joined data
   - Or calculate `remainingTime` from joined `elapsed_seconds`

4. **NOW Card Progress Indicators:**
   - Show progress bar/ring for tasks with `elapsed_seconds > 0`
   - Display label like "5 min focused" or "20:00 left" calculated from `elapsed_seconds`
   - Clear indicator when task is completed

### Technical Details
**Database Schema (Already Exists):**
```sql
CREATE TABLE timer_states (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  task_id UUID REFERENCES tasks(id),  -- UNIQUE constraint
  elapsed_seconds INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Files Requiring Changes:**
1. `src/lib/types.ts` - Update Task type to include timer state from database
2. `src/hooks/useTasks.ts` - Add timer state loading/saving logic
3. `src/components/FocusPanel.tsx` - Update to use persisted timer state
4. `src/components/TaskCard.tsx` - Show progress indicators on NOW cards
5. `src/App.tsx` - Handle timer state updates in task operations

### Workarounds
None - This is a fundamental architectural issue that requires proper implementation.

### Related Spec Requirements
**Progress Indicators (figma-prototype.md lines 243-272):**
- Subtle progress indicator on NOW cards with elapsed time
- Thin horizontal bar along bottom edge OR small circular ring
- Tiny elapsed/remaining time label (e.g., "5 min focused", "20:00 left")
- Light Lime accent or neutral tone
- Clear indicator on block completion

**Focus Panel Next Up List:**
- Show same partial progress cues for queued NOW tasks
- Horizontal bar or ring plus tiny elapsed/remaining label

### Impact
- HIGH: Core feature not working as specified
- Users cannot maintain focus session progress across page reloads
- Timer state is not synced across devices/sessions
- Progress indicators cannot show accurate time spent

---

_Last Updated: 2025-12-05_
