// Database types for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          note: string
          list_type: 'now' | 'today' | 'parking_lot'
          position: number
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          title: string
          note?: string
          list_type: 'now' | 'today' | 'parking_lot'
          position: number
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          note?: string
          list_type?: 'now' | 'today' | 'parking_lot'
          position?: number
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      timer_states: {
        Row: {
          id: string
          user_id: string
          task_id: string
          elapsed_seconds: number
          is_active: boolean
          started_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          task_id: string
          elapsed_seconds?: number
          is_active?: boolean
          started_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string
          elapsed_seconds?: number
          is_active?: boolean
          started_at?: string | null
          updated_at?: string
        }
      }
      meeting_notes: {
        Row: {
          id: string
          user_id: string
          title: string
          note: string
          target_list: 'today' | 'parking_lot'
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          title: string
          note?: string
          target_list: 'today' | 'parking_lot'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          note?: string
          target_list?: 'today' | 'parking_lot'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Application types
export type Task = Database['public']['Tables']['tasks']['Row'] & {
  // Timer state fields (from timer_states table join)
  timer_state_id?: string
  elapsed_seconds?: number
  is_timer_active?: boolean
  timer_started_at?: string | null
  // Computed field for UI
  remainingTime?: number // Calculated as (25 * 60) - elapsed_seconds
}

export type TimerState = Database['public']['Tables']['timer_states']['Row']
export type MeetingNote = Database['public']['Tables']['meeting_notes']['Row']
