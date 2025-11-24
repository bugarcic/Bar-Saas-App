'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';

interface IssueData {
  has_issue?: { value?: string };
  details?: string;
}

const getIssueData = (data: any): IssueData => ({
  has_issue: { value: 'No' },
  details: '',
  ...(data ?? {}),
});

export const Group6BarAdmissions: React.FC = () => {
  const otherNyData = useApplicationStore((state) => state.data['other_ny_applications']);
  const otherBarData = useApplicationStore((state) => state.data['other_bar_exams']);
  const otherAdmissionsData = useApplicationStore((state) => state.data['other_admissions']);
  const unauthorizedPersonal = useApplicationStore((state) => state.data['unauthorized_practice_personal']);
  const unauthorizedAssociated = useApplicationStore((state) => state.data['unauthorized_practice_associated']);
  const unauthorizedActing = useApplicationStore((state) => state.data['unauthorized_practice_acting']);
  
  const setField = useApplicationStore((state) => state.setField);

  const otherNy = useMemo(() => getIssueData(otherNyData), [otherNyData]);
  const otherBar = useMemo(() => getIssueData(otherBarData), [otherBarData]);
  const otherAdmissions = useMemo(() => getIssueData(otherAdmissionsData), [otherAdmissionsData]);
  const uPersonal = useMemo(() => getIssueData(unauthorizedPersonal), [unauthorizedPersonal]);
  const uAssociated = useMemo(() => getIssueData(unauthorizedAssociated), [unauthorizedAssociated]);
  const uActing = useMemo(() => getIssueData(unauthorizedActing), [unauthorizedActing]);

  const updateIssue = (sectionKey: string, field: string, value: any) => {
    setField(sectionKey, field, value);
  };

  const renderSection = (
    title: string,
    label: string,
    sectionKey: string,
    data: IssueData
  ) => (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-slate-900">{title}</h3>
      <div className="space-y-4">
        <Label>{label}</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={data.has_issue?.value === 'Yes'}
              onChange={() => updateIssue(sectionKey, 'has_issue', { type: 'radio', value: 'Yes' })}
              className="h-4 w-4 text-blue-600"
            />
            Yes
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={data.has_issue?.value === 'No'}
              onChange={() => updateIssue(sectionKey, 'has_issue', { type: 'radio', value: 'No' })}
              className="h-4 w-4 text-blue-600"
            />
            No
          </label>
        </div>

        {data.has_issue?.value === 'Yes' && (
          <div className="space-y-2 rounded-md bg-slate-50 p-4">
            <Label>Explanation / Details</Label>
            <textarea
              value={data.details}
              onChange={(e) => updateIssue(sectionKey, 'details', e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={3}
              placeholder="Provide full details (Dates, Courts, Outcomes, etc.)"
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {renderSection(
        'Other New York Applications',
        'Have you ever applied in New York for any other admission (pro hac vice, in-house, etc.)?',
        'other_ny_applications',
        otherNy
      )}

      {renderSection(
        'Bar Exams Elsewhere',
        'Have you ever taken or applied to take a bar exam in any other jurisdiction?',
        'other_bar_exams',
        otherBar
      )}

      {renderSection(
        'Admissions Elsewhere',
        'Have you ever applied for admission to practice law in any other jurisdiction?',
        'other_admissions',
        otherAdmissions
      )}

      {renderSection(
        'Unauthorized Practice (Personal)',
        'Have you ever engaged in conduct questioned as unauthorized practice of law?',
        'unauthorized_practice_personal',
        uPersonal
      )}

      {renderSection(
        'Unauthorized Practice (Associated)',
        'Have you worked for anyone accused of unauthorized practice while you were associated with them?',
        'unauthorized_practice_associated',
        uAssociated
      )}

      {renderSection(
        'Acting as Lawyer w/o Admission',
        'Have you ever acted as a lawyer in NY when not admitted (e.g. arguing motions w/o supervision)?',
        'unauthorized_practice_acting',
        uActing
      )}
    </div>
  );
};

export default Group6BarAdmissions;
