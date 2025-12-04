'use client';

import React, { useState } from 'react';
import { useApplicationStore } from '../store/useApplicationStore';
import Button from './ui/Button';
import { saveDraft, generatePdf, generateFormE, generateFormC, generateFormD, generateFormH, generateFormF, generateFormG } from '../lib/api';
import { 
  HiOutlinePlay, 
  HiOutlineUser, 
  HiOutlinePhone, 
  HiOutlineAcademicCap, 
  HiOutlineBriefcase, 
  HiOutlineScale, 
  HiOutlineShieldCheck,
  HiOutlineDocumentText,
  HiOutlineHeart,
  HiOutlineUsers,
  HiOutlineCurrencyDollar,
  HiOutlineIdentification,
  HiOutlinePencil
} from 'react-icons/hi';

// Step info with titles, descriptions, and icons
const STEP_INFO = [
  { 
    label: 'Start', 
    icon: HiOutlinePlay,
    title: 'Application Setup',
    description: 'Upload your Notice of Certification and configure your application settings.'
  },
  { 
    label: 'Identity', 
    icon: HiOutlineUser,
    title: 'Personal Identity',
    description: 'Provide your legal name, date of birth, SSN, and other identifying information.'
  },
  { 
    label: 'Contact', 
    icon: HiOutlinePhone,
    title: 'Contact Information',
    description: 'Enter your current and previous addresses, phone numbers, and email.'
  },
  { 
    label: 'Education', 
    icon: HiOutlineAcademicCap,
    title: 'Educational Background',
    description: 'List all colleges, universities, and law schools you have attended.'
  },
  { 
    label: 'Employment', 
    icon: HiOutlineBriefcase,
    title: 'Employment History',
    description: 'Document your work experience including all legal and non-legal positions.'
  },
  { 
    label: 'Bar Admissions', 
    icon: HiOutlineScale,
    title: 'Bar Admissions & Applications',
    description: 'List any bar admissions you hold or have applied for in any jurisdiction.'
  },
  { 
    label: 'Military', 
    icon: HiOutlineShieldCheck,
    title: 'Military Service',
    description: 'Provide details about any military service in the U.S. or other countries.'
  },
  { 
    label: 'Legal Matters', 
    icon: HiOutlineDocumentText,
    title: 'Legal Proceedings',
    description: 'Disclose any civil or criminal legal matters you have been involved in.'
  },
  { 
    label: 'Fitness', 
    icon: HiOutlineHeart,
    title: 'Physical & Mental Fitness',
    description: 'Answer questions related to your fitness to practice law.'
  },
  { 
    label: 'Child Support', 
    icon: HiOutlineUsers,
    title: 'Child Support Obligations',
    description: 'Disclose any child support orders or arrears.'
  },
  { 
    label: 'Financials', 
    icon: HiOutlineCurrencyDollar,
    title: 'Financial History',
    description: 'Report bankruptcies, tax issues, and other financial matters.'
  },
  { 
    label: 'Licenses', 
    icon: HiOutlineIdentification,
    title: 'Professional Licenses',
    description: 'List any professional licenses or certifications you hold.'
  },
  { 
    label: 'Signature', 
    icon: HiOutlinePencil,
    title: 'Signature & Certification',
    description: 'Review and sign your completed application.'
  },
  // Affirmation Forms
  { 
    label: 'Character Affirmants',
    title: 'Character & Fitness Affirmations',
    description: 'Add references who can attest to your good moral character (2-4 required).'
  },
  { 
    label: 'Employment Affirmants',
    title: 'Employment Affirmations',
    description: 'Request affirmations from legal employers you worked for after law school.'
  },
  { 
    label: 'Skills Competency',
    title: 'Skills Competency Affidavit',
    description: 'Certify how you met New York\'s Skills Competency requirement.'
  },
  { 
    label: 'Pro Bono (50 Hours)',
    title: 'Pro Bono Service (50-Hour Requirement)',
    description: 'Document your qualifying pro bono legal service placements.'
  },
  { 
    label: 'Pro Bono Scholars',
    title: 'Pro Bono Scholars Program',
    description: 'Complete the PBSP affidavit for law school pro bono scholars.'
  },
];

// Main form items with icons (for sidebar)
const MAIN_FORM_ITEMS = STEP_INFO.slice(0, 13);

// Affirmation form items (keep as simple strings for sidebar)
const AFFIRMATION_ITEMS = STEP_INFO.slice(13).map(item => item.label);

// Combined for total steps calculation
const GROUPS = [
  ...MAIN_FORM_ITEMS.map(item => item.label),
  ...AFFIRMATION_ITEMS,
];

// Map step indices to data keys for completeness check
const STEP_DATA_KEYS: Record<number, string[]> = {
  0: ['header'], // Start - department, BOLE, etc.
  1: ['personal_info'], // Identity
  2: ['contact_info', 'prior_residence', 'office_address'], // Contact
  3: ['education_undergrad', 'law_schools'], // Education
  4: ['employment_history'], // Employment
  5: ['other_ny_applications', 'other_bar_exams', 'other_admissions', 'unauthorized_practice_personal', 'unauthorized_practice_associated', 'unauthorized_practice_acting'], // Bar Admissions
  6: ['military_us', 'military_foreign', 'military_discipline'], // Military
  7: ['criminal_history', 'civil_matters'], // Legal Matters
  8: ['fitness_conduct', 'general_conduct', 'illegal_drugs'], // Fitness
  9: ['child_support'], // Child Support
  10: ['financial_judgments', 'financial_defaults', 'past_due_debts', 'bankruptcy'], // Financials
  11: ['licenses', 'fidelity_bond'], // Licenses
  12: ['signature_block', 'designation_of_agent'], // Signature
  13: ['character_affirmants'], // Character Affirmants
  14: ['employment_affirmants'], // Employment Affirmants
  15: ['skills_competency'], // Skills Competency
  16: ['pro_bono_entries'], // Pro Bono
  17: ['pro_bono_scholars'], // Pro Bono Scholars
};

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
    // Auto-scroll to top when changing steps
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Helper to recursively check for Yes/No answers in an object
  const hasYesNoAnswer = (obj: any): boolean => {
    if (!obj || typeof obj !== 'object') return false;
    
    for (const [key, value] of Object.entries(obj)) {
      // Check for radio button values stored as { value: 'Yes' | 'No' } or { type: 'radio', value: 'Yes' | 'No' }
      if (value && typeof value === 'object' && 'value' in value) {
        const v = (value as any).value;
        if (v === 'Yes' || v === 'No') {
          return true;
        }
      }
      // Recursively check nested objects (but not arrays)
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (hasYesNoAnswer(value)) {
          return true;
        }
      }
    }
    return false;
  };

  // Check if a step has any data entered (for incomplete indicator)
  const isStepComplete = (stepIndex: number): boolean => {
    const keys = STEP_DATA_KEYS[stepIndex];
    if (!keys) return true; // Unknown step, assume complete
    
    for (const key of keys) {
      const stepData = data[key];
      if (stepData) {
        // Check if it's an array with items that have content
        if (Array.isArray(stepData) && stepData.length > 0) {
          // Check if array items have actual data
          for (const item of stepData) {
            if (item && typeof item === 'object') {
              const values = Object.values(item);
              if (values.some(v => v !== '' && v !== null && v !== undefined)) {
                return true;
              }
            }
          }
        }
        // Check if it's an object with Yes/No answers (including nested)
        if (typeof stepData === 'object' && !Array.isArray(stepData)) {
          if (hasYesNoAnswer(stepData)) {
            return true;
          }
          // Also check for any non-empty string values (like text inputs)
          const checkForContent = (obj: any): boolean => {
            for (const value of Object.values(obj)) {
              if (typeof value === 'string' && value.trim() !== '') {
                return true;
              }
            }
            return false;
          };
          if (checkForContent(stepData)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Check if step has been visited (any step before current is "visited")
  const isStepVisited = (stepIndex: number): boolean => {
    return stepIndex < currentStep;
  };

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
                  const isMainFormItem = index < 13;
                  const isAffirmantSection = index >= 13;
                  const isFirstAffirmant = index === 13;
                  const isFirstGroup = index === 0;
                  const visited = isStepVisited(index);
                  const complete = isStepComplete(index);
                  const isIncomplete = visited && !complete;
                  
                  // Get icon for main form items
                  const MainFormIcon = isMainFormItem ? MAIN_FORM_ITEMS[index]?.icon : null;
                  
                  // Determine button styling
                  let buttonClasses = 'w-full rounded-md px-3 py-2 text-left transition-colors ';
                  if (isActive) {
                    buttonClasses += isAffirmantSection 
                      ? 'bg-amber-900/50 text-amber-300 font-semibold border border-amber-800' 
                      : 'bg-slate-800 text-white font-semibold border border-slate-700';
                  } else if (isIncomplete) {
                    // Yellow/amber styling for incomplete visited steps
                    buttonClasses += 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50 hover:bg-yellow-900/40';
                  } else if (complete && visited) {
                    // Subtle green for completed steps
                    buttonClasses += 'text-slate-400 hover:bg-slate-800 hover:text-slate-300 border-l-2 border-l-blue-500';
                  } else {
                    buttonClasses += 'text-slate-400 hover:bg-slate-800 hover:text-slate-300';
                  }
                  
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
                        className={buttonClasses}
                      >
                        {isMainFormItem ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isIncomplete && (
                                <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                              )}
                              <span>{label}</span>
                            </div>
                            {MainFormIcon && <MainFormIcon className="h-4 w-4 opacity-60" />}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {isIncomplete && (
                              <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                            )}
                            <span>{label}</span>
                          </div>
                        )}
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
              <h1 className="text-xl font-semibold text-white">
                {STEP_INFO[currentStep]?.title || title}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {STEP_INFO[currentStep]?.description || 'Complete each section carefully.'}
              </p>
            </div>

            <div className="mt-6">{children}</div>

            <footer className="mt-8 border-t border-slate-700 pt-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={() => handleSaveDraft(false)} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Draft'}
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
