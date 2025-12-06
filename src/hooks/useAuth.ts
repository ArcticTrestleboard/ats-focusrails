import { useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type Provider = 'google' | 'github' | 'azure' | 'apple' | 'facebook';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    // Check for auth errors in URL hash (from magic link redirects)
    const checkUrlError = () => {
      const hash = window.location.hash;
      if (hash.includes('error=')) {
        const params = new URLSearchParams(hash.substring(1));
        const errorCode = params.get('error_code');
        const errorDescription = params.get('error_description');

        if (errorCode || errorDescription) {
          const authError: AuthError = {
            name: errorCode || 'auth_error',
            message: errorDescription?.replace(/\+/g, ' ') || 'Authentication failed',
            status: 400,
          };
          setError(authError);

          // Clear the error from URL
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    };

    checkUrlError();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithOAuth = async (provider: Provider) => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/board`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      setError(error);
      return { error };
    }

    return { error: null };
  };

  const signOut = async () => {
    setError(null);
    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error);
      return { error };
    }

    return { error: null };
  };

  return {
    user,
    loading,
    error,
    signInWithOAuth,
    signOut,
    isAuthenticated: !!user,
  };
}
