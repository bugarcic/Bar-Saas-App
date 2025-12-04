'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Button from '../ui/Button';
import DatePicker from '../ui/DatePicker';
import Select from '../ui/Select';
import Radio from '../ui/Radio';
import Textarea from '../ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { US_STATES, LAW_DEGREES } from '../../lib/constants';
import { EducationEntry, DisciplineData } from '../../types/schema';

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

const getDisciplineData = (data: any): DisciplineData => ({
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
  const discontinued = useMemo(() => getDisciplineData(discontinuedData), [discontinuedData]);

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
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>Undergraduate & Graduate Schools</CardTitle>
            <CardDescription className="mt-1">
              List all colleges, universities, and professional schools attended.
            </CardDescription>
          </div>
          <span className="rounded-full bg-blue-900/50 px-2 py-1 text-xs font-medium text-blue-300">
            Not Law School
          </span>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Law Schools */}
      <Card>
        <CardHeader>
          <CardTitle>Law Schools</CardTitle>
          <CardDescription>List every law school attended, including those where you did not complete a degree.</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

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
        <Input value={entry.school_name as string} onChange={(e) => updateFn(index, 'school_name', e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-3 block">From:</Label>
          <DatePicker
            selected={entry.from_date ? new Date(entry.from_date as string + '-01') : null}
            onChange={(date) => updateFn(index, 'from_date', date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : '')}
            showMonthYearPicker
            dateFormat="MM/yyyy"
            placeholder="Select month/year..."
          />
        </div>
        <div>
          <Label className="mb-3 block">To:</Label>
          <DatePicker
            selected={entry.to_date ? new Date(entry.to_date as string + '-01') : null}
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
            value={entry.degree as string || ''}
            onChange={(value) => updateFn(index, 'degree', value)}
            placeholder="Select degree..."
          />
        ) : (
          <Input 
            value={entry.degree as string} 
            onChange={(e) => updateFn(index, 'degree', e.target.value)} 
            placeholder="e.g., Bachelor of Arts, Master of Science"
          />
        )}
      </div>
      <div className="space-y-2">
        <Label>If no degree, reason</Label>
        <Input 
          value={entry.no_degree_reason as string} 
          onChange={(e) => updateFn(index, 'no_degree_reason', e.target.value)} 
          placeholder="e.g., Currently enrolled, Transferred"
        />
      </div>
      <div className="space-y-2">
        <Label>School Address</Label>
        <div className="grid gap-2">
          <Input value={entry.street as string} onChange={(e) => updateFn(index, 'street', e.target.value)} placeholder="Street" />
          <div className="grid grid-cols-2 gap-2">
            <Input value={entry.city as string} onChange={(e) => updateFn(index, 'city', e.target.value)} placeholder="City" />
            <Select
              options={US_STATES}
              value={entry.state as string || ''}
              onChange={(value) => updateFn(index, 'state', value)}
              placeholder="State..."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input value={entry.zip as string} onChange={(e) => updateFn(index, 'zip', e.target.value)} placeholder="Zip" />
            <Input value={entry.country as string} onChange={(e) => updateFn(index, 'country', e.target.value)} placeholder="Country" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DisciplineSection: React.FC<{
  title: string;
  description?: string;
  data: DisciplineData;
  updateFn: (field: string, value: any) => void;
}> = ({ title, description, data, updateFn }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex gap-4">
        <Radio
          label="Yes"
          checked={data.has_issue?.value === 'Yes'}
          onChange={() => updateFn('has_issue', { type: 'radio', value: 'Yes' })}
        />
        <Radio
          label="No"
          checked={data.has_issue?.value === 'No'}
          onChange={() => updateFn('has_issue', { type: 'radio', value: 'No' })}
        />
      </div>

      {data.has_issue?.value === 'Yes' && (
        <div className="space-y-4 rounded-md border border-slate-600 bg-slate-700/50 p-4">
          <div className="space-y-2">
            <Label>Institution Name</Label>
            <Input value={data.institution as string} onChange={(e) => updateFn('institution', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <DatePicker
              selected={data.date ? new Date(data.date as string) : null}
              onChange={(date) => updateFn('date', date ? date.toISOString().split('T')[0] : '')}
              placeholder="Select date..."
              maxDate={new Date()}
            />
          </div>
          <div className="space-y-2">
            <Label>Explanation / Reason</Label>
            <Textarea
              value={data.reason as string}
              onChange={(e) => updateFn('reason', e.target.value)}
              rows={3}
              placeholder="Please provide a full explanation..."
            />
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

export default Group4Education;
