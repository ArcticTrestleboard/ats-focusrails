import { useState } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { GoogleIcon, GitHubIcon } from './provider-icons';

interface OAuthLoginProps {
  initialError?: string;
}

type Provider = 'google' | 'github';

export function OAuthLogin({ initialError }: OAuthLoginProps) {
  const { signInWithOAuth } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(initialError || null);

  const handleOAuthSignIn = async (provider: Provider) => {
    setLoadingProvider(provider);
    setError(null);

    const result = await signInWithOAuth(provider);

    if (result.error) {
      setError(result.error.message || 'Authentication failed. Please try again.');
      setLoadingProvider(null);
    }
    // Note: If successful, user will be redirected to OAuth provider
    // No need to clear loading state as component will unmount
  };

  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-[#070815] flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#070815]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            FocusRails
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSignIn(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => {/* TODO: Stripe integration */}}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors"
            >
              Purchase License
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center px-4 py-8 md:py-16 max-w-6xl mx-auto w-full">

        {/* Headline First */}
        <div className="text-center mb-6 md:mb-8 w-full">
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
            Three Tasks.<br/>Zero Overwhelm.
          </h1>
          <p className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">
            Finally get unstuck.
          </p>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Built for distracted brains. No future tasks, no projects, no tags—just rails to keep you on track today.
          </p>
        </div>

        {/* Privacy Callout - High Placement */}
        <div className="w-full max-w-2xl mb-8 bg-lime-50 dark:bg-lime-950/30 border-2 border-lime-600 dark:border-lime-500 rounded-lg p-4">
          <p className="text-center text-base md:text-lg font-bold text-gray-900 dark:text-white">
            100% local. No accounts. No data mining. Ever.
          </p>
        </div>

        {/* Product UI - LOUD */}
        <div className="w-full mb-8 md:mb-12 border-4 border-gray-900 dark:border-white rounded-none">
          <img
            src="/images/focus-rails-banner.jpeg"
            alt="FocusRails: NOW board with 3 tasks, Today list, Parking Lot, and 25-minute timer"
            className="w-full block"
            style={{
              imageRendering: '-webkit-optimize-contrast',
              filter: 'contrast(1.1) saturate(1.1)'
            }}
          />
        </div>

        {/* Constraint Philosophy - Above the Fold */}
        <div className="w-full max-w-3xl mb-12 text-center">
          <p className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            ADHD-friendly by design
          </p>
          <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            Max 3 active tasks. No endless lists. No future planning paralysis. Constraint creates calm.
          </p>
        </div>

      </div>

      {/* Sign In Modal */}
      {showSignIn && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowSignIn(false)}
        >
          <div
            className="bg-white dark:bg-[#161827] rounded-xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Sign In
              </h2>
              <button
                onClick={() => setShowSignIn(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {/* Google */}
              <button
                onClick={() => handleOAuthSignIn('google')}
                disabled={loadingProvider !== null}
                className="w-full h-14 flex items-center justify-center gap-3 bg-white dark:bg-white border-2 border-gray-900 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingProvider === 'google' ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-700" />
                ) : (
                  <GoogleIcon />
                )}
                <span className="text-gray-900 font-bold">Continue with Google</span>
              </button>

              {/* GitHub */}
              <button
                onClick={() => handleOAuthSignIn('github')}
                disabled={loadingProvider !== null}
                className="w-full h-14 flex items-center justify-center gap-3 bg-gray-900 border-2 border-gray-900 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingProvider === 'github' ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <GitHubIcon />
                )}
                <span className="text-white font-bold">Continue with GitHub</span>
              </button>
            </div>

            <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-500">
              Sign in to access your board. No signup, no credit card, no trial period.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
