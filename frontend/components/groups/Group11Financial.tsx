'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';

interface FinancialJudgment {
  has_issue?: { value?: string };
  creditor_name?: string;
  creditor_address?: string;
  court?: string;
  date?: string;
  amount?: string;
  nature_of_claim?: string;
}

interface FinancialDefault {
  has_issue?: { value?: string };
  explanation?: string;
}

interface PastDueDebt {
  creditor_name?: string;
  creditor_address?: string;
  amount?: string;
  date?: string;
  nature_of_debt?: string;
}

interface PastDueDebtsData {
  has_issue?: { value?: string };
  debts?: PastDueDebt[];
}

interface BankruptcyData {
  has_issue?: { value?: string };
  explanation?: string;
}

const getJudgmentData = (data: any): FinancialJudgment => ({
  has_issue: { value: 'No' },
  creditor_name: '',
  creditor_address: '',
  court: '',
  date: '',
  amount: '',
  nature_of_claim: '',
  ...(data ?? {}),
});

const getDefaultData = (data: any): FinancialDefault => ({
  has_issue: { value: 'No' },
  explanation: '',
  ...(data ?? {}),
});

const getPastDueData = (data: any): PastDueDebtsData => ({
  has_issue: { value: 'No' },
  debts: Array.isArray(data?.debts) ? data.debts : [],
  ...data,
});

const getBankruptcyData = (data: any): BankruptcyData => ({
  has_issue: { value: 'No' },
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

  const updateField = (section: string, field: string, value: any) => {
    setField(section, field, value);
  };

  const updatePastDue = (index: number, field: string, value: any) => {
    const updatedDebts = [...pastDue.debts!];
    if (!updatedDebts[index]) updatedDebts[index] = {};
    updatedDebts[index] = { ...updatedDebts[index], [field]: value };
    setSection('past_due_debts', { ...pastDue, debts: updatedDebts });
  };

  const addDebt = () => {
    const updatedDebts = [...pastDue.debts!, {}];
    setSection('past_due_debts', { ...pastDue, debts: updatedDebts });
  };

  return (
    <div className="space-y-8">
      {/* Judgments */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-slate-900">Unsatisfied Judgments</h3>
        <div className="space-y-4">
          <Label>Do you have any unsatisfied judgments against you?</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={judgments.has_issue?.value === 'Yes'}
                onChange={() => updateField('financial_judgments', 'has_issue', { type: 'radio', value: 'Yes' })}
                className="h-4 w-4 text-blue-600"
              />
              Yes
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={judgments.has_issue?.value === 'No'}
                onChange={() => updateField('financial_judgments', 'has_issue', { type: 'radio', value: 'No' })}
                className="h-4 w-4 text-blue-600"
              />
              No
            </label>
          </div>
          
          {judgments.has_issue?.value === 'Yes' && (
            <div className="grid gap-4 rounded-md bg-slate-50 p-4">
              <div className="space-y-2">
                <Label>Creditor Name</Label>
                <Input value={judgments.creditor_name} onChange={(e) => updateField('financial_judgments', 'creditor_name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Creditor Address</Label>
                <Input value={judgments.creditor_address} onChange={(e) => updateField('financial_judgments', 'creditor_address', e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Court</Label>
                  <Input value={judgments.court} onChange={(e) => updateField('financial_judgments', 'court', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input value={judgments.date} onChange={(e) => updateField('financial_judgments', 'date', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input value={judgments.amount} onChange={(e) => updateField('financial_judgments', 'amount', e.target.value)} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Defaults */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-slate-900">Default on Obligations</h3>
        <div className="space-y-4">
          <Label>Are you in default on any duty/obligation (judgment, order, etc.)?</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={defaults.has_issue?.value === 'Yes'}
                onChange={() => updateField('financial_defaults', 'has_issue', { type: 'radio', value: 'Yes' })}
                className="h-4 w-4 text-blue-600"
              />
              Yes
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={defaults.has_issue?.value === 'No'}
                onChange={() => updateField('financial_defaults', 'has_issue', { type: 'radio', value: 'No' })}
                className="h-4 w-4 text-blue-600"
              />
              No
            </label>
          </div>
          {defaults.has_issue?.value === 'Yes' && (
            <div className="space-y-2 rounded-md bg-slate-50 p-4">
              <Label>Explanation</Label>
              <textarea
                value={defaults.explanation}
                onChange={(e) => updateField('financial_defaults', 'explanation', e.target.value)}
                className="w-full rounded-md border border-slate-300 p-2 text-sm"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>

      {/* Past Due Debts */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-slate-900">Past Due Debts</h3>
        <div className="space-y-4">
          <Label>Do you owe any debt of $300+ that is 90+ days past due?</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={pastDue.has_issue?.value === 'Yes'}
                onChange={() => updateField('past_due_debts', 'has_issue', { type: 'radio', value: 'Yes' })}
                className="h-4 w-4 text-blue-600"
              />
              Yes
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={pastDue.has_issue?.value === 'No'}
                onChange={() => updateField('past_due_debts', 'has_issue', { type: 'radio', value: 'No' })}
                className="h-4 w-4 text-blue-600"
              />
              No
            </label>
          </div>

          {pastDue.has_issue?.value === 'Yes' && (
            <div className="space-y-4 rounded-md bg-slate-50 p-4">
              {pastDue.debts?.map((debt, i) => (
                <div key={i} className="grid gap-4 rounded border border-slate-200 bg-white p-4">
                  <h4 className="font-medium text-slate-700">Debt #{i + 1}</h4>
                  <div className="space-y-2">
                    <Label>Creditor Name</Label>
                    <Input value={debt.creditor_name} onChange={(e) => updatePastDue(i, 'creditor_name', e.target.value)} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                       <Label>Amount</Label>
                       <Input value={debt.amount} onChange={(e) => updatePastDue(i, 'amount', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                       <Label>Date Due</Label>
                       <Input value={debt.date} onChange={(e) => updatePastDue(i, 'date', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addDebt} className="text-sm text-blue-600 hover:underline">
                + Add another debt
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bankruptcy */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-slate-900">Bankruptcy</h3>
        <div className="space-y-4">
          <Label>Have you ever filed for bankruptcy?</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
               <input
                 type="radio"
                 checked={bankruptcy.has_issue?.value === 'Yes'}
                 onChange={() => updateField('bankruptcy', 'has_issue', { type: 'radio', value: 'Yes' })}
                 className="h-4 w-4 text-blue-600"
               />
               Yes
            </label>
            <label className="flex items-center gap-2">
               <input
                 type="radio"
                 checked={bankruptcy.has_issue?.value === 'No'}
                 onChange={() => updateField('bankruptcy', 'has_issue', { type: 'radio', value: 'No' })}
                 className="h-4 w-4 text-blue-600"
               />
               No
            </label>
          </div>
          {bankruptcy.has_issue?.value === 'Yes' && (
            <div className="space-y-2 rounded-md bg-slate-50 p-4">
              <Label>Explanation (Court, Date, Disposition)</Label>
              <textarea
                value={bankruptcy.explanation}
                onChange={(e) => updateField('bankruptcy', 'explanation', e.target.value)}
                className="w-full rounded-md border border-slate-300 p-2 text-sm"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Group11Financial;
