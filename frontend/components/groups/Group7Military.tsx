'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';

interface MilitaryData {
  has_service?: { value?: string };
  from_date?: string;
  to_date?: string;
  location?: string;
  branch?: string;
  nature_of_service?: string;
  discharge_details?: string;
}

interface MilitaryDiscipline {
  has_issue?: { value?: string };
  details?: string;
}

const getMilitaryData = (data: any): MilitaryData => ({
  has_service: { value: 'No' },
  from_date: '',
  to_date: '',
  location: '',
  branch: '',
  nature_of_service: '',
  discharge_details: '',
  ...(data ?? {}),
});

const getDisciplineData = (data: any): MilitaryDiscipline => ({
  has_issue: { value: 'No' },
  details: '',
  ...(data ?? {}),
});

export const Group7Military: React.FC = () => {
  const usData = useApplicationStore((state) => state.data['military_us']);
  const foreignData = useApplicationStore((state) => state.data['military_foreign']);
  const disciplineData = useApplicationStore((state) => state.data['military_discipline']);
  const setField = useApplicationStore((state) => state.setField);

  const us = useMemo(() => getMilitaryData(usData), [usData]);
  const foreign = useMemo(() => getMilitaryData(foreignData), [foreignData]);
  const discipline = useMemo(() => getDisciplineData(disciplineData), [disciplineData]);

  const updateMilitary = (section: string, field: string, value: any) => {
    setField(section, field, value);
  };

  const renderServiceSection = (title: string, sectionKey: string, data: MilitaryData) => (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-slate-900">{title}</h3>
      <div className="space-y-4">
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={data.has_service?.value === 'Yes'}
              onChange={() => updateMilitary(sectionKey, 'has_service', { type: 'radio', value: 'Yes' })}
              className="h-4 w-4 text-blue-600"
            />
            Yes
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={data.has_service?.value === 'No'}
              onChange={() => updateMilitary(sectionKey, 'has_service', { type: 'radio', value: 'No' })}
              className="h-4 w-4 text-blue-600"
            />
            No
          </label>
        </div>

        {data.has_service?.value === 'Yes' && (
          <div className="grid gap-4 rounded-md bg-slate-50 p-4">
             <div className="grid gap-4 sm:grid-cols-2">
               <div className="space-y-2">
                 <Label>Branch of Service</Label>
                 <Input value={data.branch} onChange={(e) => updateMilitary(sectionKey, 'branch', e.target.value)} />
               </div>
               <div className="space-y-2">
                 <Label>Location</Label>
                 <Input value={data.location} onChange={(e) => updateMilitary(sectionKey, 'location', e.target.value)} />
               </div>
             </div>
             <div className="grid gap-4 sm:grid-cols-2">
               <div className="space-y-2">
                 <Label>From (MM/YYYY)</Label>
                 <Input value={data.from_date} onChange={(e) => updateMilitary(sectionKey, 'from_date', e.target.value)} placeholder="MM/YYYY" />
               </div>
               <div className="space-y-2">
                 <Label>To (MM/YYYY)</Label>
                 <Input value={data.to_date} onChange={(e) => updateMilitary(sectionKey, 'to_date', e.target.value)} placeholder="MM/YYYY" />
               </div>
             </div>
             <div className="space-y-2">
               <Label>Nature of Service / Rank</Label>
               <Input value={data.nature_of_service} onChange={(e) => updateMilitary(sectionKey, 'nature_of_service', e.target.value)} />
             </div>
             <div className="space-y-2">
               <Label>Discharge Details</Label>
               <Input value={data.discharge_details} onChange={(e) => updateMilitary(sectionKey, 'discharge_details', e.target.value)} placeholder="Date and nature of discharge" />
             </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {renderServiceSection('U.S. Armed Forces Service', 'military_us', us)}
      {renderServiceSection('Foreign Armed Forces Service', 'military_foreign', foreign)}

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-slate-900">Military Discipline</h3>
        <div className="space-y-4">
          <Label>Have you ever been charged or disciplined in a court-martial or similar proceeding?</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={discipline.has_issue?.value === 'Yes'}
                onChange={() => updateMilitary('military_discipline', 'has_issue', { type: 'radio', value: 'Yes' })}
                className="h-4 w-4 text-blue-600"
              />
              Yes
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={discipline.has_issue?.value === 'No'}
                onChange={() => updateMilitary('military_discipline', 'has_issue', { type: 'radio', value: 'No' })}
                className="h-4 w-4 text-blue-600"
              />
              No
            </label>
          </div>
          
          {discipline.has_issue?.value === 'Yes' && (
            <div className="space-y-2 rounded-md bg-slate-50 p-4">
              <Label>Details of Charges and Outcome</Label>
              <textarea
                value={discipline.details}
                onChange={(e) => updateMilitary('military_discipline', 'details', e.target.value)}
                className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Group7Military;
