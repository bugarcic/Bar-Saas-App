'use client';

import React, { useMemo, useState } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Button from '../ui/Button';
import { saveDraft, generateFormF } from '../../lib/api';

export interface ProBonoEntry {
  // Organization/Placement Info
  organization_name?: string;
  org_street?: string;
  org_city?: string;
  org_state?: string;
  org_zip?: string;
  org_country?: string;
  org_phone?: string;
  org_email?: string;
  
  // Placement Type
  placement_type?: string; // 'Legal Services Provider' | 'Government' | 'Law School Clinic/Externship' | 'Court-Based Program' | 'Other'
  
  // Service Details
  from_date?: string;
  to_date?: string;
  hours?: string;
  description?: string;
  
  // Supervisor Info (for certification)
  supervisor_name?: string;
  supervisor_title?: string;
  supervisor_employer?: string;
  supervisor_jurisdiction?: string;
  supervisor_year_admitted?: string;
  supervisor_phone?: string;
  supervisor_email?: string;
}

const SECTION_KEY = 'pro_bono_entries';

const PLACEMENT_TYPES = [
  { value: 'Legal Services Provider', label: 'Legal Services Provider', description: 'Non-profit organization providing free legal services' },
  { value: 'Government', label: 'Government Agency', description: 'Federal, state, or local government legal work' },
  { value: 'Law School Clinic/Externship', label: 'Law School Clinic/Externship', description: 'Clinical or externship program at your law school' },
  { value: 'Court-Based Program', label: 'Court-Based Program', description: 'Court-sponsored pro bono program' },
  { value: 'Other', label: 'Other Qualifying Program', description: 'Other program meeting NY 50-hour rule requirements' },
];

const getDefaultEntry = (): ProBonoEntry => ({
  organization_name: '',
  org_street: '',
  org_city: '',
  org_state: '',
  org_zip: '',
  org_country: '',
  org_phone: '',
  org_email: '',
  placement_type: '',
  from_date: '',
  to_date: '',
  hours: '',
  description: '',
  supervisor_name: '',
  supervisor_title: '',
  supervisor_employer: '',
  supervisor_jurisdiction: '',
  supervisor_year_admitted: '',
  supervisor_phone: '',
  supervisor_email: '',
});

interface ProBonoEntryFormProps {
  entry: ProBonoEntry;
  index: number;
  onUpdate: (field: keyof ProBonoEntry, value: string) => void;
  onRemove: () => void;
  onGeneratePdf: () => void;
  isGenerating: boolean;
  canRemove: boolean;
}

const ProBonoEntryForm: React.FC<ProBonoEntryFormProps> = ({
  entry,
  index,
  onUpdate,
  onRemove,
  onGeneratePdf,
  isGenerating,
  canRemove,
}) => {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-5 ">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Pro Bono Placement #{index + 1}
        </h3>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-sm text-red-600 hover:text-red-300"
          >
            Remove
          </button>
        )}
      </div>

      {/* Organization Info */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-300">
          Organization / Placement Information
        </h4>
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label>Organization/Court Name *</Label>
            <Input
              value={entry.organization_name}
              onChange={(e) => onUpdate('organization_name', e.target.value)}
              placeholder="e.g., Legal Aid Society, Public Defender's Office"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Street Address</Label>
            <Input
              value={entry.org_street}
              onChange={(e) => onUpdate('org_street', e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input value={entry.org_city} onChange={(e) => onUpdate('org_city', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>State</Label>
              <Input value={entry.org_state} onChange={(e) => onUpdate('org_state', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>ZIP</Label>
              <Input value={entry.org_zip} onChange={(e) => onUpdate('org_zip', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Input value={entry.org_country} onChange={(e) => onUpdate('org_country', e.target.value)} placeholder="USA" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Organization Phone</Label>
              <Input value={entry.org_phone} onChange={(e) => onUpdate('org_phone', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Organization Email</Label>
              <Input value={entry.org_email} onChange={(e) => onUpdate('org_email', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Placement Type */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-300">
          Type of Placement
        </h4>
        <div className="space-y-2">
          {PLACEMENT_TYPES.map((type) => (
            <label
              key={type.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                entry.placement_type === type.value
                  ? 'border-blue-500 bg-slate-700/50'
                  : 'border-slate-200 hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name={`placement_type_${index}`}
                value={type.value}
                checked={entry.placement_type === type.value}
                onChange={() => onUpdate('placement_type', type.value)}
                className="mt-0.5 h-4 w-4 text-white"
              />
              <div>
                <div className="font-medium text-white">{type.label}</div>
                <div className="text-xs text-slate-500">{type.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Service Details */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-300">
          Service Details
        </h4>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>From Date</Label>
              <Input
                value={entry.from_date}
                onChange={(e) => onUpdate('from_date', e.target.value)}
                placeholder="MM/DD/YYYY"
              />
            </div>
            <div className="space-y-1.5">
              <Label>To Date</Label>
              <Input
                value={entry.to_date}
                onChange={(e) => onUpdate('to_date', e.target.value)}
                placeholder="MM/DD/YYYY"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Total Hours *</Label>
              <Input
                value={entry.hours}
                onChange={(e) => onUpdate('hours', e.target.value)}
                placeholder="e.g., 50"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description of Work *</Label>
            <textarea
              value={entry.description}
              onChange={(e) => onUpdate('description', e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-800 p-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              rows={4}
              placeholder="Describe the law-related work performed, how it served persons of limited means or the public interest, and how it was supervised..."
            />
          </div>
        </div>
      </div>

      {/* Supervisor Info */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-300">
          Supervising Attorney Information
        </h4>
        <p className="mb-3 text-xs text-slate-500">
          The supervising attorney will need to certify your pro bono work on this form.
        </p>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Supervisor Name *</Label>
              <Input
                value={entry.supervisor_name}
                onChange={(e) => onUpdate('supervisor_name', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={entry.supervisor_title}
                onChange={(e) => onUpdate('supervisor_title', e.target.value)}
                placeholder="e.g., Staff Attorney, Partner"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Employer</Label>
            <Input
              value={entry.supervisor_employer}
              onChange={(e) => onUpdate('supervisor_employer', e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Jurisdiction(s) Admitted</Label>
              <Input
                value={entry.supervisor_jurisdiction}
                onChange={(e) => onUpdate('supervisor_jurisdiction', e.target.value)}
                placeholder="e.g., New York"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Year Admitted</Label>
              <Input
                value={entry.supervisor_year_admitted}
                onChange={(e) => onUpdate('supervisor_year_admitted', e.target.value)}
                placeholder="e.g., 2015"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Supervisor Phone</Label>
              <Input
                value={entry.supervisor_phone}
                onChange={(e) => onUpdate('supervisor_phone', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Supervisor Email</Label>
              <Input
                value={entry.supervisor_email}
                onChange={(e) => onUpdate('supervisor_email', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Generate PDF Button */}
      <div className="border-t border-slate-200 pt-4">
        <Button
          type="button"
          onClick={onGeneratePdf}
          disabled={isGenerating || !entry.organization_name || !entry.hours}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300"
        >
          {isGenerating ? 'Generating...' : `Generate Form F PDF for ${entry.organization_name || 'this placement'}`}
        </Button>
        {(!entry.organization_name || !entry.hours) && (
          <p className="mt-2 text-center text-xs text-slate-500">
            Enter organization name and hours to enable PDF generation
          </p>
        )}
      </div>
    </div>
  );
};

export const GroupProBono: React.FC = () => {
  const rawData = useApplicationStore((state) => state.data[SECTION_KEY]);
  const allData = useApplicationStore((state) => state.data);
  const userId = useApplicationStore((state) => state.userId);
  const setSection = useApplicationStore((state) => state.setSection);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const entries = useMemo(() => {
    const arr = Array.isArray(rawData) ? rawData : [];
    return arr.length > 0 ? arr.map((e: any) => ({ ...getDefaultEntry(), ...e })) : [getDefaultEntry()];
  }, [rawData]);

  const updateEntry = (index: number, field: keyof ProBonoEntry, value: string) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setSection(SECTION_KEY, updated as any);
  };

  const addEntry = () => {
    setSection(SECTION_KEY, [...entries, getDefaultEntry()] as any);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      const updated = entries.filter((_, i) => i !== index);
      setSection(SECTION_KEY, updated as any);
    }
  };

  const handleGeneratePdf = async (index: number) => {
    if (!userId) {
      setMessage('Session not initialized yet.');
      return;
    }

    try {
      setIsGenerating(true);
      setGeneratingIndex(index);
      setMessage('Generating Pro Bono Affidavit...');
      
      await saveDraft(userId, allData);
      const blob = await generateFormF(allData, index);
      
      const orgName = entries[index].organization_name?.replace(/[^a-zA-Z0-9]/g, '_') || `placement-${index + 1}`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pro-bono-affidavit-${orgName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setMessage('Form F downloaded!');
    } catch (error) {
      console.error('Error generating Form F:', error);
      setMessage('Failed to generate PDF.');
    } finally {
      setIsGenerating(false);
      setGeneratingIndex(null);
    }
  };

  // Calculate total hours
  const totalHours = entries.reduce((sum, entry) => {
    const hours = parseInt(entry.hours || '0', 10);
    return sum + (isNaN(hours) ? 0 : hours);
  }, 0);

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-orange-700 bg-orange-900/30 p-4">
        <h3 className="font-semibold text-orange-300">About Pro Bono Requirements (Form F)</h3>
        <p className="mt-2 text-sm text-orange-300/80">
          All exam-based applicants must complete at least <strong className="text-orange-200">50 hours</strong> of qualifying pro bono work. 
          You may have multiple placements that together total 50+ hours.
        </p>
        <p className="mt-2 text-sm text-orange-300/80">
          Each placement requires a separate Form F with supervisor certification.
        </p>
        <div className="mt-3 rounded-md bg-slate-800/50 p-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-300">Total Hours Entered:</span>
            <span className={`text-lg font-bold ${totalHours >= 50 ? 'text-emerald-400' : 'text-orange-400'}`}>
              {totalHours} / 50 hours
            </span>
          </div>
          {totalHours >= 50 && (
            <p className="mt-1 text-xs text-emerald-400">✓ You have met the 50-hour requirement!</p>
          )}
          {totalHours < 50 && totalHours > 0 && (
            <p className="mt-1 text-xs text-orange-400">You need {50 - totalHours} more hours to meet the requirement.</p>
          )}
        </div>
      </div>

      {message && (
        <div className="rounded-md bg-slate-700/50 p-3 text-sm text-slate-300">
          {message}
        </div>
      )}

      {entries.map((entry, index) => (
        <ProBonoEntryForm
          key={index}
          entry={entry}
          index={index}
          onUpdate={(field, value) => updateEntry(index, field, value)}
          onRemove={() => removeEntry(index)}
          onGeneratePdf={() => handleGeneratePdf(index)}
          isGenerating={isGenerating && generatingIndex === index}
          canRemove={entries.length > 1}
        />
      ))}

      <div className="flex justify-center">
        <Button
          type="button"
          onClick={addEntry}
          className="bg-slate-600 hover:bg-slate-700"
        >
          + Add Another Pro Bono Placement
        </Button>
      </div>
    </div>
  );
};

export default GroupProBono;

