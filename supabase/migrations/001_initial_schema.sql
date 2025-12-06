-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  note TEXT DEFAULT '',
  list_type TEXT NOT NULL CHECK (list_type IN ('now', 'today', 'parking_lot')),
  position INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create timer_states table
CREATE TABLE timer_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  elapsed_seconds INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(task_id)
);

-- Create meeting_notes table
CREATE TABLE meeting_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  note TEXT DEFAULT '',
  target_list TEXT CHECK (target_list IN ('today', 'parking_lot')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_list_type ON tasks(list_type);
CREATE INDEX idx_tasks_user_list ON tasks(user_id, list_type);
CREATE INDEX idx_timer_states_user_id ON timer_states(user_id);
CREATE INDEX idx_timer_states_task_id ON timer_states(task_id);
CREATE INDEX idx_meeting_notes_user_id ON meeting_notes(user_id);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timer_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_notes ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies for tasks
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Row Level Security Policies for timer_states
CREATE POLICY "Users can view own timer states"
  ON timer_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timer states"
  ON timer_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timer states"
  ON timer_states FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own timer states"
  ON timer_states FOR DELETE
  USING (auth.uid() = user_id);

-- Row Level Security Policies for meeting_notes
CREATE POLICY "Users can view own meeting notes"
  ON meeting_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meeting notes"
  ON meeting_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meeting notes"
  ON meeting_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meeting notes"
  ON meeting_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timer_states_updated_at
  BEFORE UPDATE ON timer_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
