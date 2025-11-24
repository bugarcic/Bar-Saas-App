'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';

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

const getEducationData = (data: any[]): EducationEntry[] => {
  if (Array.isArray(data)) return data;
  // Default to 3 empty entries for undergrad as per map structure
  return Array.from({ length: 3 }, () => ({
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
  }));
};

const getLawSchoolData = (data: any[]): EducationEntry[] => {
  if (Array.isArray(data)) return data;
  return Array.from({ length: 2 }, () => ({
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
  }));
};

const getDisciplineData = (data: any): EducationDiscipline => ({
  has_issue: { value: 'No' },
  institution: '',
  date: '',
  reason: '',
  ...(data ?? {}),
});

const getDiscontinuedData = (data: any): DiscontinuedStudies => ({
  has_issue: { value: 'No' },
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
    // Ensure we have a new object for the entry
    updated[index] = { ...updated[index], [field]: value };
    setSection('education_undergrad', updated as any);
  };

  const updateLawSchool = (index: number, field: keyof EducationEntry, value: string) => {
    const updated = [...lawSchools];
    updated[index] = { ...updated[index], [field]: value };
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
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-slate-900">Undergraduate & Graduate Schools</h3>
        <p className="mb-4 text-sm text-slate-600">List colleges, universities, and professional schools (other than law schools).</p>
        {undergrad.map((entry, i) => (
          <SchoolEntry
             key={i}
             entry={entry}
             index={i}
             updateFn={updateUndergrad}
             titlePrefix="School"
          />
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-slate-900">Law Schools</h3>
        <p className="mb-4 text-sm text-slate-600">List every law school attended.</p>
        {lawSchools.map((entry, i) => (
          <SchoolEntry
             key={i}
             entry={entry}
             index={i}
             updateFn={updateLawSchool}
             titlePrefix="Law School"
          />
        ))}
      </div>

      <DisciplineSection
        title="Denied Admission"
        data={deniedAdmission}
        updateFn={(field, value) => updateDiscipline('denied_admission', field, value)}
      />

      <DisciplineSection
        title="School Discipline (Probation, Suspension, etc.)"
        data={schoolDiscipline}
        updateFn={(field, value) => updateDiscipline('school_discipline', field, value)}
      />

      <DisciplineSection
        title="Requested to Discontinue Studies"
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
  titlePrefix: string;
}> = ({ entry, index, updateFn, titlePrefix }) => (
  <div className="mb-6 rounded-md border border-slate-200 p-4">
    <h4 className="mb-3 font-medium text-slate-800">{titlePrefix} #{index + 1}</h4>
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label>School Name</Label>
        <Input value={entry.school_name} onChange={(e) => updateFn(index, 'school_name', e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>From (MM/YYYY)</Label>
          <Input value={entry.from_date} onChange={(e) => updateFn(index, 'from_date', e.target.value)} placeholder="MM/YYYY" />
        </div>
        <div className="space-y-2">
          <Label>To (MM/YYYY)</Label>
          <Input value={entry.to_date} onChange={(e) => updateFn(index, 'to_date', e.target.value)} placeholder="MM/YYYY" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Degree Received</Label>
        <Input value={entry.degree} onChange={(e) => updateFn(index, 'degree', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>If no degree, reason</Label>
        <Input value={entry.no_degree_reason} onChange={(e) => updateFn(index, 'no_degree_reason', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Address (Street, City, State, Zip, Country)</Label>
        <div className="grid gap-2">
          <Input value={entry.street} onChange={(e) => updateFn(index, 'street', e.target.value)} placeholder="Street" />
          <div className="grid grid-cols-2 gap-2">
            <Input value={entry.city} onChange={(e) => updateFn(index, 'city', e.target.value)} placeholder="City" />
            <Input value={entry.state} onChange={(e) => updateFn(index, 'state', e.target.value)} placeholder="State" />
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
  data: EducationDiscipline | DiscontinuedStudies;
  updateFn: (field: string, value: any) => void;
}> = ({ title, data, updateFn }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <h3 className="mb-4 text-base font-semibold text-slate-900">{title}</h3>
    <div className="space-y-4">
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={data.has_issue?.value === 'Yes'}
            onChange={() => updateFn('has_issue', { type: 'radio', value: 'Yes' })}
            className="h-4 w-4 text-blue-600"
          />
          Yes
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={data.has_issue?.value === 'No'}
            onChange={() => updateFn('has_issue', { type: 'radio', value: 'No' })}
            className="h-4 w-4 text-blue-600"
          />
          No
        </label>
      </div>

      {data.has_issue?.value === 'Yes' && (
        <div className="space-y-4 rounded-md bg-slate-50 p-4">
          <div className="space-y-2">
            <Label>Institution Name</Label>
            <Input value={data.institution} onChange={(e) => updateFn('institution', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input value={data.date} onChange={(e) => updateFn('date', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Explanation / Reason</Label>
            <Input value={data.reason} onChange={(e) => updateFn('reason', e.target.value)} />
          </div>
        </div>
      )}
    </div>
  </div>
);

export default Group4Education;
