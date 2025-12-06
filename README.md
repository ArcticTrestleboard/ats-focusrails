# FocusRails Web v1

A personal productivity web application centered around a streamlined Today board for deep focus. Built with Vite + React + TypeScript + Supabase.

## Features

- **NOW List**: Max 3 tasks for deep focus
- **Today List**: Your daily intentions (unlimited)
- **Parking Lot**: Quick idea/distraction capture (unlimited)
- **Focus Timer**: 25-minute Pomodoro-style timer with per-task state
- **Meeting Mode**: Capture meeting decisions and route to Today/Parking Lot
- **Real-time Sync**: Sync across all your browser sessions
- **Magic Link Auth**: Passwordless email authentication
- **Privacy-First**: No analytics, no tracking, no social features

## Tech Stack

- **Frontend**: Vite + React 18 + TypeScript
- **Backend**: Supabase (PostgreSQL + Real-time + Auth)
- **Styling**: Tailwind CSS + Radix UI
- **Icons**: Lucide React
- **Drag & Drop**: react-dnd

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Supabase account (free tier works great)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

#### Create a New Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Project Name**: focusrails
   - **Database Password**: (choose a strong password)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is sufficient

#### Run the Database Migration

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run" to execute the migration

This will create:
- `tasks` table (for NOW, Today, Parking Lot items)
- `timer_states` table (for per-task focus timer state)
- `meeting_notes` table (for meeting mode items)
- Row-Level Security (RLS) policies
- Indexes for performance
- Triggers for auto-updating timestamps

#### Configure Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Ensure **Email** is enabled
3. Configure email templates (optional but recommended):
   - Go to **Authentication** → **Email Templates**
   - Customize the "Magic Link" template if desired
4. For production, configure a custom SMTP provider:
   - Go to **Project Settings** → **Auth**
   - Scroll to "SMTP Settings"
   - Add your email service credentials (SendGrid, Resend, etc.)

#### Get Your Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_APP_URL=http://localhost:3000
   ```

### 4. Run the Development Server

```bash
npm run dev
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
focusrails/
├── src/
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   │   ├── AuthGuard.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   └── MagicLinkSent.tsx
│   │   ├── ui/                # Radix UI components
│   │   ├── FocusPanel.tsx     # Timer sidebar panel
│   │   ├── MeetingMode.tsx    # Meeting capture mode
│   │   ├── TaskCard.tsx       # Individual task card
│   │   ├── TaskSection.tsx    # List section wrapper
│   │   ├── TodayBoard.tsx     # Main board view
│   │   └── UndoToast.tsx      # Undo notification
│   ├── hooks/
│   │   ├── useAuth.ts         # Authentication hook
│   │   ├── useTasks.ts        # Tasks CRUD + real-time
│   │   └── useMeetingNotes.ts # Meeting notes CRUD
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client
│   │   └── types.ts           # TypeScript types
│   ├── styles/
│   │   └── globals.css        # Global styles
│   ├── App.tsx                # Main app component
│   └── main.tsx               # Entry point
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── .env.example
├── package.json
└── vite.config.ts
```

## Development Workflow

### Testing Authentication

1. Run the dev server
2. Enter your email in the login form
3. Check your email inbox (or spam folder)
4. Click the magic link
5. You'll be redirected back to the app and authenticated

### Testing Real-time Sync

1. Open the app in two browser windows (or incognito + regular)
2. Sign in with the same email in both
3. Add/edit/move tasks in one window
4. Changes should appear instantly in the other window

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_URL` (your production URL, e.g., `https://focusrails.vercel.app`)
5. Deploy

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import your repository
4. Build command: `npm run build`
5. Publish directory: `build`
6. Add environment variables (same as Vercel)
7. Deploy

### Update Supabase Redirect URLs

After deployment, update your Supabase project:

1. Go to **Authentication** → **URL Configuration**
2. Add your production URL to **Redirect URLs**:
   - `https://your-domain.com/board`
3. Update **Site URL** to your production domain

## Database Schema

### tasks

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| text | TEXT | Task title |
| note | TEXT | Optional note |
| list_type | TEXT | 'now', 'today', or 'parking_lot' |
| position | INTEGER | Order within list |
| is_completed | BOOLEAN | Completion status |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### timer_states

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| task_id | UUID | Foreign key to tasks |
| elapsed_seconds | INTEGER | Time elapsed in current block |
| is_active | BOOLEAN | Timer running state |
| started_at | TIMESTAMPTZ | When timer was started |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### meeting_notes

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| title | TEXT | Note title |
| note | TEXT | Note content |
| target_list | TEXT | 'today' or 'parking_lot' |
| created_at | TIMESTAMPTZ | Creation timestamp |

## Troubleshooting

### "Missing Supabase environment variables" error

- Make sure `.env` file exists in the root directory
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart the dev server after changing `.env`

### Magic link email not received

- Check spam/junk folder
- Verify email is enabled in Supabase Auth settings
- For production, configure custom SMTP in Supabase

### Real-time updates not working

- Check browser console for WebSocket errors
- Verify RLS policies are correctly set up
- Ensure you're using the same user account in both windows

### Database migration fails

- Check that you're copying the entire SQL file
- Make sure there are no existing tables with the same names
- Check Supabase logs for specific error messages

## Support

For issues or questions:
- Check the [Supabase documentation](https://supabase.com/docs)
- Review the FocusRails visual spec: `docs/focusrails-visual-spec.md`

## License

Private - All rights reserved
