'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../../lib/supabaseClient';
import WizardLayout from '../../components/WizardLayout';
import Group1Personal from '../../components/groups/Group1Personal';
import { useApplicationStore } from '../../store/useApplicationStore';
import { initSession } from '../../lib/api';

export default function ApplicationPage() {
  const router = useRouter();
  const currentStep = useApplicationStore((state) => state.currentStep);
  const setUserId = useApplicationStore((state) => state.setUserId);
  const userId = useApplicationStore((state) => state.userId);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        const session = data.session;
        if (!session?.user) {
          router.replace('/');
          return;
        }
        setSessionChecked(true);
        setSessionError(null);
        const supabaseUserId = session.user.id;
        setUserId(supabaseUserId);
        initSession(supabaseUserId, session.user.email ?? undefined).catch((error) => {
          console.error('Failed to init session', error);
          setSessionError('Unable to initialize user session.');
        });
      })
      .catch((error) => {
        console.error(error);
        setSessionError('Unable to verify authentication.');
        router.replace('/');
      });

    return () => {
      active = false;
    };
  }, [router, setUserId]);

  if (!sessionChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Loading your application...</p>
      </main>
    );
  }

  return (
    <WizardLayout title="New Application Wizard">
      {sessionError && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{sessionError}</p>}
      {!userId ? (
        <p className="text-slate-600">Preparing your workspace...</p>
      ) : currentStep === 0 ? (
        <Group1Personal />
      ) : (
        <p className="text-slate-700">
          Step {currentStep + 1} coming soon. Replace this placeholder with the actual step component.
        </p>
      )}
    </WizardLayout>
  );
}

