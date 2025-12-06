import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { MeetingNote } from '../lib/types';

export function useMeetingNotes(userId: string | undefined) {
  const [notes, setNotes] = useState<MeetingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch meeting notes
  const fetchNotes = useCallback(async () => {
    if (!userId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('meeting_notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setNotes(data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching meeting notes:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Add meeting note
  const addNote = async (
    title: string,
    note: string,
    targetList: 'today' | 'parking_lot'
  ) => {
    if (!userId) return { error: new Error('Not authenticated') };

    try {
      const { data, error: insertError } = await supabase
        .from('meeting_notes')
        .insert({
          user_id: userId,
          title,
          note,
          target_list: targetList,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return { data, error: null };
    } catch (err) {
      return { error: err as Error, data: null };
    }
  };

  // Update meeting note
  const updateNote = async (noteId: string, updates: Partial<MeetingNote>) => {
    try {
      const { error: updateError } = await supabase
        .from('meeting_notes')
        .update(updates)
        .eq('id', noteId);

      if (updateError) throw updateError;

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Delete meeting note
  const deleteNote = async (noteId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('meeting_notes')
        .delete()
        .eq('id', noteId);

      if (deleteError) throw deleteError;

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Clear all meeting notes
  const clearAllNotes = async () => {
    if (!userId) return { error: new Error('Not authenticated') };

    try {
      const { error: deleteError } = await supabase
        .from('meeting_notes')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      setNotes([]);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
    clearAllNotes,
    refetch: fetchNotes,
  };
}
