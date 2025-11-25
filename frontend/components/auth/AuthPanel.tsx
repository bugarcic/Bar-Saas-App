'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../../lib/supabaseClient';

export const AuthPanel: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleAuth = async (mode: 'signin' | 'signup') => {
    setIsSubmitting(true);
    setAuthMessage(null);
    try {
      const handler =
        mode === 'signin'
          ? supabase.auth.signInWithPassword({ email, password })
          : supabase.auth.signUp({ email, password });

      const { error } = await handler;
      if (error) {
        setAuthMessage(error.message);
        setMessageType('error');
      } else {
        setAuthMessage(mode === 'signin' ? 'Signed in successfully.' : 'Check your email to confirm sign up.');
        setMessageType('success');
      }
    } catch (error) {
      setAuthMessage((error as Error).message);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    };
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const goToApplication = () => {
    router.push('/application');
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-950">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Welcome Back</h1>
          <p className="text-sm text-slate-400">Sign in to continue your application</p>
        </div>
      </div>

      {session ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-3">
            <p className="text-sm text-slate-300">
              Signed in as <strong className="text-white">{session.user.email}</strong>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={goToApplication}
              className="flex-1 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-slate-100"
            >
              Go to My Application
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20"
              />
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => handleAuth('signin')}
                disabled={isSubmitting}
                className="w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
              <button
                onClick={() => handleAuth('signup')}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
          {authMessage && (
            <div className={`mt-4 rounded-lg px-4 py-3 text-sm ${
              messageType === 'error' 
                ? 'bg-red-900/50 border border-red-800 text-red-300'
                : messageType === 'success'
                ? 'bg-slate-800 border border-slate-700 text-slate-300'
                : 'bg-slate-800 border border-slate-700 text-slate-400'
            }`}>
              {authMessage}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuthPanel;
