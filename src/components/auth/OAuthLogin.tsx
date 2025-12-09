import { useState } from 'react';
import { Loader2, Shield, Zap, Target, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { GoogleIcon, GitHubIcon } from './provider-icons';
import { FocusRailsBanner } from './FocusRailsBanner';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:bg-gradient-to-br dark:from-[#070815] dark:via-[#0a0e1f] dark:to-[#0f0a1f] flex items-center justify-center px-4 py-12 transition-colors duration-200">
      <div className="max-w-4xl w-full space-y-8">
        {/* Banner Image */}
        <div className="mb-8">
          <FocusRailsBanner />
        </div>

        {/* Logo/Branding */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            FocusRails
          </h1>
          <p className="text-xl text-gray-600 dark:text-[#B7C0D8] font-medium">
            Get Focused, Stay Uncluttered
          </p>
          <p className="text-sm text-gray-500 dark:text-[#6E7690] max-w-lg mx-auto">
            Your productivity command center. Three active tasks. Zero distractions. Pure focus.
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Left column - Sign in */}
          <div className="space-y-6">
            {/* OAuth Buttons */}
            <div className="bg-white/80 dark:bg-[#161827]/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-[rgba(148,163,184,0.35)] shadow-xl shadow-indigo-100/50 dark:shadow-none transition-all duration-200 hover:shadow-2xl hover:shadow-indigo-200/50">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#F8FAFF] mb-6">
                Sign in to your board
              </h2>

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
                  className="w-full h-14 flex items-center justify-center gap-3 bg-white dark:bg-white border-2 border-gray-300 dark:border-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-50 hover:border-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {loadingProvider === 'google' ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-700" />
                  ) : (
                    <GoogleIcon />
                  )}
                  <span className="text-gray-900 font-semibold">Continue with Google</span>
                </button>

                {/* GitHub */}
                <button
                  onClick={() => handleOAuthSignIn('github')}
                  disabled={loadingProvider !== null}
                  className="w-full h-14 flex items-center justify-center gap-3 bg-gray-900 border-2 border-gray-900 rounded-xl hover:bg-gray-800 hover:border-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {loadingProvider === 'github' ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <GitHubIcon />
                  )}
                  <span className="text-white font-semibold">Continue with GitHub</span>
                </button>
              </div>

              <p className="mt-6 text-xs text-gray-500 dark:text-[#6E7690] text-center leading-relaxed">
                <Shield className="inline w-3 h-3 mr-1" />
                Secure OAuth authentication. We never access your social data.
              </p>
            </div>

            {/* Privacy Promise */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-[#161827] dark:to-[#1a1535] rounded-2xl p-6 border border-indigo-200/50 dark:border-[rgba(148,163,184,0.35)] transition-colors duration-200">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-[#F8FAFF]">
                  Privacy First
                </h2>
              </div>
              <ul className="text-sm text-gray-700 dark:text-[#B7C0D8] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">✓</span>
                  <span>No analytics or tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">✓</span>
                  <span>No social features or sharing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">✓</span>
                  <span>Your data is yours alone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">✓</span>
                  <span>Deleted instantly when you want</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right column - Features */}
          <div className="space-y-6">
            {/* How It Works */}
            <div className="bg-white/80 dark:bg-[#161827]/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-[rgba(148,163,184,0.35)] shadow-xl shadow-purple-100/50 dark:shadow-none transition-all duration-200">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-[#F8FAFF] mb-6">
                How FocusRails works
              </h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-lime-600 dark:text-lime-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-[#F8FAFF] mb-1">NOW</h4>
                    <p className="text-sm text-gray-600 dark:text-[#B7C0D8]">
                      Max 3 tasks for deep focus. No overwhelm, just action.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-[#F8FAFF] mb-1">Today</h4>
                    <p className="text-sm text-gray-600 dark:text-[#B7C0D8]">
                      Your daily intentions and priorities in one place.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-[#F8FAFF] mb-1">Parking Lot</h4>
                    <p className="text-sm text-gray-600 dark:text-[#B7C0D8]">
                      Quick idea capture without breaking your flow.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-[#F8FAFF] mb-1">Focus Timer</h4>
                    <p className="text-sm text-gray-600 dark:text-[#B7C0D8]">
                      25-minute Pomodoro blocks to maximize productivity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
