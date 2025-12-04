'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Label from '../ui/Label';
import Radio from '../ui/Radio';
import Textarea from '../ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ChildSupportData } from '../../types/schema';

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
      <Card>
        <CardHeader>
          <CardTitle>Child Support</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Are you currently under a legal obligation to pay child support?</Label>
            <div className="flex gap-4">
              <Radio
                label="Yes"
                checked={section.has_obligation?.value === 'Yes'}
                onChange={() => updateRadio('has_obligation', 'Yes')}
              />
              <Radio
                label="No"
                checked={section.has_obligation?.value === 'No'}
                onChange={() => updateRadio('has_obligation', 'No')}
              />
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
                <Textarea
                  value={section.explanation as string}
                  onChange={(e) => updateField('explanation', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const YesNoQuestion: React.FC<{ label: string; yes: boolean; onChange: (val: string) => void }> = ({ label, yes, onChange }) => (
  <div className="space-y-1">
    <p className="text-sm text-slate-300">{label}</p>
    <div className="flex gap-4">
      <Radio
        label="Yes"
        checked={yes}
        onChange={() => onChange('Yes')}
      />
      <Radio
        label="No"
        checked={!yes}
        onChange={() => onChange('No')}
      />
    </div>
  </div>
);

export default Group10ChildSupport;
