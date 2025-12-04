'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Button from '../ui/Button';
import DatePicker from '../ui/DatePicker';
import Select from '../ui/Select';
import { US_STATES, formatSSN } from '../../lib/constants';

interface PersonalInfoData {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
  ssn?: string;
  bole_id?: string;
  dob?: string;
  birth_city?: string;
  birth_state?: string;
  birth_country?: string;
  has_other_names?: string;
  other_names?: Array<{ name: string; reason: string }>;
  [key: string]: unknown;
}

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
          <Input 
            value={section.ssn as string} 
            onChange={(e) => updateField('ssn', formatSSN(e.target.value))} 
            placeholder="###-##-####"
            maxLength={11}
          />
          <p className="mt-1 text-xs text-slate-500">Format: ###-##-####</p>
        </Field>
        <Field label="BOLE ID">
          <Input value={section.bole_id as string} onChange={(e) => updateField('bole_id', e.target.value)} />
        </Field>
        <Field label="Date of Birth">
          <DatePicker
            selected={section.dob ? new Date(section.dob) : null}
            onChange={(date) => updateField('dob', date ? date.toISOString().split('T')[0] : '')}
            placeholder="Select date..."
            maxDate={new Date()}
            dateFormat="MM/dd/yyyy"
          />
        </Field>
      </Section>

      <Section title="Birth Location">
        <Field label="City">
          <Input value={section.birth_city as string} onChange={(e) => updateField('birth_city', e.target.value)} />
        </Field>
        <Field label="State/Province">
          <Select
            options={US_STATES}
            value={section.birth_state as string}
            onChange={(value) => updateField('birth_state', value)}
            placeholder="Select state..."
          />
          <p className="mt-1 text-xs text-slate-500">Select "Other" for non-US locations</p>
        </Field>
        <Field label="Country">
          <Input 
            value={section.birth_country as string} 
            onChange={(e) => updateField('birth_country', e.target.value)} 
            placeholder="e.g., United States"
          />
        </Field>
      </Section>

      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
        <h3 className="mb-2 text-base font-semibold text-white">Other Names Used</h3>
        <p className="mb-4 text-sm text-slate-400">
          Have you ever used any other names? This includes maiden names, nicknames used professionally, 
          names used before legal changes, or any aliases.
        </p>
        
        <div className="flex gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input
              type="radio"
              name="other-names"
              checked={hasOtherNames}
              onChange={() => updateRadio('Yes')}
              className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
            /> 
            <span>Yes, I have used other names</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input
              type="radio"
              name="other-names"
              checked={!hasOtherNames}
              onChange={() => updateRadio('No')}
              className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
            /> 
            <span>No</span>
          </label>
        </div>

        {hasOtherNames && (
          <div className="mt-4 space-y-4">
            {otherNames.length === 0 && (
              <p className="text-sm text-slate-500 italic">Click "Add Name" below to add a name you've used.</p>
            )}
            {otherNames.map((entry, index) => (
              <div key={index} className="rounded-md border border-slate-600 bg-slate-700/30 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Name #{index + 1}</span>
                  <Button variant="outline" onClick={() => removeOtherName(index)} className="text-xs">
                    Remove
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Full Name Used</Label>
                    <Input 
                      value={entry.name} 
                      onChange={(e) => updateOtherName(index, 'name', e.target.value)} 
                      placeholder="e.g., Jane Smith"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Reason for Name</Label>
                    <Input 
                      value={entry.reason} 
                      onChange={(e) => updateOtherName(index, 'reason', e.target.value)} 
                      placeholder="e.g., Maiden name, Legal name change"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" onClick={addOtherName}>
              + Add Another Name
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 ">
    <h3 className="mb-4 text-base font-semibold text-white">{title}</h3>
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


