'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Button from '../ui/Button';
import DatePicker from '../ui/DatePicker';
import Select from '../ui/Select';
import { US_STATES, LAW_DEGREES } from '../../lib/constants';

interface EducationEntry {
  from_date?: string;
  to_date?: string;
  school_name?: string;
  degree?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  no_degree_reason?: string;
}

interface EducationDiscipline {
  has_issue?: { value?: string };
  institution?: string;
  date?: string;
  reason?: string;
}

interface DiscontinuedStudies {
  has_issue?: { value?: string };
  institution?: string;
  date?: string;
  reason?: string;
}

const createEmptyEntry = (): EducationEntry => ({
  from_date: '',
  to_date: '',
  school_name: '',
  degree: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  no_degree_reason: '',
});

const getEducationData = (data: any[]): EducationEntry[] => {
  if (Array.isArray(data) && data.length > 0) return data;
  // Start with 1 empty entry (progressive disclosure)
  return [createEmptyEntry()];
};

const getLawSchoolData = (data: any[]): EducationEntry[] => {
  if (Array.isArray(data) && data.length > 0) return data;
  // Start with 1 empty entry
  return [createEmptyEntry()];
};

const getDisciplineData = (data: any): EducationDiscipline => ({
  has_issue: { value: '' },
  institution: '',
  date: '',
  reason: '',
  ...(data ?? {}),
});

const getDiscontinuedData = (data: any): DiscontinuedStudies => ({
  has_issue: { value: '' },
  institution: '',
  date: '',
  reason: '',
  ...(data ?? {}),
});

export const Group4Education: React.FC = () => {
  const undergradData = useApplicationStore((state) => state.data['education_undergrad']);
  const lawSchoolData = useApplicationStore((state) => state.data['law_schools']);
  // Don't default to {} in selector to avoid unstable reference
  const characterIssues = useApplicationStore((state) => state.data['character_issues']);
  const discontinuedData = useApplicationStore((state) => state.data['discontinued_studies']);
  const setField = useApplicationStore((state) => state.setField);
  const setSection = useApplicationStore((state) => state.setSection);

  const undergrad = useMemo(() => getEducationData(undergradData as any), [undergradData]);
  const lawSchools = useMemo(() => getLawSchoolData(lawSchoolData as any), [lawSchoolData]);
  
  const deniedAdmission = useMemo(() => getDisciplineData((characterIssues as any)?.denied_admission), [characterIssues]);
  const schoolDiscipline = useMemo(() => getDisciplineData((characterIssues as any)?.school_discipline), [characterIssues]);
  const discontinued = useMemo(() => getDiscontinuedData(discontinuedData), [discontinuedData]);

  const updateUndergrad = (index: number, field: keyof EducationEntry, value: string) => {
    const updated = [...undergrad];
    updated[index] = { ...updated[index], [field]: value };
    setSection('education_undergrad', updated as any);
  };

  const addUndergrad = () => {
    setSection('education_undergrad', [...undergrad, createEmptyEntry()] as any);
  };

  const removeUndergrad = (index: number) => {
    if (undergrad.length <= 1) return; // Keep at least one entry
    const updated = undergrad.filter((_, i) => i !== index);
    setSection('education_undergrad', updated as any);
  };

  const updateLawSchool = (index: number, field: keyof EducationEntry, value: string) => {
    const updated = [...lawSchools];
    updated[index] = { ...updated[index], [field]: value };
    setSection('law_schools', updated as any);
  };

  const addLawSchool = () => {
    setSection('law_schools', [...lawSchools, createEmptyEntry()] as any);
  };

  const removeLawSchool = (index: number) => {
    if (lawSchools.length <= 1) return;
    const updated = lawSchools.filter((_, i) => i !== index);
    setSection('law_schools', updated as any);
  };

  const updateDiscipline = (type: 'denied_admission' | 'school_discipline', field: string, value: any) => {
    const updated = { ...(characterIssues as any || {}) };
    updated[type] = { ...getDisciplineData(updated[type]), [field]: value };
    setSection('character_issues', updated);
  };

  const updateDiscontinued = (field: string, value: any) => {
    setField('discontinued_studies', field, value);
  };

  return (
    <div className="space-y-8">
      {/* Undergraduate & Graduate Schools - NOT Law School */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Undergraduate & Graduate Schools</h3>
            <p className="mt-1 text-sm text-slate-400">
              List all colleges, universities, and professional schools attended.
            </p>
          </div>
          <span className="rounded-full bg-blue-900/50 px-2 py-1 text-xs font-medium text-blue-300">
            Not Law School
          </span>
        </div>
        <div className="mb-4 rounded-md border border-blue-800/50 bg-blue-900/20 p-3 text-sm text-blue-300">
          <strong>Note:</strong> Do not include law schools here. Law schools should be listed in the section below.
        </div>
        {undergrad.map((entry, i) => (
          <SchoolEntry
            key={i}
            entry={entry}
            index={i}
            updateFn={updateUndergrad}
            onRemove={undergrad.length > 1 ? () => removeUndergrad(i) : undefined}
            titlePrefix="School"
            isLawSchool={false}
          />
        ))}
        <Button type="button" onClick={addUndergrad} className="mt-2">
          + Add Another School
        </Button>
      </div>

      {/* Law Schools */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
        <h3 className="mb-2 text-base font-semibold text-white">Law Schools</h3>
        <p className="mb-4 text-sm text-slate-400">List every law school attended, including those where you did not complete a degree.</p>
        {lawSchools.map((entry, i) => (
          <SchoolEntry
            key={i}
            entry={entry}
            index={i}
            updateFn={updateLawSchool}
            onRemove={lawSchools.length > 1 ? () => removeLawSchool(i) : undefined}
            titlePrefix="Law School"
            isLawSchool={true}
          />
        ))}
        <Button type="button" onClick={addLawSchool} className="mt-2">
          + Add Another Law School
        </Button>
      </div>

      {/* Improved wording for Denied Admission */}
      <DisciplineSection
        title="Application Denied to Any Educational Institution"
        description="Were you ever denied admission to any college, university, graduate, or professional school?"
        data={deniedAdmission}
        updateFn={(field, value) => updateDiscipline('denied_admission', field, value)}
      />

      <DisciplineSection
        title="Academic Discipline"
        description="Were you ever placed on academic probation, suspended, expelled, or otherwise disciplined by any educational institution?"
        data={schoolDiscipline}
        updateFn={(field, value) => updateDiscipline('school_discipline', field, value)}
      />

      <DisciplineSection
        title="Requested to Withdraw or Discontinue Studies"
        description="Were you ever asked to withdraw or discontinue studies at any educational institution?"
        data={discontinued}
        updateFn={(field, value) => updateDiscontinued(field, value)}
      />
    </div>
  );
};

// Extracting sub-components prevents inline function creation in render causing issues,
// and makes the update cycle cleaner.

const SchoolEntry: React.FC<{
  entry: EducationEntry;
  index: number;
  updateFn: (index: number, field: keyof EducationEntry, value: string) => void;
  onRemove?: () => void;
  titlePrefix: string;
  isLawSchool: boolean;
}> = ({ entry, index, updateFn, onRemove, titlePrefix, isLawSchool }) => (
  <div className="mb-6 rounded-md border border-slate-600 bg-slate-700/30 p-4">
    <div className="mb-3 flex items-center justify-between">
      <h4 className="font-medium text-white">{titlePrefix} #{index + 1}</h4>
      {onRemove && (
        <Button variant="outline" onClick={onRemove} className="text-xs">
          Remove
        </Button>
      )}
    </div>
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label>School Name</Label>
        <Input value={entry.school_name} onChange={(e) => updateFn(index, 'school_name', e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-3 block">From:</Label>
          <DatePicker
            selected={entry.from_date ? new Date(entry.from_date + '-01') : null}
            onChange={(date) => updateFn(index, 'from_date', date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : '')}
            showMonthYearPicker
            dateFormat="MM/yyyy"
            placeholder="Select month/year..."
          />
        </div>
        <div>
          <Label className="mb-3 block">To:</Label>
          <DatePicker
            selected={entry.to_date ? new Date(entry.to_date + '-01') : null}
            onChange={(date) => updateFn(index, 'to_date', date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : '')}
            showMonthYearPicker
            dateFormat="MM/yyyy"
            placeholder="Select month/year..."
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Degree Received</Label>
        {isLawSchool ? (
          <Select
            options={LAW_DEGREES}
            value={entry.degree || ''}
            onChange={(value) => updateFn(index, 'degree', value)}
            placeholder="Select degree..."
          />
        ) : (
          <Input 
            value={entry.degree} 
            onChange={(e) => updateFn(index, 'degree', e.target.value)} 
            placeholder="e.g., Bachelor of Arts, Master of Science"
          />
        )}
      </div>
      <div className="space-y-2">
        <Label>If no degree, reason</Label>
        <Input 
          value={entry.no_degree_reason} 
          onChange={(e) => updateFn(index, 'no_degree_reason', e.target.value)} 
          placeholder="e.g., Currently enrolled, Transferred"
        />
      </div>
      <div className="space-y-2">
        <Label>School Address</Label>
        <div className="grid gap-2">
          <Input value={entry.street} onChange={(e) => updateFn(index, 'street', e.target.value)} placeholder="Street" />
          <div className="grid grid-cols-2 gap-2">
            <Input value={entry.city} onChange={(e) => updateFn(index, 'city', e.target.value)} placeholder="City" />
            <Select
              options={US_STATES}
              value={entry.state || ''}
              onChange={(value) => updateFn(index, 'state', value)}
              placeholder="State..."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input value={entry.zip} onChange={(e) => updateFn(index, 'zip', e.target.value)} placeholder="Zip" />
            <Input value={entry.country} onChange={(e) => updateFn(index, 'country', e.target.value)} placeholder="Country" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DisciplineSection: React.FC<{
  title: string;
  description?: string;
  data: EducationDiscipline | DiscontinuedStudies;
  updateFn: (field: string, value: any) => void;
}> = ({ title, description, data, updateFn }) => (
  <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
    <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
    {description && <p className="mb-4 text-sm text-slate-400">{description}</p>}
    <div className="space-y-4">
      <div className="flex gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-slate-300">
          <input
            type="radio"
            checked={data.has_issue?.value === 'Yes'}
            onChange={() => updateFn('has_issue', { type: 'radio', value: 'Yes' })}
            className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
          /> 
          <span>Yes</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-slate-300">
          <input
            type="radio"
            checked={data.has_issue?.value === 'No'}
            onChange={() => updateFn('has_issue', { type: 'radio', value: 'No' })}
            className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
          /> 
          <span>No</span>
        </label>
      </div>

      {data.has_issue?.value === 'Yes' && (
        <div className="space-y-4 rounded-md border border-slate-600 bg-slate-700/50 p-4">
          <div className="space-y-2">
            <Label>Institution Name</Label>
            <Input value={data.institution} onChange={(e) => updateFn('institution', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <DatePicker
              selected={data.date ? new Date(data.date) : null}
              onChange={(date) => updateFn('date', date ? date.toISOString().split('T')[0] : '')}
              placeholder="Select date..."
              maxDate={new Date()}
            />
          </div>
          <div className="space-y-2">
            <Label>Explanation / Reason</Label>
            <textarea
              value={data.reason}
              onChange={(e) => updateFn('reason', e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-800 p-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={3}
              placeholder="Please provide a full explanation..."
            />
          </div>
        </div>
      )}
    </div>
  </div>
);

export default Group4Education;
