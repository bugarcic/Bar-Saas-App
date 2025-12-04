'use client';

import React, { useState, useEffect } from 'react';
import { useApplicationStore } from '../store/useApplicationStore';
import Button from './ui/Button';
import { saveDraft } from '../lib/api';
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
  HiOutlinePencil,
  HiOutlineCollection,
  HiOutlineDownload,
  HiOutlineInformationCircle
} from 'react-icons/hi';

// Step info with titles, descriptions, and icons
const STEP_INFO = [
  // --- Overview (0) ---
  {
    label: 'Overview',
    title: 'Welcome & Overview',
    description: 'Learn about the application process and how to use this tool.',
    icon: HiOutlineInformationCircle
  },

  // --- Questionnaire (1-13) ---
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
  
  // --- Supporting Docs (14-18) ---
  { 
    label: 'Character Affirmations',
    title: 'Character & Fitness Affirmations',
    description: 'Add references who can attest to your good moral character (2-4 required).',
    icon: HiOutlineCollection
  },
  { 
    label: 'Employment Affirmations',
    title: 'Employment Affirmations',
    description: 'Request affirmations from legal employers you worked for after law school.',
    icon: HiOutlineCollection
  },
  { 
    label: 'Skills Competency',
    title: 'Skills Competency Affidavit',
    description: 'Certify how you met New York\'s Skills Competency requirement.',
    icon: HiOutlineCollection
  },
  { 
    label: 'Pro Bono (50 Hours)',
    title: 'Pro Bono Service (50-Hour Requirement)',
    description: 'Document your qualifying pro bono legal service placements.',
    icon: HiOutlineCollection
  },
  { 
    label: 'Pro Bono Scholars',
    title: 'Pro Bono Scholars Program',
    description: 'Complete the PBSP affidavit for law school pro bono scholars.',
    icon: HiOutlineCollection
  },
  
  // --- Review & Export (19) ---
  {
    label: 'Download Forms',
    title: 'Review & Download Forms',
    description: 'Generate and download all your completed application forms.',
    icon: HiOutlineDownload
  }
];

// Define the Tabs
const TABS = [
  { id: 'overview', label: 'Overview', range: [0, 0] },
  { id: 'questionnaire', label: 'Basic Information', range: [1, 13] },
  { id: 'supporting', label: 'Supporting Docs', range: [14, 18] },
  { id: 'export', label: 'Review & Export', range: [19, 19] }
];

// Map step indices to data keys for completeness check
const STEP_DATA_KEYS: Record<number, string[]> = {
  0: [], // Overview - always complete
  1: ['header'], // Start
  2: ['personal_info'], // Identity
  3: ['contact_info', 'prior_residence', 'office_address'], // Contact
  4: ['education_undergrad', 'law_schools'], // Education
  5: ['employment_history'], // Employment
  6: ['other_ny_applications', 'other_bar_exams', 'other_admissions', 'unauthorized_practice_personal', 'unauthorized_practice_associated', 'unauthorized_practice_acting'], // Bar Admissions
  7: ['military_us', 'military_foreign', 'military_discipline'], // Military
  8: ['criminal_history', 'civil_matters'], // Legal Matters
  9: ['fitness_conduct', 'general_conduct', 'illegal_drugs'], // Fitness
  10: ['child_support'], // Child Support
  11: ['financial_judgments', 'financial_defaults', 'past_due_debts', 'bankruptcy'], // Financials
  12: ['licenses', 'fidelity_bond'], // Licenses
  13: ['signature_block', 'designation_of_agent'], // Signature
  14: ['character_affirmants'], // Character Affirmants
  15: ['employment_affirmants'], // Employment Affirmants
  16: ['skills_competency'], // Skills Competency
  17: ['pro_bono_entries'], // Pro Bono
  18: ['pro_bono_scholars'], // Pro Bono Scholars
  19: [], // Export - always complete
};

interface WizardLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const WizardLayout: React.FC<WizardLayoutProps> = ({ title, children }) => {
  const currentStep = useApplicationStore((state) => state.currentStep);
  const setCurrentStep = useApplicationStore((state) => state.setCurrentStep);
  const data = useApplicationStore((state) => state.data);
  const userId = useApplicationStore((state) => state.userId);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const lastSavedDataRef = React.useRef<string>('');

  const totalSteps = STEP_INFO.length;

  // Identify current tab
  const currentTab = TABS.find(tab => currentStep >= tab.range[0] && currentStep <= tab.range[1]) || TABS[0];

  const goToStep = (step: number) => {
    const next = Math.max(0, Math.min(step, totalSteps - 1));
    setCurrentStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabClick = (tabId: string) => {
    const tab = TABS.find(t => t.id === tabId);
    if (tab) {
      goToStep(tab.range[0]);
    }
  };

  const handleNext = () => goToStep(currentStep + 1);
  const handleBack = () => goToStep(currentStep - 1);

  // Helper to recursively check for Yes/No answers in an object
  const hasYesNoAnswer = (obj: any): boolean => {
    if (!obj || typeof obj !== 'object') return false;
    
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && 'value' in value) {
        const v = (value as any).value;
        if (v === 'Yes' || v === 'No') {
          return true;
        }
      }
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (hasYesNoAnswer(value)) {
          return true;
        }
      }
    }
    return false;
  };

  const isStepComplete = (stepIndex: number): boolean => {
    const keys = STEP_DATA_KEYS[stepIndex];
    if (!keys || keys.length === 0) return true; // Assume complete if no keys (like Overview/Export)
    
    for (const key of keys) {
      // Cast data to any to access generic keys, as ApplicationData keys are optional
      // and we are iterating over a string array of keys.
      const stepData = (data as any)[key];
      if (stepData) {
        if (Array.isArray(stepData) && stepData.length > 0) {
          for (const item of stepData) {
            if (item && typeof item === 'object') {
              const values = Object.values(item);
              if (values.some(v => v !== '' && v !== null && v !== undefined)) {
                return true;
              }
            }
          }
        }
        if (typeof stepData === 'object' && !Array.isArray(stepData)) {
          if (hasYesNoAnswer(stepData)) {
            return true;
          }
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

  const isStepVisited = (stepIndex: number): boolean => {
    return stepIndex < currentStep;
  };

  // Calculate completion percentage
  const completionPercentage = React.useMemo(() => {
    let completedSteps = 0;
    // Skip overview (index 0) in calculation to make it more meaningful, or keep it as "free point"
    // Let's count all steps
    for (let i = 0; i < totalSteps; i++) {
      if (isStepComplete(i)) {
        completedSteps++;
      }
    }
    return Math.round((completedSteps / totalSteps) * 100);
  }, [data, totalSteps]); // Recalculate when data changes

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

  useEffect(() => {
    const interval = setInterval(() => {
      if (userId) {
        handleSaveDraft(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [userId, data]);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-8">
        
        {/* Top Navigation Tabs & Progress */}
        <div className="mb-8 flex items-end justify-between border-b border-slate-800">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {TABS.map((tab) => {
              const isActive = tab.id === currentTab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`
                    whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                    ${isActive 
                      ? 'border-blue-500 text-blue-500' 
                      : 'border-transparent text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Total Progress Indicator */}
          <div className="mb-4 flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400">
              Completion: {completionPercentage}%
            </span>
            <div className="h-2 w-32 rounded-full bg-slate-800">
              <div 
                className="h-2 rounded-full bg-blue-600 transition-all duration-500" 
                style={{ width: `${completionPercentage}%` }} 
              />
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-[280px,1fr]">
          
          {/* Contextual Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                {currentTab.label} Sections
              </h2>
              <nav className="space-y-1">
                {STEP_INFO.map((step, index) => {
                  // Only show steps belonging to current tab
                  if (index < currentTab.range[0] || index > currentTab.range[1]) return null;
                  
                  const isActive = index === currentStep;
                  const visited = isStepVisited(index);
                  const complete = isStepComplete(index);
                  const isIncomplete = visited && !complete;
                  const Icon = step.icon;
                  
                  let buttonClasses = 'group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ';
                  
                  if (isActive) {
                    buttonClasses += 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700';
                  } else if (isIncomplete) {
                    buttonClasses += 'text-amber-400 hover:bg-slate-800/50';
                  } else if (complete) {
                    buttonClasses += 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300';
                  } else {
                    buttonClasses += 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300';
                  }

                  return (
                    <button
                      key={step.label}
                      onClick={() => goToStep(index)}
                      className={buttonClasses}
                    >
                      <div className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-slate-900 border border-slate-700">
                        {Icon && <Icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : isIncomplete ? 'text-amber-400' : complete ? 'text-green-500' : 'text-slate-500'}`} />}
                      </div>
                      <span className="truncate">{step.label}</span>
                      {isIncomplete && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-500" />}
                      {complete && !isActive && <span className="ml-auto text-green-500 text-xs">✓</span>}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <section className="min-w-0">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm sm:p-8">
              <header className="mb-8 border-b border-slate-800 pb-6">
                <h1 className="text-2xl font-semibold text-white">
                  {STEP_INFO[currentStep]?.title}
                </h1>
                <p className="mt-2 text-slate-400">
                  {STEP_INFO[currentStep]?.description}
                </p>
              </header>

              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {children}
              </div>

              <footer className="mt-10 flex items-center justify-between border-t border-slate-800 pt-6">
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={() => handleSaveDraft(false)} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Draft'}
                  </Button>
                  {saveMessage && <span className="text-xs text-slate-500">{saveMessage}</span>}
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="secondary" onClick={handleBack} disabled={currentStep === 0}>
                    Back
                  </Button>
                  {currentStep < totalSteps - 1 ? (
                    <Button onClick={handleNext}>
                      Next Step
                    </Button>
                  ) : (
                    <Button disabled className="opacity-50 cursor-not-allowed">
                      Completed
                    </Button>
                  )}
                </div>
              </footer>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default WizardLayout;
