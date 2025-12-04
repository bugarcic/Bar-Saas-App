'use client';

import React, { useMemo, useState } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Button from '../ui/Button';
import { saveDraft, generateFormD } from '../../lib/api';

export interface EmploymentAffirmant {
  // Which employment entry this affirmation is for
  employment_index?: number;
  // Affirmant (supervisor) info
  affirmant_name?: string;
  affirmant_title?: string;
  affirmant_employer?: string;
  affirmant_street?: string;
  affirmant_city?: string;
  affirmant_state?: string;
  affirmant_zip?: string;
  affirmant_country?: string;
  affirmant_phone?: string;
  affirmant_email?: string;
  // Attorney status
  is_attorney?: string; // 'Yes' | 'No'
  attorney_jurisdiction_1?: string;
  attorney_year_1?: string;
  attorney_jurisdiction_2?: string;
  attorney_year_2?: string;
  // Employment details (can be pre-filled from employment history)
  employer_name?: string;
  employer_street?: string;
  employer_city?: string;
  employer_state?: string;
  employer_zip?: string;
  employer_country?: string;
  employer_phone?: string;
  nature_of_business?: string;
  applicant_position?: string;
  from_date?: string;
  to_date?: string;
  full_or_part_time?: string;
  hours_per_week?: string;
  how_ended?: string;
  reason_for_ending?: string;
  // Work description
  work_performed?: string;
  supervision_explanation?: string;
  was_satisfactory?: string; // 'Yes' | 'No'
  additional_info?: string;
}

const SECTION_KEY = 'employment_affirmants';

const getDefaultAffirmant = (): EmploymentAffirmant => ({
  employment_index: undefined,
  affirmant_name: '',
  affirmant_title: '',
  affirmant_employer: '',
  affirmant_street: '',
  affirmant_city: '',
  affirmant_state: '',
  affirmant_zip: '',
  affirmant_country: '',
  affirmant_phone: '',
  affirmant_email: '',
  is_attorney: 'No',
  attorney_jurisdiction_1: '',
  attorney_year_1: '',
  attorney_jurisdiction_2: '',
  attorney_year_2: '',
  employer_name: '',
  employer_street: '',
  employer_city: '',
  employer_state: '',
  employer_zip: '',
  employer_country: '',
  employer_phone: '',
  nature_of_business: '',
  applicant_position: '',
  from_date: '',
  to_date: '',
  full_or_part_time: '',
  hours_per_week: '',
  how_ended: '',
  reason_for_ending: '',
  work_performed: '',
  supervision_explanation: '',
  was_satisfactory: 'Yes',
  additional_info: '',
});

const getAffirmants = (data: any): EmploymentAffirmant[] => {
  if (Array.isArray(data)) {
    return data.map(d => ({ ...getDefaultAffirmant(), ...d }));
  }
  return [];
};

export const GroupEmploymentAffirmants: React.FC = () => {
  const data = useApplicationStore((state) => state.data[SECTION_KEY]);
  const employmentHistory = useApplicationStore((state) => state.data['employment_history']) as any[] | undefined;
  const allData = useApplicationStore((state) => state.data);
  const userId = useApplicationStore((state) => state.userId);
  const setSection = useApplicationStore((state) => state.setSection);
  
  const [isGenerating, setIsGenerating] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const affirmants = useMemo(() => getAffirmants(data), [data]);
  const jobs = useMemo(() => employmentHistory || [], [employmentHistory]);
  
  // Get jobs marked as legal work that don't have affirmants yet
  const legalJobs = useMemo(() => {
    return jobs
      .map((job, index) => ({ ...job, originalIndex: index }))
      .filter(job => job.is_legal_work === true);
  }, [jobs]);

  // Find legal jobs that don't have matching affirmants
  const suggestedJobs = useMemo(() => {
    return legalJobs.filter(job => {
      // Check if there's already an affirmant for this job
      return !affirmants.some(a => a.employment_index === job.originalIndex);
    });
  }, [legalJobs, affirmants]);

  // Quick add from suggested job
  const addFromLegalJob = (jobIndex: number) => {
    const job = jobs[jobIndex];
    if (!job) return;
    
    const newAffirmant: EmploymentAffirmant = {
      ...getDefaultAffirmant(),
      employment_index: jobIndex,
      employer_name: job.employer || '',
      employer_street: job.street || '',
      employer_city: job.city || '',
      employer_state: job.state || '',
      employer_zip: job.zip || '',
      employer_country: job.country || '',
      employer_phone: job.phone || '',
      nature_of_business: job.nature_of_business || '',
      applicant_position: job.position || '',
      from_date: job.from_date || '',
      to_date: job.to_date || '',
      reason_for_ending: job.reason_for_leaving || '',
    };
    
    setSection(SECTION_KEY, [...affirmants, newAffirmant] as any);
  };

  const addAffirmant = () => {
    const updated = [...affirmants, getDefaultAffirmant()];
    setSection(SECTION_KEY, updated as any);
  };

  const removeAffirmant = (index: number) => {
    const updated = affirmants.filter((_, i) => i !== index);
    setSection(SECTION_KEY, updated as any);
  };

  const updateAffirmant = (index: number, field: keyof EmploymentAffirmant, value: string | number) => {
    const updated = [...affirmants];
    updated[index] = { ...updated[index], [field]: value };
    setSection(SECTION_KEY, updated as any);
  };

  const prefillFromJob = (affirmantIndex: number, jobIndex: number) => {
    const job = jobs[jobIndex];
    if (!job) return;
    
    const updated = [...affirmants];
    updated[affirmantIndex] = {
      ...updated[affirmantIndex],
      employment_index: jobIndex,
      employer_name: job.employer || '',
      employer_street: job.street || '',
      employer_city: job.city || '',
      employer_state: job.state || '',
      employer_zip: job.zip || '',
      employer_country: job.country || '',
      employer_phone: job.phone || '',
      nature_of_business: job.nature_of_business || '',
      applicant_position: job.position || '',
      from_date: job.from_date || '',
      to_date: job.to_date || '',
      reason_for_ending: job.reason_for_leaving || '',
    };
    setSection(SECTION_KEY, updated as any);
  };

  const handleGeneratePdf = async (index: number) => {
    if (!userId) {
      setMessage('Session not initialized yet.');
      return;
    }

    const affirmant = affirmants[index];
    if (!affirmant.affirmant_name) {
      setMessage(`Please enter a supervisor name for Affirmant #${index + 1} first.`);
      return;
    }

    try {
      setIsGenerating(index);
      setMessage('Generating PDF...');
      
      // First save the latest data
      await saveDraft(userId, allData);
      
      // Then generate Form D
      const blob = await generateFormD(allData, index);
      
      // Create download link
      const safeName = affirmant.affirmant_name.replace(/[^a-zA-Z0-9]/g, '_');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `employment-affirmation-${index + 1}-${safeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setMessage(`Form D for ${affirmant.employer_name || 'employment'} downloaded!`);
    } catch (error) {
      console.error('Error generating Form D:', error);
      setMessage('Failed to generate PDF.');
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-amber-700 bg-amber-900/30 p-4">
        <h3 className="font-semibold text-amber-300">About Employment Affirmations (Form D)</h3>
        <p className="mt-2 text-sm text-amber-300/80">
          For each <strong className="text-amber-200">law-related job</strong> listed in your employment history, you need a supervisor 
          or employer to complete an Employment Affirmation (Form D). This form attests to your work 
          performance and character during that employment.
        </p>
        <p className="mt-2 text-sm text-amber-300/80">
          <strong className="text-amber-200">Tip:</strong> You can pre-fill employment details from your employment history to save time.
        </p>
      </div>

      {message && (
        <div className="rounded-md bg-slate-700/50 p-3 text-sm text-slate-300">
          {message}
        </div>
      )}

      {/* Suggested Legal Jobs */}
      {suggestedJobs.length > 0 && (
        <div className="rounded-lg border border-blue-700 bg-blue-900/30 p-4">
          <h3 className="font-semibold text-blue-300">Legal Jobs Needing Affirmations</h3>
          <p className="mt-1 text-sm text-blue-300/80">
            These jobs from your employment history are marked as law-related work. Click to add an affirmation:
          </p>
          <div className="mt-3 space-y-2">
            {suggestedJobs.map((job) => (
              <button
                key={job.originalIndex}
                type="button"
                onClick={() => addFromLegalJob(job.originalIndex)}
                className="flex w-full items-center justify-between rounded-md border border-blue-600 bg-blue-900/50 p-3 text-left transition-colors hover:bg-blue-800/50"
              >
                <div>
                  <div className="font-medium text-white">{job.employer || `Job #${job.originalIndex + 1}`}</div>
                  <div className="text-sm text-blue-300">
                    {job.position} • {job.from_date} - {job.to_date || 'Present'}
                  </div>
                </div>
                <span className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                  + Add Affirmation
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {legalJobs.length === 0 && (
        <div className="rounded-lg border border-slate-600 bg-slate-800/50 p-4">
          <p className="text-sm text-slate-400">
            <strong className="text-slate-300">Tip:</strong> Go to the Employment section and check "This is law-related work" 
            for any jobs that require an Employment Affirmation. They'll appear here for quick setup.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Employment Affirmations</h3>
        <Button onClick={addAffirmant} variant="secondary">Add Manually</Button>
      </div>

      {affirmants.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center">
          <p className="text-slate-500">No employment affirmations added yet.</p>
          <p className="mt-2 text-sm text-slate-400">Click "Add Affirmation" for each law-related job that needs verification.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {affirmants.map((affirmant, index) => (
            <AffirmantForm
              key={index}
              index={index}
              affirmant={affirmant}
              jobs={jobs}
              onUpdate={(field, value) => updateAffirmant(index, field, value)}
              onPrefill={(jobIndex) => prefillFromJob(index, jobIndex)}
              onRemove={() => removeAffirmant(index)}
              onGeneratePdf={() => handleGeneratePdf(index)}
              isGenerating={isGenerating === index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface AffirmantFormProps {
  index: number;
  affirmant: EmploymentAffirmant;
  jobs: any[];
  onUpdate: (field: keyof EmploymentAffirmant, value: string | number) => void;
  onPrefill: (jobIndex: number) => void;
  onRemove: () => void;
  onGeneratePdf: () => void;
  isGenerating: boolean;
}

const AffirmantForm: React.FC<AffirmantFormProps> = ({
  index,
  affirmant,
  jobs,
  onUpdate,
  onPrefill,
  onRemove,
  onGeneratePdf,
  isGenerating,
}) => {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-5 ">
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-lg font-semibold text-white">Employment Affirmation #{index + 1}</h3>
        <Button variant="outline" onClick={onRemove} className="text-red-600 hover:bg-red-900/30 border border-red-800">
          Remove
        </Button>
      </div>

      {/* Pre-fill from Job */}
      {jobs.length > 0 && (
        <div className="mb-6 rounded-md bg-slate-700/50 p-4">
          <Label className="text-slate-300">Pre-fill from Employment History</Label>
          <select
            className="mt-2 w-full rounded-md border border-slate-600 bg-slate-800 p-2 text-sm text-white"
            value={affirmant.employment_index ?? ''}
            onChange={(e) => {
              const jobIndex = parseInt(e.target.value, 10);
              if (!isNaN(jobIndex)) {
                onPrefill(jobIndex);
              }
            }}
          >
            <option value="">Select a job to pre-fill...</option>
            {jobs.map((job, i) => (
              <option key={i} value={i}>
                {job.employer || `Job #${i + 1}`} ({job.from_date} - {job.to_date || 'Present'})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Section 1: Affirmant (Supervisor) Info */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-300">
          Section 1: Supervisor / Affirmant Information
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Full Name *</Label>
            <Input
              value={affirmant.affirmant_name}
              onChange={(e) => onUpdate('affirmant_name', e.target.value)}
              placeholder="Supervisor's full name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Title / Role</Label>
            <Input
              value={affirmant.affirmant_title}
              onChange={(e) => onUpdate('affirmant_title', e.target.value)}
              placeholder="e.g., Partner, Supervising Attorney"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Employer / Organization</Label>
            <Input
              value={affirmant.affirmant_employer}
              onChange={(e) => onUpdate('affirmant_employer', e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Work Address</Label>
            <Input
              value={affirmant.affirmant_street}
              onChange={(e) => onUpdate('affirmant_street', e.target.value)}
              placeholder="Street"
            />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input value={affirmant.affirmant_city} onChange={(e) => onUpdate('affirmant_city', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>State</Label>
            <Input value={affirmant.affirmant_state} onChange={(e) => onUpdate('affirmant_state', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>ZIP</Label>
            <Input value={affirmant.affirmant_zip} onChange={(e) => onUpdate('affirmant_zip', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Country</Label>
            <Input value={affirmant.affirmant_country} onChange={(e) => onUpdate('affirmant_country', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={affirmant.affirmant_phone} onChange={(e) => onUpdate('affirmant_phone', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={affirmant.affirmant_email} onChange={(e) => onUpdate('affirmant_email', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Section 2: Attorney Status */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-300">
          Section 2: Attorney Status
        </h4>
        <div className="space-y-4">
          <div>
            <Label>Is this supervisor an attorney?</Label>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  checked={affirmant.is_attorney === 'Yes'}
                  onChange={() => onUpdate('is_attorney', 'Yes')}
                  className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
                /> Yes             </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  checked={affirmant.is_attorney !== 'Yes'}
                  onChange={() => onUpdate('is_attorney', 'No')}
                  className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
                /> No             </label>
            </div>
          </div>

          {affirmant.is_attorney === 'Yes' && (
            <div className="rounded-md bg-slate-700/50 p-4">
              <p className="mb-3 text-sm text-slate-300">
                Enter the jurisdiction(s) where this attorney is admitted.
              </p>
              <div className="space-y-3">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Jurisdiction #1</Label>
                    <Input
                      value={affirmant.attorney_jurisdiction_1}
                      onChange={(e) => onUpdate('attorney_jurisdiction_1', e.target.value)}
                      placeholder="e.g., New York"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Year Admitted #1</Label>
                    <Input
                      value={affirmant.attorney_year_1}
                      onChange={(e) => onUpdate('attorney_year_1', e.target.value)}
                      placeholder="e.g., 2010"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Jurisdiction #2 (optional)</Label>
                    <Input
                      value={affirmant.attorney_jurisdiction_2}
                      onChange={(e) => onUpdate('attorney_jurisdiction_2', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Year Admitted #2</Label>
                    <Input
                      value={affirmant.attorney_year_2}
                      onChange={(e) => onUpdate('attorney_year_2', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Employment Details */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-300">
          Section 3: Employment Details
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Employer / Organization Name</Label>
            <Input
              value={affirmant.employer_name}
              onChange={(e) => onUpdate('employer_name', e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Employer Address</Label>
            <Input
              value={affirmant.employer_street}
              onChange={(e) => onUpdate('employer_street', e.target.value)}
              placeholder="Street"
            />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input value={affirmant.employer_city} onChange={(e) => onUpdate('employer_city', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>State</Label>
            <Input value={affirmant.employer_state} onChange={(e) => onUpdate('employer_state', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>ZIP</Label>
            <Input value={affirmant.employer_zip} onChange={(e) => onUpdate('employer_zip', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Country</Label>
            <Input value={affirmant.employer_country} onChange={(e) => onUpdate('employer_country', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Employer Phone</Label>
            <Input value={affirmant.employer_phone} onChange={(e) => onUpdate('employer_phone', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Nature of Business</Label>
            <Input
              value={affirmant.nature_of_business}
              onChange={(e) => onUpdate('nature_of_business', e.target.value)}
              placeholder="e.g., Legal services, Government"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Applicant's Position</Label>
            <Input
              value={affirmant.applicant_position}
              onChange={(e) => onUpdate('applicant_position', e.target.value)}
              placeholder="e.g., Summer Associate, Law Clerk"
            />
          </div>
          <div className="space-y-1.5">
            <Label>From Date:</Label>
            <Input
              value={affirmant.from_date}
              onChange={(e) => onUpdate('from_date', e.target.value)}
              placeholder="MM/YYYY"
            />
          </div>
          <div className="space-y-1.5">
            <Label>To Date:</Label>
            <Input
              value={affirmant.to_date}
              onChange={(e) => onUpdate('to_date', e.target.value)}
              placeholder="MM/YYYY or Present"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Full-time or Part-time</Label>
            <select
              className="w-full rounded-md border border-slate-700 bg-slate-800 p-2 text-sm text-white placeholder:text-slate-500"
              value={affirmant.full_or_part_time}
              onChange={(e) => onUpdate('full_or_part_time', e.target.value)}
            >
              <option value="">Select...</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Hours per Week</Label>
            <Input
              value={affirmant.hours_per_week}
              onChange={(e) => onUpdate('hours_per_week', e.target.value)}
              placeholder="e.g., 40"
            />
          </div>
          <div className="space-y-1.5">
            <Label>How Employment Ended</Label>
            <Input
              value={affirmant.how_ended}
              onChange={(e) => onUpdate('how_ended', e.target.value)}
              placeholder="e.g., Resigned, Term ended, Still employed"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Reason for Ending</Label>
            <Input
              value={affirmant.reason_for_ending}
              onChange={(e) => onUpdate('reason_for_ending', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Section 4: Work Description */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-300">
          Section 4: Work Description & Performance
        </h4>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Description of Law-Related Work Performed</Label>
            <textarea
              value={affirmant.work_performed}
              onChange={(e) => onUpdate('work_performed', e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-800 p-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={3}
              placeholder="Research, drafting, client interaction, court appearances, etc."
            />
          </div>
          <div className="space-y-1.5">
            <Label>How Closely Was the Applicant Supervised?</Label>
            <textarea
              value={affirmant.supervision_explanation}
              onChange={(e) => onUpdate('supervision_explanation', e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-800 p-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={2}
              placeholder="Explain how you monitored or supervised the applicant's work"
            />
          </div>
          <div>
            <Label>Was the applicant's work and conduct satisfactory?</Label>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  checked={affirmant.was_satisfactory === 'Yes'}
                  onChange={() => onUpdate('was_satisfactory', 'Yes')}
                  className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
                /> Yes             </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  checked={affirmant.was_satisfactory === 'No'}
                  onChange={() => onUpdate('was_satisfactory', 'No')}
                  className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
                /> No             </label>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Additional Information (optional)</Label>
            <textarea
              value={affirmant.additional_info}
              onChange={(e) => onUpdate('additional_info', e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-800 p-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={2}
              placeholder="Any facts bearing on applicant's qualifications, moral character, or fitness"
            />
          </div>
        </div>
      </div>

      {/* Generate PDF Button */}
      <div className="border-t border-slate-200 pt-4">
        <Button
          type="button"
          onClick={onGeneratePdf}
          disabled={isGenerating || !affirmant.affirmant_name}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300"
        >
          {isGenerating ? 'Generating...' : `Generate Form D PDF for ${affirmant.employer_name || 'this employment'}`}
        </Button>
        {!affirmant.affirmant_name && (
          <p className="mt-2 text-center text-xs text-slate-500">Enter a supervisor name to enable PDF generation</p>
        )}
      </div>
    </div>
  );
};

export default GroupEmploymentAffirmants;

