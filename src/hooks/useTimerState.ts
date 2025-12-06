import { supabase } from '../lib/supabase';

export function useTimerState(userId: string | undefined) {
  // Update or create timer state for a task
  const updateTimerState = async (
    taskId: string,
    elapsedSeconds: number,
    isActive: boolean
  ) => {
    if (!userId) return { error: new Error('Not authenticated') };

    try {
      // Check if timer state exists
      const { data: existing } = await supabase
        .from('timer_states')
        .select('id')
        .eq('task_id', taskId)
        .single();

      if (existing) {
        // Update existing timer state
        const { error: updateError } = await supabase
          .from('timer_states')
          .update({
            elapsed_seconds: elapsedSeconds,
            is_active: isActive,
            started_at: isActive ? new Date().toISOString() : null,
          })
          .eq('task_id', taskId);

        if (updateError) throw updateError;
      } else {
        // Create new timer state
        const { error: insertError } = await supabase
          .from('timer_states')
          .insert({
            user_id: userId,
            task_id: taskId,
            elapsed_seconds: elapsedSeconds,
            is_active: isActive,
            started_at: isActive ? new Date().toISOString() : null,
          });

        if (insertError) throw insertError;
      }

      return { error: null };
    } catch (err) {
      console.error('Error updating timer state:', err);
      return { error: err as Error };
    }
  };

  // Reset timer state for a task (when completed or reset)
  const resetTimerState = async (taskId: string) => {
    if (!userId) return { error: new Error('Not authenticated') };

    try {
      const { error: updateError } = await supabase
        .from('timer_states')
        .update({
          elapsed_seconds: 0,
          is_active: false,
          started_at: null,
        })
        .eq('task_id', taskId);

      if (updateError) throw updateError;

      return { error: null };
    } catch (err) {
      console.error('Error resetting timer state:', err);
      return { error: err as Error };
    }
  };

  // Delete timer state for a task
  const deleteTimerState = async (taskId: string) => {
    if (!userId) return { error: new Error('Not authenticated') };

    try {
      const { error: deleteError } = await supabase
        .from('timer_states')
        .delete()
        .eq('task_id', taskId);

      if (deleteError) throw deleteError;

      return { error: null };
    } catch (err) {
      console.error('Error deleting timer state:', err);
      return { error: err as Error };
    }
  };

  return {
    updateTimerState,
    resetTimerState,
    deleteTimerState,
  };
}
