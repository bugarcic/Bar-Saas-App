'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Button from '../ui/Button';
import DatePicker from '../ui/DatePicker';
import Select from '../ui/Select';
import { US_STATES } from '../../lib/constants';

interface EmploymentEntry {
  from_date?: string;
  to_date?: string;
  employer?: string;
  position?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  nature_of_business?: string;
  reason_for_leaving?: string;
  is_legal_work?: boolean; // Mark as law-related work for affirmation
}

interface SelfEmploymentData {
  has_issue?: { value?: string };
  details?: string;
  judgments?: string;
}

interface EmploymentDisciplineData {
  has_issue?: { value?: string };
  details?: string;
}

const getEmploymentData = (data: any[]): EmploymentEntry[] => {
  if (Array.isArray(data)) return data;
  // Default to empty list if none, user can add
  return [];
};

const getSelfEmploymentData = (data: any): SelfEmploymentData => ({
  has_issue: { value: '' },
  details: '',
  judgments: '',
  ...(data ?? {}),
});

const getDisciplineData = (data: any): EmploymentDisciplineData => ({
  has_issue: { value: '' },
  details: '',
  ...(data ?? {}),
});

export const Group5Employment: React.FC = () => {
  const employmentHistory = useApplicationStore((state) => state.data['employment_history']);
  const selfEmploymentData = useApplicationStore((state) => state.data['self_employment']);
  const disciplineData = useApplicationStore((state) => state.data['employment_discipline']);
  const setSection = useApplicationStore((state) => state.setSection);
  const setField = useApplicationStore((state) => state.setField);

  const employment = useMemo(() => getEmploymentData(employmentHistory as any[]), [employmentHistory]);
  const selfEmployment = useMemo(() => getSelfEmploymentData(selfEmploymentData), [selfEmploymentData]);
  const discipline = useMemo(() => getDisciplineData(disciplineData), [disciplineData]);

  const addEmployment = () => {
    const updated = [...employment, {
      from_date: '', to_date: '', employer: '', position: '', street: '',
      city: '', state: '', zip: '', country: '', phone: '',
      nature_of_business: '', reason_for_leaving: ''
    }];
    setSection('employment_history', updated as any);
  };

  const removeEmployment = (index: number) => {
    const updated = employment.filter((_, i) => i !== index);
    setSection('employment_history', updated as any);
  };

  const updateEmployment = (index: number, field: keyof EmploymentEntry, value: string | boolean) => {
    const updated = [...employment];
    // Handle is_legal_work as boolean
    if (field === 'is_legal_work') {
      updated[index] = { ...updated[index], [field]: value === 'true' || value === true };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setSection('employment_history', updated as any);
  };

  const updateSelfEmployment = (field: string, value: any) => {
    setField('self_employment', field, value);
  };

  const updateDiscipline = (field: string, value: any) => {
    setField('employment_discipline', field, value);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 ">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Employment History</h3>
            <p className="text-sm text-slate-300">List every job since age 21 or in the last 10 years.</p>
          </div>
          <Button onClick={addEmployment} variant="secondary">Add Job</Button>
        </div>

        <div className="space-y-6">
          {employment.map((entry, i) => (
            <div key={i} className="rounded-md border border-slate-600 bg-slate-700/30 p-4">
              <div className="mb-4 flex items-center justify-between border-b border-slate-600 pb-2">
                <h4 className="font-medium text-white">Job #{i + 1}</h4>
                <Button variant="outline" onClick={() => removeEmployment(i)} className="text-red-400 hover:bg-red-900/30 border border-red-800 text-xs">Remove</Button>
              </div>
              
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Employer Name</Label>
                    <Input value={entry.employer} onChange={(e) => updateEmployment(i, 'employer', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Position / Title</Label>
                    <Input value={entry.position} onChange={(e) => updateEmployment(i, 'position', e.target.value)} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="mb-3 block">From:</Label>
                    <DatePicker
                      selected={entry.from_date ? new Date(entry.from_date + '-01') : null}
                      onChange={(date) => updateEmployment(i, 'from_date', date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : '')}
                      showMonthYearPicker
                      dateFormat="MM/yyyy"
                      placeholder="Select month/year..."
                    />
                  </div>
                  <div>
                    <Label className="mb-3 block">To:</Label>
                    <DatePicker
                      selected={entry.to_date ? new Date(entry.to_date + '-01') : null}
                      onChange={(date) => updateEmployment(i, 'to_date', date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : '')}
                      showMonthYearPicker
                      dateFormat="MM/yyyy"
                      placeholder="Select month/year..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Employer Address</Label>
                  <Input value={entry.street} onChange={(e) => updateEmployment(i, 'street', e.target.value)} placeholder="Street" />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input value={entry.city} onChange={(e) => updateEmployment(i, 'city', e.target.value)} placeholder="City" />
                    <Select
                      options={US_STATES}
                      value={entry.state || ''}
                      onChange={(value) => updateEmployment(i, 'state', value)}
                      placeholder="State..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input value={entry.zip} onChange={(e) => updateEmployment(i, 'zip', e.target.value)} placeholder="Zip" />
                    <Input value={entry.country} onChange={(e) => updateEmployment(i, 'country', e.target.value)} placeholder="Country" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={entry.phone} onChange={(e) => updateEmployment(i, 'phone', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nature of Business</Label>
                    <Input value={entry.nature_of_business} onChange={(e) => updateEmployment(i, 'nature_of_business', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reason for Leaving</Label>
                  <Input value={entry.reason_for_leaving} onChange={(e) => updateEmployment(i, 'reason_for_leaving', e.target.value)} />
                </div>

                {/* Legal Work Checkbox */}
                <div className="col-span-full mt-2">
                  <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    entry.is_legal_work
                      ? 'border-blue-500 bg-blue-900/30'
                      : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={entry.is_legal_work || false}
                      onChange={(e) => updateEmployment(i, 'is_legal_work', e.target.checked ? 'true' : '')}
                      className="h-5 w-5 rounded border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-medium text-white">This is law-related work</div>
                      <div className="text-xs text-slate-400">
                        Check this if this job involved legal work (will need Employment Affirmation Form D)
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          ))}
          {employment.length === 0 && (
            <p className="text-center text-sm text-slate-500 italic">No employment history added yet.</p>
          )}
        </div>
      </div>

      {/* Self Employment */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 ">
        <h3 className="mb-4 text-base font-semibold text-white">Self-Employment & Other Business</h3>
        <div className="space-y-4">
          <Label>Have you ever been involved in any business, occupation, or profession on your own or with others (partnerships, etc.)?</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="radio"
                checked={selfEmployment.has_issue?.value === 'Yes'}
                onChange={() => updateSelfEmployment('has_issue', { type: 'radio', value: 'Yes' })}
                className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
              /> Yes             </label>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="radio"
                checked={selfEmployment.has_issue?.value === 'No'}
                onChange={() => updateSelfEmployment('has_issue', { type: 'radio', value: 'No' })}
                className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
              /> No             </label>
          </div>

          {selfEmployment.has_issue?.value === 'Yes' && (
            <div className="space-y-4 rounded-md bg-slate-700/50 p-4">
              <div className="space-y-2">
                <Label>Details (Nature, Address, Dates, Your Role, Partners)</Label>
                <textarea
                  value={selfEmployment.details}
                  onChange={(e) => updateSelfEmployment('details', e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-800 p-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Legal actions or judgments against the business?</Label>
                <textarea
                  value={selfEmployment.judgments}
                  onChange={(e) => updateSelfEmployment('judgments', e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-800 p-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={2}
                  placeholder="If yes, describe."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Employment Discipline */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 ">
        <h3 className="mb-4 text-base font-semibold text-white">Employment Discipline</h3>
        <div className="space-y-4">
          <Label>Have you ever been fired, discharged, or asked to resign from any job for cause?</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="radio"
                checked={discipline.has_issue?.value === 'Yes'}
                onChange={() => updateDiscipline('has_issue', { type: 'radio', value: 'Yes' })}
                className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
              /> Yes             </label>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="radio"
                checked={discipline.has_issue?.value === 'No'}
                onChange={() => updateDiscipline('has_issue', { type: 'radio', value: 'No' })}
                className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
              /> No             </label>
          </div>

          {discipline.has_issue?.value === 'Yes' && (
            <div className="space-y-2 rounded-md bg-slate-700/50 p-4">
              <Label>Explanation (Job, Date, Reason)</Label>
              <textarea
                value={discipline.details}
                onChange={(e) => updateDiscipline('details', e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-800 p-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Group5Employment;
