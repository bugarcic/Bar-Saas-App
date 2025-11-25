'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../lib/supabaseClient';
import { useApplicationStore } from '../store/useApplicationStore';

interface AppHeaderProps {
  showAuth?: boolean;
  onLoginClick?: () => void;
  onBackClick?: () => void;
  userEmail?: string | null;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  showAuth = false,
  onLoginClick,
  onBackClick,
  userEmail,
}) => {
  const router = useRouter();
  const resetStore = useApplicationStore((state) => state.reset);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // Reset the application store
      if (resetStore) {
        resetStore();
      }
      // Force navigation to home
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      // Still try to navigate even if sign out fails
      window.location.href = '/';
    }
  };

  const handleHelp = () => {
    // Placeholder for help functionality
    alert('Help documentation coming soon!');
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-3 lg:px-12">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-950">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <span className="text-base font-semibold text-white">BarSaas</span>
      </div>

      <nav className="flex items-center gap-4">
        {onBackClick && (
          <button
            onClick={onBackClick}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
        )}

        {userEmail ? (
          <>
            <span className="hidden text-sm text-slate-400 sm:inline">{userEmail}</span>
            <button
              onClick={handleHelp}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Help
            </button>
            <button
              onClick={handleSignOut}
              className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 hover:border-slate-600 hover:bg-slate-700 transition-colors"
            >
              Log Out
            </button>
          </>
        ) : showAuth ? (
          <>
            <button
              onClick={onLoginClick}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Log In
            </button>
            <button
              onClick={onLoginClick}
              className="rounded-md bg-white px-4 py-1.5 text-sm font-semibold text-slate-950 hover:bg-slate-100 transition-colors"
            >
              Get Started
            </button>
          </>
        ) : null}
      </nav>
    </header>
  );
};

export default AppHeader;

