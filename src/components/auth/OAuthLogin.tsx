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
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-4xl mx-auto w-full">
        {/* Product UI Banner */}
        <div className="w-full mb-12">
          <img
            src="/images/focus-rails-banner.jpeg"
            alt="FocusRails product interface showing NOW, Today, and Parking Lot boards"
            className="w-full rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800"
          />
        </div>

        {/* Tagline */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          FocusRails
        </h1>

        {/* Value Prop - Brutally Clear */}
        <div className="text-center mb-12 max-w-xl">
          <p className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-3">
            Three lists. No chaos.
          </p>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Get out of your own way.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            No future planning. No projects. Just today.
          </p>
        </div>

        {/* How it works - 1-2-3 Steps */}
        <div className="w-full max-w-3xl mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-3">1</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Add</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Put max 3 tasks in NOW. Everything else goes to Today or Parking Lot.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-3">2</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Focus</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Start timer. Work for 25 minutes. No switching. No distractions.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-3">3</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Capture</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                New idea mid-focus? Drop it in Parking Lot. Don't break flow.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Guarantee - Up Front */}
        <div className="w-full max-w-2xl mb-12 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-gray-700 dark:text-gray-300 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Your data stays yours
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                No analytics. No tracking. No data mining. Your tasks sync to your account only.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Delete anytime—instant, permanent, no questions asked.
              </p>
            </div>
          </div>
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
