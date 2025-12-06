import { useEffect, useState, useCallback } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Task, Database } from '../lib/types';

type TaskRow = Database['public']['Tables']['tasks']['Row'];

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch tasks with timer states
  const fetchTasks = useCallback(async () => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select(`
          *,
          timer_states (
            id,
            elapsed_seconds,
            is_active,
            started_at
          )
        `)
        .eq('user_id', userId)
        .eq('is_completed', false)
        .order('position', { ascending: true });

      if (fetchError) throw fetchError;

      // Transform data to include timer state fields
      const tasksWithTimerState = (data || []).map((task: any) => {
        // timer_states can be null, an object, or an array depending on the query
        const timerState = Array.isArray(task.timer_states)
          ? task.timer_states[0]
          : task.timer_states;
        return {
          ...task,
          timer_states: undefined, // Remove nested object
          timer_state_id: timerState?.id,
          elapsed_seconds: timerState?.elapsed_seconds || 0,
          is_timer_active: timerState?.is_active || false,
          timer_started_at: timerState?.started_at || null,
          // Calculate remaining time from elapsed seconds
          remainingTime: timerState?.elapsed_seconds
            ? Math.max(0, (25 * 60) - timerState.elapsed_seconds)
            : (25 * 60)
        };
      });

      setTasks(tasksWithTimerState);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Set up realtime subscription
  useEffect(() => {
    if (!userId) return;

    fetchTasks();

    const tasksChannel = supabase
      .channel('tasks-channel')
      .on<TaskRow>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<TaskRow>) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => [...prev, payload.new as Task]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? (payload.new as Task) : t))
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Subscribe to timer_states changes to update progress bars in real-time
    const timerStatesChannel = supabase
      .channel('timer-states-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'timer_states',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const timerState = payload.new;
            setTasks((prev) =>
              prev.map((task) => {
                if (task.id === timerState.task_id) {
                  return {
                    ...task,
                    elapsed_seconds: timerState.elapsed_seconds,
                    is_timer_active: timerState.is_active,
                    timer_started_at: timerState.started_at,
                    remainingTime: Math.max(0, (25 * 60) - timerState.elapsed_seconds),
                  };
                }
                return task;
              })
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(timerStatesChannel);
    };
  }, [userId, fetchTasks]);

  // Add task
  const addTask = async (
    title: string,
    listType: 'now' | 'today' | 'parking_lot',
    note = '',
    position = 0
  ) => {
    if (!userId) return { error: new Error('Not authenticated') };

    try {
      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          title,
          note,
          list_type: listType,
          position,
          is_completed: false,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return { data, error: null };
    } catch (err) {
      return { error: err as Error, data: null };
    }
  };

  // Update task
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (updateError) throw updateError;

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Move task
  const moveTask = async (
    taskId: string,
    targetListType: 'now' | 'today' | 'parking_lot',
    targetPosition: number
  ) => {
    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          list_type: targetListType,
          position: targetPosition,
        })
        .eq('id', taskId);

      if (updateError) throw updateError;

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Complete task
  const completeTask = async (taskId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ is_completed: true })
        .eq('id', taskId);

      if (updateError) throw updateError;

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (deleteError) throw deleteError;

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Get tasks by list type
  const getTasksByList = (listType: 'now' | 'today' | 'parking_lot') => {
    return tasks.filter((t) => t.list_type === listType);
  };

  const nowTasks = getTasksByList('now');
  const todayTasks = getTasksByList('today');
  const parkingLotTasks = getTasksByList('parking_lot');

  return {
    tasks,
    nowTasks,
    todayTasks,
    parkingLotTasks,
    loading,
    error,
    addTask,
    updateTask,
    moveTask,
    completeTask,
    deleteTask,
    refetch: fetchTasks,
  };
}
