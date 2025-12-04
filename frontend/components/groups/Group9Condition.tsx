'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';

interface ConditionData {
  has_issue?: { value?: string };
  entity_name?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  province?: string;
  phone?: string;
  nature_of_proceeding?: string;
  relevant_dates?: string;
  disposition?: string;
  explanation?: string;
}

interface GeneralConduct {
  has_issue?: { value?: string };
  dates?: string;
  explanation?: string;
}

interface IllegalDrugs {
  has_issue?: { value?: string };
}

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

const getGeneralConduct = (data: any): GeneralConduct => ({
  has_issue: { value: '' },
  dates: '',
  explanation: '',
  ...(data ?? {}),
});

const getIllegalDrugs = (data: any): IllegalDrugs => ({
  has_issue: { value: '' },
  ...(data ?? {}),
});

const ConditionForm: React.FC<{
  title: string;
  label: string;
  data: ConditionData;
  updateFn: (f: string, v: any) => void;
}> = ({ title, label, data, updateFn }) => (
  <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 ">
    <h3 className="mb-4 text-base font-semibold text-white">{title}</h3>
    <div className="space-y-4">
      <Label>{label}</Label>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
          <input
            type="radio"
            checked={data.has_issue?.value === 'Yes'}
            onChange={() => updateFn('has_issue', { type: 'radio', value: 'Yes' })}
            className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
          /> Yes             </label>
        <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
          <input
            type="radio"
            checked={data.has_issue?.value === 'No'}
            onChange={() => updateFn('has_issue', { type: 'radio', value: 'No' })}
            className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
          /> No             </label>
      </div>

      {data.has_issue?.value === 'Yes' && (
        <div className="space-y-4 rounded-md bg-slate-700/50 p-4">
          <div className="space-y-2">
            <Label>Entity Name (Court, Agency, etc.)</Label>
            <Input value={data.entity_name} onChange={(e) => updateFn('entity_name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Address (Street, City, State, Zip)</Label>
            <Input value={data.street} onChange={(e) => updateFn('street', e.target.value)} placeholder="Street" />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Input value={data.city} onChange={(e) => updateFn('city', e.target.value)} placeholder="City" />
              <Input value={data.state} onChange={(e) => updateFn('state', e.target.value)} placeholder="State" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Input value={data.zip} onChange={(e) => updateFn('zip', e.target.value)} placeholder="Zip" />
              <Input value={data.country} onChange={(e) => updateFn('country', e.target.value)} placeholder="Country" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Dates</Label>
            <Input value={data.relevant_dates} onChange={(e) => updateFn('relevant_dates', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Explanation / Disposition</Label>
            <textarea
              value={data.explanation}
              onChange={(e) => updateFn('explanation', e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-800 p-2 text-sm text-white placeholder:text-slate-500"
              rows={3}
            />
          </div>
        </div>
      )}
    </div>
  </div>
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

      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 ">
        <h3 className="mb-4 text-base font-semibold text-white">General Fitness</h3>
        <div className="space-y-4">
          <Label>Apart from above, have you engaged in any conduct that could call into question your ability to practice law?</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="radio"
                checked={general.has_issue?.value === 'Yes'}
                onChange={() => updateGeneral('has_issue', { type: 'radio', value: 'Yes' })}
                className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
              /> Yes             </label>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="radio"
                checked={general.has_issue?.value === 'No'}
                onChange={() => updateGeneral('has_issue', { type: 'radio', value: 'No' })}
                className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
              /> No             </label>
          </div>
          {general.has_issue?.value === 'Yes' && (
            <div className="space-y-2 rounded-md bg-slate-700/50 p-4">
              <Label>Explanation</Label>
              <textarea
                value={general.explanation}
                onChange={(e) => updateGeneral('explanation', e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-800 p-2 text-sm text-white placeholder:text-slate-500"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 ">
        <h3 className="mb-4 text-base font-semibold text-white">Illegal Drugs</h3>
        <div className="space-y-4">
          <Label>Are you currently using any illegal drugs?</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="radio"
                checked={drugs.has_issue?.value === 'Yes'}
                onChange={() => updateDrugs('has_issue', { type: 'radio', value: 'Yes' })}
                className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
              /> Yes             </label>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="radio"
                checked={drugs.has_issue?.value === 'No'}
                onChange={() => updateDrugs('has_issue', { type: 'radio', value: 'No' })}
                className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
              /> No             </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Group9Condition;
