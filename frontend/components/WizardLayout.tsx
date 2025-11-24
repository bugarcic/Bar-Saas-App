'use client';

import React, { useState } from 'react';
import { useApplicationStore } from '../store/useApplicationStore';
import Button from './ui/Button';
import { saveDraft } from '../lib/api';

const GROUPS = [
  'Group 1 · Start',
  'Group 2 · Identity',
  'Group 3 · Contact',
  'Group 4 · Education',
  'Group 5 · Work',
  'Group 6 · Bar Admissions',
  'Group 7 · Military',
  'Group 8 · Legal Matters',
  'Group 9 · Fitness',
  'Group 10 · Child Support',
  'Group 11 · Financials',
  'Group 12 · Licenses',
  'Group 13 · Signature',
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
  const lastSavedDataRef = React.useRef<string>('');

  const handleSaveDraft = async (silent = false) => {
    if (!userId) {
      if (!silent) setSaveMessage('Session not initialized yet.');
      return;
    }

    const currentDataStr = JSON.stringify(data);
    if (currentDataStr === lastSavedDataRef.current) {
      if (!silent) setSaveMessage('No changes to save.');
      return;
    }

    try {
      setIsSaving(true);
      if (!silent) setSaveMessage(null);
      await saveDraft(userId, data);
      lastSavedDataRef.current = currentDataStr;
      setSaveMessage(`Saved at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error(error);
      if (!silent) setSaveMessage('Failed to save draft.');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (userId) {
        handleSaveDraft(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [userId, data]);

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
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={() => handleSaveDraft(false)} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Draft'}
                  </Button>
                  {saveMessage && <span className="text-sm text-slate-500">{saveMessage}</span>}
                </div>
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
