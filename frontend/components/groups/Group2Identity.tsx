'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Button from '../ui/Button';

type PersonalInfoData = NonNullable<ReturnType<typeof useApplicationStore>['data']['personal_info']>;

const SECTION_KEY = 'personal_info';

const getSectionData = (data: PersonalInfoData | undefined) => ({
  first_name: '',
  middle_name: '',
  last_name: '',
  suffix: '',
  ssn: '',
  bole_id: '',
  dob: '',
  birth_city: '',
  birth_state: '',
  birth_country: '',
  has_other_names: 'No',
  other_names: [] as Array<{ name: string; reason: string }>,
  ...(data ?? {}),
});

export const Group2Identity: React.FC = () => {
  const data = useApplicationStore((state) => (state.data[SECTION_KEY] as PersonalInfoData | undefined));
  const setField = useApplicationStore((state) => state.setField);

  const section = useMemo(() => getSectionData(data), [data]);
  const otherNames = Array.isArray(section.other_names) ? section.other_names : [];
  // Support both legacy object format and new simple string format
  const hasOtherNamesRaw = section.has_other_names;
  const hasOtherNames = typeof hasOtherNamesRaw === 'object' && hasOtherNamesRaw !== null
    ? (hasOtherNamesRaw as any).value === 'Yes'
    : hasOtherNamesRaw === 'Yes';

  const updateField = (field: string, value: string) => setField(SECTION_KEY, field, value);

  const updateRadio = (value: 'Yes' | 'No') => {
    setField(SECTION_KEY, 'has_other_names', value);
    if (value === 'No') {
      setField(SECTION_KEY, 'other_names', []);
    }
  };

  const addOtherName = () => {
    const updated = [...otherNames, { name: '', reason: '' }];
    setField(SECTION_KEY, 'other_names', updated);
  };

  const updateOtherName = (index: number, key: 'name' | 'reason', value: string) => {
    const updated = otherNames.map((entry, idx) => (idx === index ? { ...entry, [key]: value } : entry));
    setField(SECTION_KEY, 'other_names', updated);
  };

  const removeOtherName = (index: number) => {
    const updated = otherNames.filter((_, idx) => idx !== index);
    setField(SECTION_KEY, 'other_names', updated);
  };

  return (
    <div className="space-y-8">
      <Section title="Identity">
        <Field label="First Name">
          <Input value={section.first_name as string} onChange={(e) => updateField('first_name', e.target.value)} />
        </Field>
        <Field label="Middle Name">
          <Input value={section.middle_name as string} onChange={(e) => updateField('middle_name', e.target.value)} />
        </Field>
        <Field label="Last Name">
          <Input value={section.last_name as string} onChange={(e) => updateField('last_name', e.target.value)} />
        </Field>
        <Field label="Suffix">
          <Input value={section.suffix as string} onChange={(e) => updateField('suffix', e.target.value)} />
        </Field>
      </Section>

      <Section title="Identification">
        <Field label="Social Security Number">
          <Input value={section.ssn as string} onChange={(e) => updateField('ssn', e.target.value)} />
        </Field>
        <Field label="BOLE ID">
          <Input value={section.bole_id as string} onChange={(e) => updateField('bole_id', e.target.value)} />
        </Field>
        <Field label="Date of Birth">
          <Input value={section.dob as string} onChange={(e) => updateField('dob', e.target.value)} placeholder="YYYY-MM-DD" />
        </Field>
      </Section>

      <Section title="Birth Location">
        <Field label="City">
          <Input value={section.birth_city as string} onChange={(e) => updateField('birth_city', e.target.value)} />
        </Field>
        <Field label="State/Province">
          <Input value={section.birth_state as string} onChange={(e) => updateField('birth_state', e.target.value)} />
        </Field>
        <Field label="Country">
          <Input value={section.birth_country as string} onChange={(e) => updateField('birth_country', e.target.value)} />
        </Field>
      </Section>

      <Section title="Other Names">
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="other-names"
              checked={hasOtherNames}
              onChange={() => updateRadio('Yes')}
              className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Yes
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="other-names"
              checked={!hasOtherNames}
              onChange={() => updateRadio('No')}
              className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            No
          </label>
        </div>

        {hasOtherNames && (
          <div className="mt-4 space-y-4">
            {otherNames.map((entry, index) => (
              <div key={index} className="rounded-md border border-slate-200 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name">
                    <Input value={entry.name} onChange={(e) => updateOtherName(index, 'name', e.target.value)} />
                  </Field>
                  <Field label="Reason">
                    <Input value={entry.reason} onChange={(e) => updateOtherName(index, 'reason', e.target.value)} />
                  </Field>
                </div>
                <div className="mt-3 text-right">
                  <Button variant="outline" onClick={() => removeOtherName(index)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            <Button type="button" onClick={addOtherName}>
              Add Name
            </Button>
          </div>
        )}
      </Section>
    </div>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <h3 className="mb-4 text-base font-semibold text-slate-900">{title}</h3>
    <div className="grid gap-4 sm:grid-cols-2">{children}</div>
  </div>
);

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label>{label}</Label>
    {children}
  </div>
);

export default Group2Identity;


