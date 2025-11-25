'use client';

import React, { useState } from 'react';
import { useApplicationStore } from '../store/useApplicationStore';
import Button from './ui/Button';
import { saveDraft, generatePdf, generateFormE, generateFormC, generateFormD, generateFormH, generateFormF, generateFormG } from '../lib/api';

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
  'Character Affirmants',
  'Employment Affirmants',
  'Skills Competency',
  'Pro Bono (50 Hours)',
  'Pro Bono Scholars',
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingFormE, setIsGeneratingFormE] = useState(false);
  const [isGeneratingFormC, setIsGeneratingFormC] = useState(false);
  const [isGeneratingFormD, setIsGeneratingFormD] = useState(false);
  const [isGeneratingFormH, setIsGeneratingFormH] = useState(false);
  const [isGeneratingFormF, setIsGeneratingFormF] = useState(false);
  const [isGeneratingFormG, setIsGeneratingFormG] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const lastSavedDataRef = React.useRef<string>('');

  // Get law schools from data for Form E generation
  const lawSchools = (Array.isArray(data.law_schools) ? data.law_schools : []) as Array<{ school_name?: string }>;
  
  // Get character affirmants from data for Form C generation
  const characterAffirmants = (Array.isArray(data.character_affirmants) ? data.character_affirmants : []) as Array<{ full_name?: string }>;
  
  // Get employment affirmants from data for Form D generation
  const employmentAffirmants = (Array.isArray(data.employment_affirmants) ? data.employment_affirmants : []) as Array<{ affirmant_name?: string; employer_name?: string }>;
  
  // Get skills competency data for Form H generation
  const skillsCompetency = (data.skills_competency || {}) as { pathway?: string };
  
  // Get pro bono entries for Form F generation
  const proBonoEntries = (Array.isArray(data.pro_bono_entries) ? data.pro_bono_entries : []) as Array<{ organization_name?: string; hours?: string }>;
  
  // Get pro bono scholars data for Form G generation
  const proBonoScholars = (data.pro_bono_scholars || {}) as { placement_name?: string };
  const isProBonoScholar = (data.header as any)?.pro_bono_scholar === 'Yes';

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

  const handleGeneratePdf = async () => {
    if (!userId) {
      setSaveMessage('Session not initialized yet.');
      return;
    }

    try {
      setIsGeneratingPdf(true);
      setSaveMessage('Generating PDF...');
      
      // First save the latest data
      await saveDraft(userId, data);
      
      // Then generate the PDF
      const blob = await generatePdf(data);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bar-admission-questionnaire.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSaveMessage('PDF downloaded!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setSaveMessage('Failed to generate PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleGenerateFormE = async (lawSchoolIndex: number) => {
    if (!userId) {
      setSaveMessage('Session not initialized yet.');
      return;
    }

    try {
      setIsGeneratingFormE(true);
      setSaveMessage('Generating Law School Certificate...');
      
      // First save the latest data
      await saveDraft(userId, data);
      
      // Then generate Form E
      const blob = await generateFormE(data, lawSchoolIndex);
      
      // Create download link
      const schoolName = lawSchools[lawSchoolIndex]?.school_name || `school-${lawSchoolIndex + 1}`;
      const safeSchoolName = schoolName.replace(/[^a-zA-Z0-9]/g, '_');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `law-school-certificate-${safeSchoolName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSaveMessage('Law School Certificate downloaded!');
    } catch (error) {
      console.error('Error generating Form E:', error);
      setSaveMessage('Failed to generate Law School Certificate.');
    } finally {
      setIsGeneratingFormE(false);
    }
  };

  const handleGenerateFormC = async (affirmantIndex: number) => {
    if (!userId) {
      setSaveMessage('Session not initialized yet.');
      return;
    }

    try {
      setIsGeneratingFormC(true);
      setSaveMessage('Generating Character Affirmation...');
      
      // First save the latest data
      await saveDraft(userId, data);
      
      // Then generate Form C
      const blob = await generateFormC(data, affirmantIndex);
      
      // Create download link
      const affirmantName = characterAffirmants[affirmantIndex]?.full_name || `affirmant-${affirmantIndex + 1}`;
      const safeAffirmantName = affirmantName.replace(/[^a-zA-Z0-9]/g, '_');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `character-affirmation-${affirmantIndex + 1}-${safeAffirmantName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSaveMessage('Character Affirmation downloaded!');
    } catch (error) {
      console.error('Error generating Form C:', error);
      setSaveMessage('Failed to generate Character Affirmation.');
    } finally {
      setIsGeneratingFormC(false);
    }
  };

  const handleGenerateFormD = async (affirmantIndex: number) => {
    if (!userId) {
      setSaveMessage('Session not initialized yet.');
      return;
    }

    try {
      setIsGeneratingFormD(true);
      setSaveMessage('Generating Employment Affirmation...');
      
      // First save the latest data
      await saveDraft(userId, data);
      
      // Then generate Form D
      const blob = await generateFormD(data, affirmantIndex);
      
      // Create download link
      const employerName = employmentAffirmants[affirmantIndex]?.employer_name || `employment-${affirmantIndex + 1}`;
      const safeEmployerName = employerName.replace(/[^a-zA-Z0-9]/g, '_');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `employment-affirmation-${affirmantIndex + 1}-${safeEmployerName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSaveMessage('Employment Affirmation downloaded!');
    } catch (error) {
      console.error('Error generating Form D:', error);
      setSaveMessage('Failed to generate Employment Affirmation.');
    } finally {
      setIsGeneratingFormD(false);
    }
  };

  const handleGenerateFormH = async () => {
    if (!userId) {
      setSaveMessage('Session not initialized yet.');
      return;
    }

    try {
      setIsGeneratingFormH(true);
      setSaveMessage('Generating Skills Competency Affidavit...');
      
      // First save the latest data
      await saveDraft(userId, data);
      
      // Then generate Form H
      const blob = await generateFormH(data);
      
      // Create download link
      const pathway = skillsCompetency.pathway?.replace(/\s+/g, '-').toLowerCase() || 'form-h';
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `skills-competency-${pathway}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSaveMessage('Skills Competency Affidavit downloaded!');
    } catch (error) {
      console.error('Error generating Form H:', error);
      setSaveMessage('Failed to generate Skills Competency Affidavit.');
    } finally {
      setIsGeneratingFormH(false);
    }
  };

  const handleGenerateFormF = async (entryIndex: number) => {
    if (!userId) {
      setSaveMessage('Session not initialized yet.');
      return;
    }

    try {
      setIsGeneratingFormF(true);
      setSaveMessage('Generating Pro Bono Affidavit...');
      
      // First save the latest data
      await saveDraft(userId, data);
      
      // Then generate Form F
      const blob = await generateFormF(data, entryIndex);
      
      // Create download link
      const orgName = proBonoEntries[entryIndex]?.organization_name?.replace(/[^a-zA-Z0-9]/g, '_') || `placement-${entryIndex + 1}`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pro-bono-affidavit-${orgName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSaveMessage('Pro Bono Affidavit downloaded!');
    } catch (error) {
      console.error('Error generating Form F:', error);
      setSaveMessage('Failed to generate Pro Bono Affidavit.');
    } finally {
      setIsGeneratingFormF(false);
    }
  };

  const handleGenerateFormG = async () => {
    if (!userId) {
      setSaveMessage('Session not initialized yet.');
      return;
    }

    try {
      setIsGeneratingFormG(true);
      setSaveMessage('Generating Pro Bono Scholars Affidavit...');
      
      // First save the latest data
      await saveDraft(userId, data);
      
      // Then generate Form G
      const blob = await generateFormG(data);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pro-bono-scholars-completion.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSaveMessage('Pro Bono Scholars Affidavit downloaded!');
    } catch (error) {
      console.error('Error generating Form G:', error);
      setSaveMessage('Failed to generate Pro Bono Scholars Affidavit.');
    } finally {
      setIsGeneratingFormG(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-6">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span>{progress}% Complete</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-[240px,1fr]">
          <aside className="space-y-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Checklist</h2>
              <nav className="space-y-1 text-sm">
                {GROUPS.map((label, index) => {
                  const isActive = index === currentStep;
                  const isAffirmantSection = index >= 13; // Groups 1-13 are questionnaire, rest are affirmants
                  const isFirstAffirmant = index === 13;
                  const isFirstGroup = index === 0;
                  
                  return (
                    <React.Fragment key={label}>
                      {isFirstGroup && (
                        <div className="mb-3 flex items-center gap-2">
                          <div className="h-px flex-1 bg-slate-700" />
                          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Main Form</span>
                          <div className="h-px flex-1 bg-slate-700" />
                        </div>
                      )}
                      {isFirstAffirmant && (
                        <div className="my-3 flex items-center gap-2">
                          <div className="h-px flex-1 bg-slate-700" />
                          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Affirmation Forms</span>
                          <div className="h-px flex-1 bg-slate-700" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => goToStep(index)}
                        className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                          isActive 
                            ? isAffirmantSection 
                              ? 'bg-amber-900/50 text-amber-300 font-semibold border border-amber-800' 
                              : 'bg-slate-800 text-white font-semibold border border-slate-700' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                        }`}
                      >
                        {label}
                      </button>
                    </React.Fragment>
                  );
                })}
              </nav>
            </div>

            {/* Generate Forms Section */}
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Generate Forms</h2>
              <div className="space-y-3 text-sm">
                {/* Form B - Questionnaire */}
                <div className="rounded-md border border-slate-700 bg-slate-800/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-300">Questionnaire</span>
                    <button
                      type="button"
                      onClick={handleGeneratePdf}
                      disabled={isGeneratingPdf || isSaving}
                      className="rounded bg-white px-2 py-1 text-xs font-medium text-slate-900 hover:bg-slate-200 disabled:opacity-50"
                    >
                      {isGeneratingPdf ? '...' : 'PDF'}
                    </button>
                  </div>
                </div>

                {/* Form C - Character Affirmations */}
                <div className="rounded-md border border-slate-700 bg-slate-800/50 p-3">
                  <div className="mb-2 font-medium text-slate-300">Character</div>
                  {characterAffirmants.filter(a => a?.full_name).length === 0 ? (
                    <p className="text-xs text-slate-500">Add affirmants in Character Affirmants section</p>
                  ) : (
                    <div className="space-y-2">
                      {characterAffirmants.map((affirmant, index) => (
                        affirmant?.full_name && (
                          <div key={index} className="flex items-center justify-between gap-2">
                            <span className="truncate text-xs text-slate-400" title={affirmant.full_name}>
                              #{index + 1}: {affirmant.full_name}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleGenerateFormC(index)}
                              disabled={isGeneratingFormC || isSaving}
                              className="shrink-0 rounded bg-slate-600 px-2 py-1 text-xs font-medium text-white hover:bg-slate-500 disabled:opacity-50"
                            >
                              {isGeneratingFormC ? '...' : 'PDF'}
                            </button>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>

                {/* Form D - Employment Affirmations */}
                <div className="rounded-md border border-slate-700 bg-slate-800/50 p-3">
                  <div className="mb-2 font-medium text-slate-300">Employment</div>
                  {employmentAffirmants.filter(a => a?.affirmant_name).length === 0 ? (
                    <p className="text-xs text-slate-500">Add affirmations in Employment Affirmants section</p>
                  ) : (
                    <div className="space-y-2">
                      {employmentAffirmants.map((affirmant, index) => (
                        affirmant?.affirmant_name && (
                          <div key={index} className="flex items-center justify-between gap-2">
                            <span className="truncate text-xs text-slate-400" title={affirmant.employer_name || `Employment ${index + 1}`}>
                              {affirmant.employer_name || `Employment ${index + 1}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleGenerateFormD(index)}
                              disabled={isGeneratingFormD || isSaving}
                              className="shrink-0 rounded bg-slate-600 px-2 py-1 text-xs font-medium text-white hover:bg-slate-500 disabled:opacity-50"
                            >
                              {isGeneratingFormD ? '...' : 'PDF'}
                            </button>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>

                {/* Form E - Law School Certificates */}
                <div className="rounded-md border border-slate-700 bg-slate-800/50 p-3">
                  <div className="mb-2 font-medium text-slate-300">Law School Cert</div>
                  {lawSchools.length === 0 ? (
                    <p className="text-xs text-slate-500">Add law schools in Group 4</p>
                  ) : (
                    <div className="space-y-2">
                      {lawSchools.map((school, index) => (
                        school?.school_name && (
                          <div key={index} className="flex items-center justify-between gap-2">
                            <span className="truncate text-xs text-slate-400" title={school.school_name}>
                              {school.school_name}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleGenerateFormE(index)}
                              disabled={isGeneratingFormE || isSaving}
                              className="shrink-0 rounded bg-slate-600 px-2 py-1 text-xs font-medium text-white hover:bg-slate-500 disabled:opacity-50"
                            >
                              {isGeneratingFormE ? '...' : 'PDF'}
                            </button>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>

                {/* Form H - Skills Competency */}
                <div className="rounded-md border border-slate-700 bg-slate-800/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-300">Skills Competency</span>
                    <button
                      type="button"
                      onClick={handleGenerateFormH}
                      disabled={isGeneratingFormH || isSaving || !skillsCompetency.pathway}
                      className="rounded bg-slate-600 px-2 py-1 text-xs font-medium text-white hover:bg-slate-500 disabled:opacity-50"
                    >
                      {isGeneratingFormH ? '...' : 'PDF'}
                    </button>
                  </div>
                  {!skillsCompetency.pathway && (
                    <p className="mt-1 text-xs text-slate-500">Select a pathway in Skills Competency section</p>
                  )}
                  {skillsCompetency.pathway && (
                    <p className="mt-1 text-xs text-slate-400">{skillsCompetency.pathway}</p>
                  )}
                </div>

                {/* Form F - Pro Bono 50-Hour */}
                <div className="rounded-md border border-slate-700 bg-slate-800/50 p-3">
                  <div className="mb-2 font-medium text-slate-300">Pro Bono</div>
                  {proBonoEntries.filter(e => e?.organization_name).length === 0 ? (
                    <p className="text-xs text-slate-500">Add placements in Pro Bono section</p>
                  ) : (
                    <div className="space-y-2">
                      {proBonoEntries.map((entry, index) => (
                        entry?.organization_name && (
                          <div key={index} className="flex items-center justify-between gap-2">
                            <span className="truncate text-xs text-slate-400" title={`${entry.organization_name} (${entry.hours || '?'} hrs)`}>
                              {entry.organization_name} ({entry.hours || '?'} hrs)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleGenerateFormF(index)}
                              disabled={isGeneratingFormF || isSaving}
                              className="shrink-0 rounded bg-slate-600 px-2 py-1 text-xs font-medium text-white hover:bg-slate-500 disabled:opacity-50"
                            >
                              {isGeneratingFormF ? '...' : 'PDF'}
                            </button>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>

                {/* Form G - Pro Bono Scholars (only show if applicable) */}
                {isProBonoScholar && (
                  <div className="rounded-md border border-slate-700 bg-slate-800/50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-300">PBSP</span>
                      <button
                        type="button"
                        onClick={handleGenerateFormG}
                        disabled={isGeneratingFormG || isSaving || !proBonoScholars.placement_name}
                        className="rounded bg-slate-600 px-2 py-1 text-xs font-medium text-white hover:bg-slate-500 disabled:opacity-50"
                      >
                        {isGeneratingFormG ? '...' : 'PDF'}
                      </button>
                    </div>
                    {!proBonoScholars.placement_name && (
                      <p className="mt-1 text-xs text-slate-500">Complete Pro Bono Scholars section</p>
                    )}
                    {proBonoScholars.placement_name && (
                      <p className="mt-1 truncate text-xs text-slate-400" title={proBonoScholars.placement_name}>
                        {proBonoScholars.placement_name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>

          <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="border-b border-slate-700 pb-4">
              <h1 className="text-xl font-semibold text-white">{title}</h1>
              <p className="mt-1 text-sm text-slate-400">Complete each section carefully.</p>
            </div>

            <div className="mt-6">{children}</div>

            <footer className="mt-8 border-t border-slate-700 pt-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={() => handleSaveDraft(false)} disabled={isSaving || isGeneratingPdf}>
                    {isSaving ? 'Saving...' : 'Save Draft'}
                  </Button>
                  <Button onClick={handleGeneratePdf} disabled={isSaving || isGeneratingPdf}>
                    {isGeneratingPdf ? 'Generating...' : 'Generate PDF'}
                  </Button>
                  {saveMessage && <span className="text-sm text-slate-400">{saveMessage}</span>}
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
