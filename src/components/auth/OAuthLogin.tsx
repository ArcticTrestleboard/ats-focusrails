import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { GoogleIcon, GitHubIcon, MicrosoftIcon, AppleIcon, FacebookIcon } from './provider-icons';

interface OAuthLoginProps {
  initialError?: string;
}

type Provider = 'google' | 'github' | 'azure' | 'apple' | 'facebook';

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
    <div className="min-h-screen bg-white dark:bg-[#070815] flex items-center justify-center px-4 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Branding */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">FocusRails</h1>
          <p className="text-gray-600 dark:text-[#B7C0D8]">Get Focused, Stay Uncluttered</p>
        </div>

        {/* Privacy Promise */}
        <div className="bg-gray-50 dark:bg-[#161827] rounded-lg p-6 border border-gray-200 dark:border-[rgba(148,163,184,0.35)] transition-colors duration-200">
          <h2 className="text-sm font-medium text-gray-900 dark:text-[#F8FAFF] mb-2">Our Privacy Promise</h2>
          <ul className="text-sm text-gray-600 dark:text-[#B7C0D8] space-y-1">
            <li>• No analytics or tracking</li>
            <li>• No social features or sharing</li>
            <li>• Your data is yours alone</li>
            <li>• Deleted instantly when you want</li>
          </ul>
        </div>

        {/* OAuth Buttons */}
        <div className="bg-white dark:bg-[#161827] rounded-lg p-6 border-2 border-gray-200 dark:border-[rgba(148,163,184,0.35)] transition-colors duration-200">
          <h2 className="text-xl font-medium text-gray-900 dark:text-[#F8FAFF] mb-4">Sign in to your board</h2>

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
              className="w-full h-12 flex items-center justify-center gap-3 bg-white dark:bg-white border border-gray-300 dark:border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingProvider === 'google' ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-700" />
              ) : (
                <GoogleIcon />
              )}
              <span className="text-gray-900 font-medium">Continue with Google</span>
            </button>

            {/* GitHub */}
            <button
              onClick={() => handleOAuthSignIn('github')}
              disabled={loadingProvider !== null}
              className="w-full h-12 flex items-center justify-center gap-3 bg-[#24292E] border border-[#24292E] rounded-lg hover:bg-[#2F363D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingProvider === 'github' ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <GitHubIcon />
              )}
              <span className="text-white font-medium">Continue with GitHub</span>
            </button>

            {/* Microsoft */}
            <button
              onClick={() => handleOAuthSignIn('azure')}
              disabled={loadingProvider !== null}
              className="w-full h-12 flex items-center justify-center gap-3 bg-white dark:bg-white border border-gray-300 dark:border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingProvider === 'azure' ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-700" />
              ) : (
                <MicrosoftIcon />
              )}
              <span className="text-gray-900 font-medium">Continue with Microsoft</span>
            </button>

            {/* Apple */}
            <button
              onClick={() => handleOAuthSignIn('apple')}
              disabled={loadingProvider !== null}
              className="w-full h-12 flex items-center justify-center gap-3 bg-black border border-black rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingProvider === 'apple' ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <AppleIcon />
              )}
              <span className="text-white font-medium">Continue with Apple</span>
            </button>

            {/* Facebook */}
            <button
              onClick={() => handleOAuthSignIn('facebook')}
              disabled={loadingProvider !== null}
              className="w-full h-12 flex items-center justify-center gap-3 bg-[#1877F2] border border-[#1877F2] rounded-lg hover:bg-[#166FE5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingProvider === 'facebook' ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <FacebookIcon />
              )}
              <span className="text-white font-medium">Continue with Facebook</span>
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-500 dark:text-[#6E7690] text-center">
            OAuth providers are used for secure identity verification only. We never access your social data.
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-white dark:bg-[#161827] rounded-lg p-6 border border-gray-200 dark:border-[rgba(148,163,184,0.35)] transition-colors duration-200">
          <h3 className="text-sm font-medium text-gray-900 dark:text-[#F8FAFF] mb-3">How FocusRails works</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-[#B7C0D8]">
            <div>
              <span className="font-medium text-gray-900 dark:text-[#F8FAFF]">NOW:</span> Max 3 tasks for deep focus
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-[#F8FAFF]">Today:</span> Your daily intentions
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-[#F8FAFF]">Parking Lot:</span> Quick idea capture
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-[#F8FAFF]">Focus Timer:</span> 25-minute blocks
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-[#F8FAFF]">Meeting Mode:</span> Capture decisions in real-time
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
