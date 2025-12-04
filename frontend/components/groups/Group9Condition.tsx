'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Radio from '../ui/Radio';
import Textarea from '../ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ConditionData, GeneralConductData, IllegalDrugsData } from '../../types/schema';

const getConditionData = (data: any): ConditionData => ({
  has_issue: { value: '' },
  entity_name: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  province: '',
  phone: '',
  nature_of_proceeding: '',
  relevant_dates: '',
  disposition: '',
  explanation: '',
  ...(data ?? {}),
});

const getGeneralConduct = (data: any): GeneralConductData => ({
  has_issue: { value: '' },
  dates: '',
  explanation: '',
  ...(data ?? {}),
});

const getIllegalDrugs = (data: any): IllegalDrugsData => ({
  has_issue: { value: '' },
  ...(data ?? {}),
});

const ConditionForm: React.FC<{
  title: string;
  label: string;
  data: ConditionData;
  updateFn: (f: string, v: any) => void;
}> = ({ title, label, data, updateFn }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <Label>{label}</Label>
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
        <div className="space-y-4 rounded-md bg-slate-700/50 p-4">
          <div className="space-y-2">
            <Label>Entity Name (Court, Agency, etc.)</Label>
            <Input value={data.entity_name as string} onChange={(e) => updateFn('entity_name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Address (Street, City, State, Zip)</Label>
            <Input value={data.street as string} onChange={(e) => updateFn('street', e.target.value)} placeholder="Street" />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Input value={data.city as string} onChange={(e) => updateFn('city', e.target.value)} placeholder="City" />
              <Input value={data.state as string} onChange={(e) => updateFn('state', e.target.value)} placeholder="State" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Input value={data.zip as string} onChange={(e) => updateFn('zip', e.target.value)} placeholder="Zip" />
              <Input value={data.country as string} onChange={(e) => updateFn('country', e.target.value)} placeholder="Country" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Dates</Label>
            <Input value={data.relevant_dates as string} onChange={(e) => updateFn('relevant_dates', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Explanation / Disposition</Label>
            <Textarea
              value={data.explanation as string}
              onChange={(e) => updateFn('explanation', e.target.value)}
              rows={3}
            />
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

export const Group9Condition: React.FC = () => {
  const fitnessData = useApplicationStore((state) => state.data['fitness_conduct']);
  const generalData = useApplicationStore((state) => state.data['general_conduct']);
  const drugsData = useApplicationStore((state) => state.data['illegal_drugs']);
  
  const setSection = useApplicationStore((state) => state.setSection);
  const setField = useApplicationStore((state) => state.setField);

  // Safe defaults within useMemo
  const conditionDefense = useMemo(() => getConditionData((fitnessData as any)?.condition_defense), [fitnessData]);
  const conductBehavior = useMemo(() => getConditionData((fitnessData as any)?.conduct_behavior), [fitnessData]);
  const general = useMemo(() => getGeneralConduct(generalData), [generalData]);
  const drugs = useMemo(() => getIllegalDrugs(drugsData), [drugsData]);

  const updateFitness = (key: string, field: string, value: any) => {
    const updated = { ...(fitnessData as any || {}) };
    updated[key] = { ...getConditionData(updated[key]), [field]: value };
    setSection('fitness_conduct', updated);
  };

  const updateGeneral = (field: string, value: any) => {
    setField('general_conduct', field, value);
  };

  const updateDrugs = (field: string, value: any) => {
    setField('illegal_drugs', field, value);
  };

  return (
    <div className="space-y-8">
      <ConditionForm
        title="Condition as Defense/Explanation"
        label="Has any condition/impairment (mental, substance, etc.) been raised as a defense/explanation in any proceeding?"
        data={conditionDefense}
        updateFn={(f, v) => updateFitness('condition_defense', f, v)}
      />

      <ConditionForm
        title="Conduct Consequences"
        label="Have you engaged in conduct resulting in arrest, discipline, termination, etc.?"
        data={conductBehavior}
        updateFn={(f, v) => updateFitness('conduct_behavior', f, v)}
      />

      <Card>
        <CardHeader>
          <CardTitle>General Fitness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>Apart from above, have you engaged in any conduct that could call into question your ability to practice law?</Label>
          <div className="flex gap-4">
            <Radio
              label="Yes"
              checked={general.has_issue?.value === 'Yes'}
              onChange={() => updateGeneral('has_issue', { type: 'radio', value: 'Yes' })}
            />
            <Radio
              label="No"
              checked={general.has_issue?.value === 'No'}
              onChange={() => updateGeneral('has_issue', { type: 'radio', value: 'No' })}
            />
          </div>
          {general.has_issue?.value === 'Yes' && (
            <div className="space-y-2 rounded-md bg-slate-700/50 p-4">
              <Label>Explanation</Label>
              <Textarea
                value={general.explanation as string}
                onChange={(e) => updateGeneral('explanation', e.target.value)}
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Illegal Drugs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>Are you currently using any illegal drugs?</Label>
          <div className="flex gap-4">
            <Radio
              label="Yes"
              checked={drugs.has_issue?.value === 'Yes'}
              onChange={() => updateDrugs('has_issue', { type: 'radio', value: 'Yes' })}
            />
            <Radio
              label="No"
              checked={drugs.has_issue?.value === 'No'}
              onChange={() => updateDrugs('has_issue', { type: 'radio', value: 'No' })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Group9Condition;
