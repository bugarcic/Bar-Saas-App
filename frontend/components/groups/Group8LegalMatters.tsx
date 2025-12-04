'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Button from '../ui/Button';

interface CriminalIncident {
  court?: string;
  charge?: string;
  disposition_and_facts?: string;
}

interface TicketDetail {
  description?: string;
  amount_date?: string;
}

interface CivilMatterData {
  has_issue?: { value?: string };
  details?: string | TicketDetail[];
  general_explanation_27_to_32?: string;
}

const getCriminalData = (data: any): { has_issue: { value: string }, incidents: CriminalIncident[] } => {
  const base = data ?? {};
  return {
    has_issue: base.has_issue ?? { value: '' },
    incidents: Array.isArray(base.incidents) ? base.incidents : [],
  };
};

const getIssueData = (data: any): CivilMatterData => ({
  has_issue: { value: '' },
  details: '',
  ...data,
});

const IncidentBlock: React.FC<{
  incident: CriminalIncident;
  index: number;
  updateFn: (index: number, field: keyof CriminalIncident, value: string) => void;
}> = ({ incident, index, updateFn }) => (
  <div className="rounded border border-slate-700 bg-slate-800/50 p-4 ">
    <h4 className="mb-2 font-medium text-slate-300">Incident #{index + 1}</h4>
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label>Court & Location</Label>
        <Input value={incident.court} onChange={(e) => updateFn(index, 'court', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Charges</Label>
        <Input value={incident.charge} onChange={(e) => updateFn(index, 'charge', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Disposition / Facts</Label>
        <textarea
          value={incident.disposition_and_facts}
          onChange={(e) => updateFn(index, 'disposition_and_facts', e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-800 p-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          rows={3}
        />
      </div>
    </div>
  </div>
);

export const Group8LegalMatters: React.FC = () => {
  const criminalHistory = useApplicationStore((state) => state.data['criminal_history']);
  const civilMatters = useApplicationStore((state) => state.data['civil_matters']);
  const setSection = useApplicationStore((state) => state.setSection);
  const setField = useApplicationStore((state) => state.setField);

  const criminal = useMemo(() => getCriminalData(criminalHistory), [criminalHistory]);
  
  // Helper to get sub-sections safely
  const getCivilSub = (key: string) => getIssueData((civilMatters as any)?.[key]);

  const testimony = getCivilSub('testimony_immunity');
  const failedToAnswer = getCivilSub('failed_to_answer_ticket');
  const warrants = getCivilSub('warrants_issued');
  const unpaidTickets = getCivilSub('unpaid_tickets');
  const fraud = getCivilSub('fraud_charges');
  const otherCivil = getCivilSub('other_civil_criminal_involvement');
  const generalExplanation = (civilMatters as any)?.general_explanation_27_to_32 ?? '';

  const updateCriminalRadio = (value: string) => {
    const updated = { ...criminal, has_issue: { type: 'radio', value } };
    if (value === 'Yes' && updated.incidents.length === 0) {
      updated.incidents = [{ court: '', charge: '', disposition_and_facts: '' }];
    }
    setSection('criminal_history', updated as any);
  };

  const updateIncident = (index: number, field: keyof CriminalIncident, value: string) => {
    const updatedIncidents = [...criminal.incidents];
    updatedIncidents[index] = { ...updatedIncidents[index], [field]: value };
    setSection('criminal_history', { ...criminal, incidents: updatedIncidents });
  };

  const addIncident = () => {
    const updatedIncidents = [...criminal.incidents, { court: '', charge: '', disposition_and_facts: '' }];
    setSection('criminal_history', { ...criminal, incidents: updatedIncidents });
  };

  const updateCivil = (key: string, field: string, value: any) => {
    const updated = { ...(civilMatters as any || {}) };
    const currentSub = updated[key] || {};
    updated[key] = { ...getIssueData(currentSub), [field]: value };
    setSection('civil_matters', updated);
  };

  const updateGeneralExplanation = (value: string) => {
    const updated = { ...(civilMatters as any || {}), general_explanation_27_to_32: value };
    setSection('civil_matters', updated);
  };

  return (
    <div className="space-y-8">
      {/* Criminal History */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 ">
        <h3 className="mb-4 text-base font-semibold text-white">Criminal History</h3>
        <div className="space-y-4">
          <Label>Have you ever been arrested, charged, indicted, convicted, or pled guilty to any crime/offense (including DWI/DWAI)?</Label>
          <p className="text-xs text-slate-500">Include all matters, even if dismissed or sealed, unless strictly excepted by the instructions.</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="radio"
                checked={criminal.has_issue?.value === 'Yes'}
                onChange={() => updateCriminalRadio('Yes')}
                className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
              /> Yes             </label>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="radio"
                checked={criminal.has_issue?.value === 'No'}
                onChange={() => updateCriminalRadio('No')}
                className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
              /> No             </label>
          </div>

          {criminal.has_issue?.value === 'Yes' && (
            <div className="space-y-6 rounded-md bg-slate-700/50 p-4">
              {criminal.incidents.map((incident, i) => (
                <IncidentBlock
                  key={i}
                  incident={incident}
                  index={i}
                  updateFn={updateIncident}
                />
              ))}
              <Button type="button" onClick={addIncident} variant="secondary">Add Incident</Button>
            </div>
          )}
        </div>
      </div>

      {/* Civil Matters */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 ">
        <h3 className="mb-4 text-base font-semibold text-white">Civil & Administrative Matters</h3>
        
        <div className="space-y-6">
          <IssueBlock
            label="Testimony/Immunity: Have you ever testified or refused to testify in a legal proceeding?"
            data={testimony}
            updateFn={(val) => updateCivil('testimony_immunity', 'has_issue', val)}
          />
          <IssueBlock
            label="Failed to Answer: Have you ever failed to answer a ticket, summons, or subpoena?"
            data={failedToAnswer}
            updateFn={(val) => updateCivil('failed_to_answer_ticket', 'has_issue', val)}
          />
          <IssueBlock
            label="Warrants: Has a warrant ever been issued against you?"
            data={warrants}
            updateFn={(val) => updateCivil('warrants_issued', 'has_issue', val)}
          />
          <IssueBlock
            label="Unpaid Tickets: Do you currently have any unpaid traffic or parking tickets?"
            data={unpaidTickets}
            updateFn={(val) => updateCivil('unpaid_tickets', 'has_issue', val)}
          />
           {/* Note: Unpaid tickets has a complex array structure in map, implementing simplified explanation for now */}
           
          <IssueBlock
            label="Fraud: Have you ever been charged with fraud or moral turpitude?"
            data={fraud}
            updateFn={(val) => updateCivil('fraud_charges', 'has_issue', val)}
          />
          <IssueBlock
            label="Other Involvement: Any other civil/criminal action (party, witness, etc.)?"
            data={otherCivil}
            updateFn={(val) => updateCivil('other_civil_criminal_involvement', 'has_issue', val)}
          />

          <div className="space-y-2">
            <Label>General Explanation for any "Yes" answers above</Label>
            <textarea
              value={generalExplanation}
              onChange={(e) => updateGeneralExplanation(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-800 p-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={4}
              placeholder="Provide details for checked items..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const IssueBlock: React.FC<{ label: string; data: CivilMatterData; updateFn: (val: any) => void }> = ({ label, data, updateFn }) => (
  <div className="space-y-2">
    <p className="text-sm font-medium text-slate-300">{label}</p>
    <div className="flex gap-4">
      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
        <input
          type="radio"
          checked={data.has_issue?.value === 'Yes'}
          onChange={() => updateFn({ type: 'radio', value: 'Yes' })}
        />
        Yes
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
        <input
          type="radio"
          checked={data.has_issue?.value === 'No'}
          onChange={() => updateFn({ type: 'radio', value: 'No' })}
        />
        No
      </label>
    </div>
  </div>
);

export default Group8LegalMatters;
