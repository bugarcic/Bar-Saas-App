'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Button from '../ui/Button';
import DatePicker from '../ui/DatePicker';
import Select from '../ui/Select';
import Radio from '../ui/Radio';
import Checkbox from '../ui/Checkbox';
import Textarea from '../ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { US_STATES } from '../../lib/constants';
import { EmploymentEntry, SelfEmploymentData, EmploymentDisciplineData } from '../../types/schema';

// Simple US phone formatter: (123) 456-7890 as user types
const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

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
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Employment History</CardTitle>
            <p className="text-sm text-slate-300 mt-1">List every job since age 21 or in the last 10 years.</p>
          </div>
          <Button onClick={addEmployment} variant="secondary">Add Job</Button>
        </CardHeader>

        <CardContent className="space-y-6">
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
                    <Input value={entry.employer as string} onChange={(e) => updateEmployment(i, 'employer', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Position / Title</Label>
                    <Input value={entry.position as string} onChange={(e) => updateEmployment(i, 'position', e.target.value)} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="mb-3 block">From:</Label>
                    <DatePicker
                      selected={entry.from_date ? new Date(entry.from_date as string + '-01') : null}
                      onChange={(date) => updateEmployment(i, 'from_date', date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : '')}
                      showMonthYearPicker
                      dateFormat="MM/yyyy"
                      placeholder="Select month/year..."
                    />
                  </div>
                  <div>
                    <Label className="mb-3 block">To:</Label>
                    <DatePicker
                      selected={entry.to_date ? new Date(entry.to_date as string + '-01') : null}
                      onChange={(date) => updateEmployment(i, 'to_date', date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : '')}
                      showMonthYearPicker
                      dateFormat="MM/yyyy"
                      placeholder="Select month/year..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Employer Address</Label>
                  <Input value={entry.street as string} onChange={(e) => updateEmployment(i, 'street', e.target.value)} placeholder="Street" />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input value={entry.city as string} onChange={(e) => updateEmployment(i, 'city', e.target.value)} placeholder="City" />
                    <Select
                      options={US_STATES}
                      value={entry.state as string || ''}
                      onChange={(value) => updateEmployment(i, 'state', value)}
                      placeholder="State..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input value={entry.zip as string} onChange={(e) => updateEmployment(i, 'zip', e.target.value)} placeholder="Zip" />
                    <Input value={entry.country as string} onChange={(e) => updateEmployment(i, 'country', e.target.value)} placeholder="Country" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={entry.phone || ''}
                      onChange={(e) => updateEmployment(i, 'phone', formatPhone(e.target.value))}
                      inputMode="tel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nature of Business</Label>
                    <Input value={entry.nature_of_business as string} onChange={(e) => updateEmployment(i, 'nature_of_business', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reason for Leaving</Label>
                  <Input value={entry.reason_for_leaving as string} onChange={(e) => updateEmployment(i, 'reason_for_leaving', e.target.value)} />
                </div>

                {/* Legal Work Checkbox */}
                <div className="col-span-full mt-2">
                  <Checkbox
                    label="This is law-related work"
                    description="Check this if this job involved legal work (will need Employment Affirmation Form D)"
                    checked={entry.is_legal_work || false}
                    onChange={(e) => updateEmployment(i, 'is_legal_work', e.target.checked ? 'true' : '')}
                  />
                </div>
              </div>
            </div>
          ))}
          {employment.length === 0 && (
            <p className="text-center text-sm text-slate-500 italic">No employment history added yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Self Employment */}
      <Card>
        <CardHeader>
          <CardTitle>Self-Employment & Other Business</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>Have you ever been involved in any business, occupation, or profession on your own or with others (partnerships, etc.)?</Label>
          <div className="flex gap-4">
            <Radio
              label="Yes"
              checked={selfEmployment.has_issue?.value === 'Yes'}
              onChange={() => updateSelfEmployment('has_issue', { type: 'radio', value: 'Yes' })}
            />
            <Radio
              label="No"
              checked={selfEmployment.has_issue?.value === 'No'}
              onChange={() => updateSelfEmployment('has_issue', { type: 'radio', value: 'No' })}
            />
          </div>

          {selfEmployment.has_issue?.value === 'Yes' && (
            <div className="space-y-4 rounded-md bg-slate-700/50 p-4">
              <div className="space-y-2">
                <Label>Details (Nature, Address, Dates, Your Role, Partners)</Label>
                <Textarea
                  value={selfEmployment.details as string}
                  onChange={(e) => updateSelfEmployment('details', e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Legal actions or judgments against the business?</Label>
                <Textarea
                  value={selfEmployment.judgments as string}
                  onChange={(e) => updateSelfEmployment('judgments', e.target.value)}
                  rows={2}
                  placeholder="If yes, describe."
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employment Discipline */}
      <Card>
        <CardHeader>
          <CardTitle>Employment Discipline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>Have you ever been fired, discharged, or asked to resign from any job for cause?</Label>
          <div className="flex gap-4">
            <Radio
              label="Yes"
              checked={discipline.has_issue?.value === 'Yes'}
              onChange={() => updateDiscipline('has_issue', { type: 'radio', value: 'Yes' })}
            />
            <Radio
              label="No"
              checked={discipline.has_issue?.value === 'No'}
              onChange={() => updateDiscipline('has_issue', { type: 'radio', value: 'No' })}
            />
          </div>

          {discipline.has_issue?.value === 'Yes' && (
            <div className="space-y-2 rounded-md bg-slate-700/50 p-4">
              <Label>Explanation (Job, Date, Reason)</Label>
              <Textarea
                value={discipline.details as string}
                onChange={(e) => updateDiscipline('details', e.target.value)}
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Group5Employment;
