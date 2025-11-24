'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../../lib/supabaseClient';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';

export const AuthPanel: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState<string | null>(null);
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
      } else {
        setAuthMessage(mode === 'signin' ? 'Signed in successfully.' : 'Check your email to confirm sign up.');
      }
    } catch (error) {
      setAuthMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    };
  };

  const handleGoogle = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${origin}/application` },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const goToApplication = () => {
    router.push('/application');
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
      <h1 className="text-xl font-semibold text-slate-900">Bar Admission Portal</h1>
      <p className="mt-1 text-sm text-slate-600">Sign in or create an account to continue.</p>

      {session ? (
        <div className="mt-6 space-y-4">
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            Signed in as <strong>{session.user.email}</strong>
          </p>
          <div className="flex gap-3">
            <Button onClick={goToApplication} className="flex-1">
              Go to My Application
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="flex-1">
              Sign Out
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="flex-1" onClick={() => handleAuth('signin')} disabled={isSubmitting}>
                Sign In
              </Button>
              <Button className="flex-1" variant="secondary" onClick={() => handleAuth('signup')} disabled={isSubmitting}>
                Create Account
              </Button>
            </div>
            <Button variant="outline" onClick={handleGoogle}>
              Continue with Google
            </Button>
          </div>
          {authMessage && <p className="mt-4 text-sm text-slate-600">{authMessage}</p>}
        </>
      )}
    </div>
  );
};

export default AuthPanel;

