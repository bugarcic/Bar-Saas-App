'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Label from '../ui/Label';
import Radio from '../ui/Radio';
import Textarea from '../ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { DisciplineData } from '../../types/schema';

const getIssueData = (data: any): DisciplineData => ({
  has_issue: { value: '' },
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateIssue = (sectionKey: string, field: string, value: any) => {
    // We are casting sectionKey to any to avoid strict ApplicationData key checks in this helper
    // In a real app, we might want a helper that accepts "keyof ApplicationData"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setField(sectionKey as any, field, value);
  };

  const renderSection = (
    title: string,
    label: string,
    sectionKey: string,
    data: DisciplineData
  ) => (
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
            onChange={() => updateIssue(sectionKey, 'has_issue', { type: 'radio', value: 'Yes' })}
          />
          <Radio
            label="No"
            checked={data.has_issue?.value === 'No'}
            onChange={() => updateIssue(sectionKey, 'has_issue', { type: 'radio', value: 'No' })}
          />
        </div>

        {data.has_issue?.value === 'Yes' && (
          <div className="space-y-2 rounded-md bg-slate-700/50 p-4">
            <Label>Explanation / Details</Label>
            <Textarea
              value={data.details as string}
              onChange={(e) => updateIssue(sectionKey, 'details', e.target.value)}
              rows={3}
              placeholder="Provide full details (Dates, Courts, Outcomes, etc.)"
            />
          </div>
        )}
      </CardContent>
    </Card>
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
