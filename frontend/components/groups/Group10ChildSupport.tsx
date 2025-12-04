'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';

interface ChildSupportData {
  has_obligation?: { value?: string };
  arrears_4_months?: { value?: string };
  income_execution?: { value?: string };
  pending_proceeding?: { value?: string };
  public_assistance?: { value?: string };
  explanation?: string;
}

const getChildSupportData = (data: any): ChildSupportData => ({
  has_obligation: { value: '' },
  arrears_4_months: { value: '' },
  income_execution: { value: '' },
  pending_proceeding: { value: '' },
  public_assistance: { value: '' },
  explanation: '',
  ...(data ?? {}),
});

export const Group10ChildSupport: React.FC = () => {
  const data = useApplicationStore((state) => state.data['child_support']);
  const setField = useApplicationStore((state) => state.setField);

  const section = useMemo(() => getChildSupportData(data), [data]);

  const updateField = (field: string, value: any) => {
    setField('child_support', field, value);
  };

  const updateRadio = (field: string, value: string) => {
    updateField(field, { type: 'radio', value });
  };

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 ">
        <h3 className="mb-4 text-base font-semibold text-white">Child Support</h3>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Are you currently under a legal obligation to pay child support?</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  checked={section.has_obligation?.value === 'Yes'}
                  onChange={() => updateRadio('has_obligation', 'Yes')}
                  className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
                /> Yes             </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  checked={section.has_obligation?.value === 'No'}
                  onChange={() => updateRadio('has_obligation', 'No')}
                  className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
                /> No             </label>
            </div>
          </div>

          {section.has_obligation?.value === 'Yes' && (
            <div className="space-y-4 rounded-md bg-slate-700/50 p-4">
              <YesNoQuestion
                label="Are you 4 months or more in arrears?"
                yes={section.arrears_4_months?.value === 'Yes'}
                onChange={(val) => updateRadio('arrears_4_months', val)}
              />
              <YesNoQuestion
                label="Are you paying under an income execution/payment plan?"
                yes={section.income_execution?.value === 'Yes'}
                onChange={(val) => updateRadio('income_execution', val)}
              />
              <YesNoQuestion
                label="Is there a pending proceeding?"
                yes={section.pending_proceeding?.value === 'Yes'}
                onChange={(val) => updateRadio('pending_proceeding', val)}
              />
              <YesNoQuestion
                label="Are you receiving public assistance/SSI?"
                yes={section.public_assistance?.value === 'Yes'}
                onChange={(val) => updateRadio('public_assistance', val)}
              />
              
              <div className="space-y-2 pt-2">
                <Label>Explanation (if needed)</Label>
                <textarea
                  value={section.explanation}
                  onChange={(e) => updateField('explanation', e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-800 p-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const YesNoQuestion: React.FC<{ label: string; yes: boolean; onChange: (val: string) => void }> = ({ label, yes, onChange }) => (
  <div className="space-y-1">
    <p className="text-sm text-slate-300">{label}</p>
    <div className="flex gap-4">
      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
        <input
          type="radio"
          checked={yes}
          onChange={() => onChange('Yes')}
        />
        Yes
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
        <input
          type="radio"
          checked={!yes}
          onChange={() => onChange('No')}
        />
        No
      </label>
    </div>
  </div>
);

export default Group10ChildSupport;
