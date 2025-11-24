'use client';

import React from 'react';
import WizardLayout from '../components/WizardLayout';
import { useApplicationStore } from '../store/useApplicationStore';
import Group1Personal from '../components/groups/Group1Personal';

export default function HomePage() {
  const currentStep = useApplicationStore((state) => state.currentStep);

  return (
    <WizardLayout title="New Application Wizard">
      {currentStep === 0 ? (
        <Group1Personal />
      ) : (
        <p className="text-slate-700">
          Step {currentStep + 1} coming soon. Replace this placeholder with the actual step component.
        </p>
      )}
    </WizardLayout>
  );
}

