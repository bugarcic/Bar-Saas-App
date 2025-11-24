'use client';

import React, { useState } from 'react';
import { useApplicationStore } from '../store/useApplicationStore';
import Button from './ui/Button';
import { saveDraft } from '../lib/api';

const GROUPS = [
  'Group 1 · Applicant Info',
  'Group 2 · Other Names',
  'Group 3 · Identification',
  'Group 4 · Birth Details',
  'Group 5 · Contact Info',
  'Group 6 · Prior Residence',
  'Group 7 · Office Address',
  'Group 8 · Employment History',
  'Group 9 · Education',
  'Group 10 · Character & Conduct',
  'Group 11 · Financials',
  'Group 12 · Licenses & Bonds',
  'Group 13 · Signature & Agent',
];

interface WizardLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const WizardLayout: React.FC<WizardLayoutProps> = ({ title, children }) => {
  const currentStep = useApplicationStore((state) => state.currentStep);
  const setCurrentStep = useApplicationStore((state) => state.setCurrentStep);

  const totalSteps = GROUPS.length;
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

  const goToStep = (step: number) => {
    const next = Math.max(0, Math.min(step, totalSteps - 1));
    setCurrentStep(next);
  };

  const handleNext = () => goToStep(currentStep + 1);
  const handleBack = () => goToStep(currentStep - 1);
  const data = useApplicationStore((state) => state.data);
  const userId = useApplicationStore((state) => state.userId);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSaveDraft = async () => {
    if (!userId) {
      setSaveMessage('Session not initialized yet.');
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage(null);
      await saveDraft(userId, data);
      setSaveMessage('Draft saved!');
    } catch (error) {
      console.error(error);
      setSaveMessage('Failed to save draft.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-6">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span>{progress}% Complete</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-[240px,1fr]">
          <aside className="rounded-lg bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Checklist</h2>
            <nav className="space-y-1 text-sm">
              {GROUPS.map((label, index) => {
                const isActive = index === currentStep;
                return (
                  <button
                    type="button"
                    key={label}
                    onClick={() => goToStep(index)}
                    className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="rounded-lg bg-white p-6 shadow-sm">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
              <p className="mt-1 text-sm text-slate-600">Complete each section carefully.</p>
            </div>

            <div className="mt-6">{children}</div>

            <footer className="mt-8 border-t border-slate-200 pt-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
                  Save Draft
                </Button>
              {saveMessage && <p className="text-sm text-slate-600">{saveMessage}</p>}
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={handleBack} disabled={currentStep === 0}>
                    Back
                  </Button>
                  <Button onClick={handleNext} disabled={currentStep >= totalSteps - 1}>
                    Next
                  </Button>
                </div>
              </div>
            </footer>
          </section>
        </div>
      </div>
    </div>
  );
};

export default WizardLayout;

