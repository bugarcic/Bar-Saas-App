'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineCog, HiOutlineX, HiOutlineExclamation } from 'react-icons/hi';
import supabase from '../lib/supabaseClient';
import { useApplicationStore } from '../store/useApplicationStore';
import { saveDraft } from '../lib/api';

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
  const userId = useApplicationStore((state) => state.userId);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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

  const handleResetApplication = async () => {
    if (!window.confirm('Are you sure you want to reset your application? This action cannot be undone and will delete all your progress.')) {
      return;
    }

    try {
      setIsResetting(true);
      
      // Clear server-side draft if user is logged in
      if (userId) {
        await saveDraft(userId, {});
      }
      
      // Clear local store
      if (resetStore) {
        resetStore();
      }
      
      // Close modal and reload to ensure clean state
      setIsSettingsOpen(false);
      window.location.reload();
      
    } catch (error) {
      console.error('Error resetting application:', error);
      alert('Failed to reset application. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-3 lg:px-12 relative z-20">
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
              <div className="flex items-center gap-3">
                <span className="hidden text-sm text-slate-400 sm:inline">{userEmail}</span>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                  title="User Settings"
                >
                  <HiOutlineCog className="h-5 w-5" />
                </button>
              </div>
              
              <div className="h-4 w-px bg-slate-800 mx-1" />
              
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

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">User Settings</h2>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Account Email
                </label>
                <div className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300">
                  {userEmail}
                </div>
              </div>

              <div className="rounded-lg border border-red-900/30 bg-red-900/10 p-4">
                <div className="flex items-start gap-3">
                  <HiOutlineExclamation className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-red-400">Reset Application Data</h4>
                    <p className="text-xs text-red-300/80">
                      This will permanently delete all your progress and entered data. This action cannot be undone.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleResetApplication}
                  disabled={isResetting}
                  className="mt-4 w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isResetting ? 'Resetting...' : 'Reset Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppHeader;
