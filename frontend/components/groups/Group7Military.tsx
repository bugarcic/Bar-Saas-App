'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Radio from '../ui/Radio';
import Textarea from '../ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { MilitaryData, DisciplineData } from '../../types/schema';

// Note: Reusing DisciplineData for MilitaryDiscipline as it has same shape
// but we can define a specific alias if needed.

const getMilitaryData = (data: any): MilitaryData => ({
  has_service: { value: '' },
  from_date: '',
  to_date: '',
  location: '',
  branch: '',
  nature_of_service: '',
  discharge_details: '',
  ...(data ?? {}),
});

const getDisciplineData = (data: any): DisciplineData => ({
  has_issue: { value: '' },
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateMilitary = (section: string, field: string, value: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setField(section as any, field, value);
  };

  const renderServiceSection = (title: string, sectionKey: string, data: MilitaryData) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Radio
            label="Yes"
            checked={data.has_service?.value === 'Yes'}
            onChange={() => updateMilitary(sectionKey, 'has_service', { type: 'radio', value: 'Yes' })}
          />
          <Radio
            label="No"
            checked={data.has_service?.value === 'No'}
            onChange={() => updateMilitary(sectionKey, 'has_service', { type: 'radio', value: 'No' })}
          />
        </div>

        {data.has_service?.value === 'Yes' && (
          <div className="grid gap-4 rounded-md bg-slate-700/50 p-4">
             <div className="grid gap-4 sm:grid-cols-2">
               <div className="space-y-2">
                 <Label>Branch of Service</Label>
                 <Input value={data.branch as string} onChange={(e) => updateMilitary(sectionKey, 'branch', e.target.value)} />
               </div>
               <div className="space-y-2">
                 <Label>Location</Label>
                 <Input value={data.location as string} onChange={(e) => updateMilitary(sectionKey, 'location', e.target.value)} />
               </div>
             </div>
             <div className="grid gap-4 sm:grid-cols-2">
               <div className="space-y-2">
                 <Label>From: (MM/YYYY)</Label>
                 <Input value={data.from_date as string} onChange={(e) => updateMilitary(sectionKey, 'from_date', e.target.value)} placeholder="MM/YYYY" />
               </div>
               <div className="space-y-2">
                 <Label>To: (MM/YYYY)</Label>
                 <Input value={data.to_date as string} onChange={(e) => updateMilitary(sectionKey, 'to_date', e.target.value)} placeholder="MM/YYYY" />
               </div>
             </div>
             <div className="space-y-2">
               <Label>Nature of Service / Rank</Label>
               <Input value={data.nature_of_service as string} onChange={(e) => updateMilitary(sectionKey, 'nature_of_service', e.target.value)} />
             </div>
             <div className="space-y-2">
               <Label>Discharge Details</Label>
               <Input value={data.discharge_details as string} onChange={(e) => updateMilitary(sectionKey, 'discharge_details', e.target.value)} placeholder="Date and nature of discharge" />
             </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {renderServiceSection('U.S. Armed Forces Service', 'military_us', us)}
      {renderServiceSection('Foreign Armed Forces Service', 'military_foreign', foreign)}

      <Card>
        <CardHeader>
          <CardTitle>Military Discipline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>Have you ever been charged or disciplined in a court-martial or similar proceeding?</Label>
          <div className="flex gap-4">
            <Radio
              label="Yes"
              checked={discipline.has_issue?.value === 'Yes'}
              onChange={() => updateMilitary('military_discipline', 'has_issue', { type: 'radio', value: 'Yes' })}
            />
            <Radio
              label="No"
              checked={discipline.has_issue?.value === 'No'}
              onChange={() => updateMilitary('military_discipline', 'has_issue', { type: 'radio', value: 'No' })}
            />
          </div>
          
          {discipline.has_issue?.value === 'Yes' && (
            <div className="space-y-2 rounded-md bg-slate-700/50 p-4">
              <Label>Details of Charges and Outcome</Label>
              <Textarea
                value={discipline.details as string}
                onChange={(e) => updateMilitary('military_discipline', 'details', e.target.value)}
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Group7Military;
