'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Radio from '../ui/Radio';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { FinancialJudgment, FinancialDefault, PastDueDebtsData, BankruptcyData } from '../../types/schema';

const getJudgmentData = (data: any): FinancialJudgment => ({
  has_issue: { value: '' },
  creditor_name: '',
  creditor_address: '',
  court: '',
  date: '',
  amount: '',
  nature_of_claim: '',
  ...(data ?? {}),
});

const getDefaultData = (data: any): FinancialDefault => ({
  has_issue: { value: '' },
  explanation: '',
  ...(data ?? {}),
});

const getPastDueData = (data: any): PastDueDebtsData => ({
  has_issue: { value: '' },
  debts: Array.isArray(data?.debts) ? data.debts : [],
  ...data,
});

const getBankruptcyData = (data: any): BankruptcyData => ({
  has_issue: { value: '' },
  explanation: '',
  ...(data ?? {}),
});

export const Group11Financial: React.FC = () => {
  const judgmentsData = useApplicationStore((state) => state.data['financial_judgments']);
  const defaultsData = useApplicationStore((state) => state.data['financial_defaults']);
  const pastDueData = useApplicationStore((state) => state.data['past_due_debts']);
  const bankruptcyData = useApplicationStore((state) => state.data['bankruptcy']);
  
  const setField = useApplicationStore((state) => state.setField);
  const setSection = useApplicationStore((state) => state.setSection);

  const judgments = useMemo(() => getJudgmentData(judgmentsData), [judgmentsData]);
  const defaults = useMemo(() => getDefaultData(defaultsData), [defaultsData]);
  const pastDue = useMemo(() => getPastDueData(pastDueData), [pastDueData]);
  const bankruptcy = useMemo(() => getBankruptcyData(bankruptcyData), [bankruptcyData]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (section: string, field: string, value: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setField(section as any, field, value);
  };

  const updatePastDue = (index: number, field: string, value: any) => {
    const updatedDebts = [...(pastDue.debts || [])];
    if (!updatedDebts[index]) updatedDebts[index] = {};
    updatedDebts[index] = { ...updatedDebts[index], [field]: value };
    setSection('past_due_debts', { ...pastDue, debts: updatedDebts });
  };

  const addDebt = () => {
    const updatedDebts = [...(pastDue.debts || []), {}];
    setSection('past_due_debts', { ...pastDue, debts: updatedDebts });
  };

  return (
    <div className="space-y-8">
      {/* Judgments */}
      <Card>
        <CardHeader>
          <CardTitle>Unsatisfied Judgments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>Do you have any unsatisfied judgments against you?</Label>
          <div className="flex gap-4">
            <Radio
              label="Yes"
              checked={judgments.has_issue?.value === 'Yes'}
              onChange={() => updateField('financial_judgments', 'has_issue', { type: 'radio', value: 'Yes' })}
            />
            <Radio
              label="No"
              checked={judgments.has_issue?.value === 'No'}
              onChange={() => updateField('financial_judgments', 'has_issue', { type: 'radio', value: 'No' })}
            />
          </div>
          
          {judgments.has_issue?.value === 'Yes' && (
            <div className="grid gap-4 rounded-md bg-slate-700/50 p-4">
              <div className="space-y-2">
                <Label>Creditor Name</Label>
                <Input value={judgments.creditor_name as string} onChange={(e) => updateField('financial_judgments', 'creditor_name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Creditor Address</Label>
                <Input value={judgments.creditor_address as string} onChange={(e) => updateField('financial_judgments', 'creditor_address', e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Court</Label>
                  <Input value={judgments.court as string} onChange={(e) => updateField('financial_judgments', 'court', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input value={judgments.date as string} onChange={(e) => updateField('financial_judgments', 'date', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input value={judgments.amount as string} onChange={(e) => updateField('financial_judgments', 'amount', e.target.value)} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Defaults */}
      <Card>
        <CardHeader>
          <CardTitle>Default on Obligations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>Are you in default on any duty/obligation (judgment, order, etc.)?</Label>
          <div className="flex gap-4">
            <Radio
              label="Yes"
              checked={defaults.has_issue?.value === 'Yes'}
              onChange={() => updateField('financial_defaults', 'has_issue', { type: 'radio', value: 'Yes' })}
            />
            <Radio
              label="No"
              checked={defaults.has_issue?.value === 'No'}
              onChange={() => updateField('financial_defaults', 'has_issue', { type: 'radio', value: 'No' })}
            />
          </div>
          {defaults.has_issue?.value === 'Yes' && (
            <div className="space-y-2 rounded-md bg-slate-700/50 p-4">
              <Label>Explanation</Label>
              <Textarea
                value={defaults.explanation as string}
                onChange={(e) => updateField('financial_defaults', 'explanation', e.target.value)}
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Due Debts */}
      <Card>
        <CardHeader>
          <CardTitle>Past Due Debts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>Do you owe any debt of $300+ that is 90+ days past due?</Label>
          <div className="flex gap-4">
            <Radio
              label="Yes"
              checked={pastDue.has_issue?.value === 'Yes'}
              onChange={() => updateField('past_due_debts', 'has_issue', { type: 'radio', value: 'Yes' })}
            />
            <Radio
              label="No"
              checked={pastDue.has_issue?.value === 'No'}
              onChange={() => updateField('past_due_debts', 'has_issue', { type: 'radio', value: 'No' })}
            />
          </div>

          {pastDue.has_issue?.value === 'Yes' && (
            <div className="space-y-4 rounded-md bg-slate-700/50 p-4">
              {pastDue.debts?.map((debt, i) => (
                <div key={i} className="grid gap-4 rounded border border-slate-700 bg-slate-800/50 p-4">
                  <h4 className="font-medium text-slate-300">Debt #{i + 1}</h4>
                  <div className="space-y-2">
                    <Label>Creditor Name</Label>
                    <Input value={debt.creditor_name as string} onChange={(e) => updatePastDue(i, 'creditor_name', e.target.value)} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                       <Label>Amount</Label>
                       <Input value={debt.amount as string} onChange={(e) => updatePastDue(i, 'amount', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                       <Label>Date Due</Label>
                       <Input value={debt.date as string} onChange={(e) => updatePastDue(i, 'date', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" onClick={addDebt} variant="secondary" className="text-sm">
                + Add another debt
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bankruptcy */}
      <Card>
        <CardHeader>
          <CardTitle>Bankruptcy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>Have you ever filed for bankruptcy?</Label>
          <div className="flex gap-4">
            <Radio
              label="Yes"
              checked={bankruptcy.has_issue?.value === 'Yes'}
              onChange={() => updateField('bankruptcy', 'has_issue', { type: 'radio', value: 'Yes' })}
            />
            <Radio
              label="No"
              checked={bankruptcy.has_issue?.value === 'No'}
              onChange={() => updateField('bankruptcy', 'has_issue', { type: 'radio', value: 'No' })}
            />
          </div>
          {bankruptcy.has_issue?.value === 'Yes' && (
            <div className="space-y-2 rounded-md bg-slate-700/50 p-4">
              <Label>Explanation (Court, Date, Disposition)</Label>
              <Textarea
                value={bankruptcy.explanation as string}
                onChange={(e) => updateField('bankruptcy', 'explanation', e.target.value)}
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Group11Financial;
