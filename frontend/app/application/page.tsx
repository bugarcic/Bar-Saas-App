'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../../lib/supabaseClient';
import WizardLayout from '../../components/WizardLayout';
import AppHeader from '../../components/AppHeader';
import { useApplicationStore } from '../../store/useApplicationStore';
import { initSession, getDraft } from '../../lib/api';

// Import group components
import Group1Start from '../../components/groups/Group1Start';
import Group2Identity from '../../components/groups/Group2Identity';
import Group3Contact from '../../components/groups/Group3Contact';
import Group4Education from '../../components/groups/Group4Education';
import Group5Employment from '../../components/groups/Group5Employment';
import Group6BarAdmissions from '../../components/groups/Group6BarAdmissions';
import Group7Military from '../../components/groups/Group7Military';
import Group8LegalMatters from '../../components/groups/Group8LegalMatters';
import Group9Condition from '../../components/groups/Group9Condition';
import Group10ChildSupport from '../../components/groups/Group10ChildSupport';
import Group11Financial from '../../components/groups/Group11Financial';
import Group12Licenses from '../../components/groups/Group12Licenses';
import Group13Signature from '../../components/groups/Group13Signature';
import GroupCharacterAffirmants from '../../components/groups/GroupCharacterAffirmants';
import GroupEmploymentAffirmants from '../../components/groups/GroupEmploymentAffirmants';
import GroupSkillsCompetency from '../../components/groups/GroupSkillsCompetency';
import GroupProBono from '../../components/groups/GroupProBono';
import GroupProBonoScholars from '../../components/groups/GroupProBonoScholars';
import GroupReviewExport from '../../components/groups/GroupReviewExport';
import Group0Overview from '../../components/groups/Group0Overview';

const STEPS = [
  Group0Overview,
  Group1Start,
  Group2Identity,
  Group3Contact,
  Group4Education,
  Group5Employment,
  Group6BarAdmissions,
  Group7Military,
  Group8LegalMatters,
  Group9Condition,
  Group10ChildSupport,
  Group11Financial,
  Group12Licenses,
  Group13Signature,
  GroupCharacterAffirmants,
  GroupEmploymentAffirmants,
  GroupSkillsCompetency,
  GroupProBono,
  GroupProBonoScholars,
  GroupReviewExport,
];

export default function ApplicationPage() {
  const router = useRouter();
  const currentStep = useApplicationStore((state) => state.currentStep);
  const setUserId = useApplicationStore((state) => state.setUserId);
  const setData = useApplicationStore((state) => state.setData);
  const userId = useApplicationStore((state) => state.userId);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isDraftLoading, setIsDraftLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

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
        setUserEmail(session.user.email ?? null);
        const supabaseUserId = session.user.id;
        setUserId(supabaseUserId);
        setIsDraftLoading(true);
        initSession(supabaseUserId, session.user.email ?? undefined)
          .then(() => getDraft(supabaseUserId))
          .then((data) => {
            if (!active) return;
            if (data && Object.keys(data).length > 0) {
              setData(data);
            }
          })
          .catch((error) => {
            console.error('Failed to init session or fetch draft', error);
            if (active) setSessionError('Unable to initialize user session.');
          })
          .finally(() => {
            if (active) setIsDraftLoading(false);
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
      <main className="flex min-h-screen flex-col bg-slate-950">
        <AppHeader />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-white" />
            <span>Loading your application...</span>
          </div>
        </div>
      </main>
    );
  }

  const CurrentStepComponent = STEPS[currentStep] || (() => <p>Step not found</p>);

  return (
    <div className="min-h-screen bg-slate-950">
      <AppHeader userEmail={userEmail} />
      <WizardLayout title="New Application Wizard">
        {sessionError && <p className="mb-4 rounded-md bg-red-900/50 border border-red-800 p-3 text-sm text-red-300">{sessionError}</p>}
        {!userId || isDraftLoading ? (
          <div className="flex min-h-[200px] items-center justify-center text-slate-400">
            <div className="flex items-center gap-3">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-white" />
              <span>{!userId ? 'Preparing your workspace...' : 'Loading your saved responses...'}</span>
            </div>
          </div>
        ) : (
          <CurrentStepComponent />
        )}
      </WizardLayout>
    </div>
  );
}
