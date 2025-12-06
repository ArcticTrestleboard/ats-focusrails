# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FocusRails is a personal productivity web application centered around a streamlined Today board for deep focus. It combines task management with a Pomodoro-style timer and real-time synchronization.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (opens at http://localhost:3000)
npm run dev

# Build for production (output: build/)
npm run build

# Preview production build
npm run preview
```

## Environment Setup

Required environment variables in `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_URL=http://localhost:3000
```

## Architecture

### Data Flow Architecture

The application uses a three-layer architecture:

1. **Supabase Layer** (src/lib/supabase.ts): Single Supabase client instance
2. **Hook Layer** (src/hooks/): Custom hooks manage data fetching, real-time subscriptions, and mutations
3. **Component Layer** (src/components/): React components consume hooks for data

Key principle: Components never call Supabase directly - all database operations go through hooks.

### Real-time Synchronization

The app maintains real-time sync across browser sessions via Supabase Realtime:

- `useTasks` hook subscribes to two channels: `tasks` and `timer_states`
- Changes in one session immediately propagate to all other sessions
- Local state updates happen optimistically, then reconcile with database
- Timer state updates sync in real-time to update progress bars across sessions

### Task State Management

Tasks have three list types in the database: `now`, `today`, `parking_lot`

The UI uses different naming: `now`, `today`, `parking` (without `_lot`)

**Critical**: Always map between UI and database formats using `mapListType()` and `reverseMapListType()` in App.tsx:
- Before database writes: UI → Database (`parking` → `parking_lot`)
- After database reads: Database → UI (`parking_lot` → `parking`)

### Position Management

Task positioning uses integer `position` field:
- Tasks ordered by `position` ASC within each list
- When adding tasks, use `Math.max(...currentList.map(t => t.position)) + 1`
- When reordering, update all affected task positions in sequence
- Never use array index directly as position - always derive from existing positions

### Timer Integration

Each task can have an associated timer state (1:1 relationship):
- Timer state stored in `timer_states` table with `task_id` foreign key
- `useTasks` joins timer state data into Task objects
- Timer properties on Task: `elapsed_seconds`, `is_timer_active`, `timer_started_at`, `remainingTime`
- Only NOW tasks can have active timers
- When tasks move from NOW, timer state persists but becomes inactive

### Undo System

Two types of undo actions:
1. `complete-board`: Task completed from TodayBoard
2. `complete-focus`: Task completed from FocusPanel (includes timer state)

Undo action stores:
- Original task object
- Source section and index
- For focus completions: previous timer state

**Important**: Completed tasks are immediately marked in database but kept in local `completedTasks` state for UI feedback until undo expires.

## Database Schema

### Core Tables

**tasks**: Main task storage
- `list_type`: Enum `'now' | 'today' | 'parking_lot'`
- `position`: Integer for ordering within list
- `is_completed`: Boolean for completion status
- Automatically includes `user_id` from auth context

**timer_states**: Per-task timer state
- `task_id`: Unique constraint (one timer per task)
- `elapsed_seconds`: Accumulated time in seconds
- `is_active`: Whether timer is currently running
- `started_at`: Timestamp when timer last started

**meeting_notes**: Temporary meeting mode storage (rarely used)

### Row Level Security

All tables use RLS policies to ensure users only access their own data via `auth.uid() = user_id` checks.

## Component Patterns

### Drag and Drop

Uses `react-dnd` with `HTML5Backend`:
- `TaskCard.tsx`: Implements both `useDrag` and `useDrop`
- `TaskSection.tsx`: Implements `useDrop` for list containers
- Drag type: `'TASK'` with `{ id, sourceSection }` payload
- Drop validates NOW list limit (max 3 tasks)

### Authentication Flow

1. User enters OAuth flow via `OAuthLogin.tsx`
2. Supabase redirects to provider (Google, GitHub, etc.)
3. Provider redirects back to `/board` with auth token
4. `useAuth` hook detects session and sets user
5. `AuthGuard` in App.tsx conditionally renders based on auth state

Error handling: URL hash params checked for auth errors on mount.

### List Type Constraints

**NOW List**: Maximum 3 tasks enforced in `moveTask()` and `addTask()`
- Check current length before allowing adds/moves
- Return early (silent fail) when limit reached
- Preserve existing tasks when reordering within NOW

**Other Lists**: Unlimited capacity

## Type Definitions

TypeScript types defined in `src/lib/types.ts`:

- `Database`: Generated from Supabase schema
- `Task`: Database row type + joined timer state fields + computed `remainingTime`
- `TimerState`: Timer state table row type
- `MeetingNote`: Meeting notes table row type

**Critical**: Never modify Task objects without understanding the joined timer state fields may be undefined.

## Common Patterns

### Adding a new task

```typescript
const { addTask } = useTasks(userId);

// Always pass list type in database format
await addTask(title, 'parking_lot', noteText, position);

// Let real-time subscription update UI, or manually refetch
await refetch();
```

### Moving tasks between lists

```typescript
const { moveTask } = useTasks(userId);

// Use database format for list type
await moveTask(taskId, 'today', targetPosition);
```

### Updating task properties

```typescript
const { updateTask } = useTasks(userId);

// Partial updates supported
await updateTask(taskId, {
  title: 'New title',
  note: 'Additional notes'
});
```

## Important Implementation Notes

1. **Real-time subscription cleanup**: Always return cleanup function from useEffect hooks that create subscriptions
2. **Position conflicts**: When inserting at specific position, reorder all subsequent items
3. **Timer accuracy**: Timer uses server timestamps (`started_at` + `elapsed_seconds`) to calculate progress, not client-side intervals
4. **Optimistic updates**: Local state updates happen immediately, database reconciliation happens async
5. **List limits**: Only NOW list has a 3-task limit - enforced client-side before database calls
6. **Completion workflow**: Tasks marked `is_completed: true` are filtered from main queries but kept for undo

## Testing Real-time Sync

1. Open app in two browser windows
2. Sign in with same account in both
3. Add/move/complete tasks in one window
4. Verify changes appear immediately in other window
5. Check browser console for WebSocket connection errors if sync fails

## Deployment Notes

- Build output directory: `build/` (configured in vite.config.ts)
- Environment variables must be prefixed with `VITE_`
- After deployment, update Supabase redirect URLs to include production domain
- For Vercel: Add `/board` route to redirect URLs
- Server runs on port 3000 (configurable in vite.config.ts)
