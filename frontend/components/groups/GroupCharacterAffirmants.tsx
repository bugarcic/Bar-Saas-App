'use client';

import React, { useMemo, useState } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Button from '../ui/Button';
import Radio from '../ui/Radio';
import Textarea from '../ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { saveDraft, generateFormC } from '../../lib/api';
import { AffirmantData } from '../../types/schema';

const SECTION_KEY = 'character_affirmants';

const getDefaultAffirmant = (): AffirmantData => ({
  full_name: '',
  home_street: '',
  home_city: '',
  home_state: '',
  home_zip: '',
  home_country: '',
  home_phone: '',
  home_email: '',
  business_street: '',
  business_city: '',
  business_state: '',
  business_zip: '',
  business_country: '',
  business_phone: '',
  business_email: '',
  is_attorney: 'No',
  attorney_jurisdiction_1: '',
  attorney_year_1: '',
  attorney_jurisdiction_2: '',
  attorney_year_2: '',
  character_statement: '',
});

const getAffirmants = (data: any): [AffirmantData, AffirmantData] => {
  if (Array.isArray(data) && data.length >= 2) {
    return [
      { ...getDefaultAffirmant(), ...data[0] },
      { ...getDefaultAffirmant(), ...data[1] },
    ];
  }
  return [getDefaultAffirmant(), getDefaultAffirmant()];
};

export const GroupCharacterAffirmants: React.FC = () => {
  const data = useApplicationStore((state) => state.data[SECTION_KEY]);
  // Use specific accessors for prefill data to avoid `any` if possible, but data structure is dynamic
  const personalInfo = useApplicationStore((state) => state.data['personal_info']);
  const headerData = useApplicationStore((state) => state.data['header']);
  const allData = useApplicationStore((state) => state.data);
  const userId = useApplicationStore((state) => state.userId);
  const setSection = useApplicationStore((state) => state.setSection);
  
  const [isGenerating, setIsGenerating] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const affirmants = useMemo(() => getAffirmants(data), [data]);

  // Get applicant's full name
  const applicantName = useMemo(() => {
    if (!personalInfo) return '';
    const parts = [personalInfo.first_name, personalInfo.middle_name, personalInfo.last_name].filter(Boolean);
    return parts.join(' ');
  }, [personalInfo]);

  const hasPrefilledData = applicantName || headerData?.bole_id || headerData?.department_selection;

  const updateAffirmant = (index: 0 | 1, field: keyof AffirmantData, value: string) => {
    const updated = [...affirmants] as [AffirmantData, AffirmantData];
    updated[index] = { ...updated[index], [field]: value };
    setSection(SECTION_KEY, updated as any);
  };

  const handleGeneratePdf = async (index: 0 | 1) => {
    if (!userId) {
      setMessage('Session not initialized yet.');
      return;
    }

    const affirmant = affirmants[index];
    if (!affirmant.full_name) {
      setMessage(`Please enter a name for Affirmant #${index + 1} first.`);
      return;
    }

    try {
      setIsGenerating(index);
      setMessage('Generating PDF...');
      
      // First save the latest data
      await saveDraft(userId, allData);
      
      // Then generate Form C
      const blob = await generateFormC(allData, index);
      
      // Create download link
      const safeAffirmantName = affirmant.full_name.replace(/[^a-zA-Z0-9]/g, '_');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `character-affirmation-${index + 1}-${safeAffirmantName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setMessage(`Form C for ${affirmant.full_name} downloaded!`);
    } catch (error) {
      console.error('Error generating Form C:', error);
      setMessage('Failed to generate PDF.');
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-amber-700 bg-amber-900/30 p-4">
        <h3 className="font-semibold text-amber-300">About Character Affirmations</h3>
        <p className="mt-2 text-sm text-amber-300/80">
          You need <strong className="text-amber-200">two different people</strong> to complete character affirmations for you. 
          Each affirmant must have known you for at least 2 years. They do not need to be attorneys, 
          but they should be able to speak to your honesty, reliability, and fitness to practice law.
        </p>
        <p className="mt-2 text-sm text-amber-300/80">
          <strong className="text-amber-200">Note:</strong> These should not be the same people who sign your employment affirmations.
        </p>
      </div>

      {/* Auto-fill Preview */}
      {hasPrefilledData && (
        <div className="rounded-lg border border-blue-700 bg-blue-900/30 p-4">
          <h3 className="font-semibold text-blue-300">✓ Auto-Filled on Form C</h3>
          <p className="mt-1 text-sm text-blue-300/80">
            The following applicant information will be pre-filled on each Character Affirmation:
          </p>
          <div className="mt-3 grid gap-2 text-sm">
            {applicantName && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Applicant Name:</span>
                <span className="font-medium text-white">{applicantName}</span>
              </div>
            )}
            {headerData?.bole_id && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400">BOLE ID:</span>
                <span className="font-medium text-white">{headerData.bole_id}</span>
              </div>
            )}
            {headerData?.department_selection && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Department:</span>
                <span className="font-medium text-white">{headerData.department_selection}</span>
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-blue-400">
            Only the affirmant's information needs to be entered below.
          </p>
        </div>
      )}

      {message && (
        <div className="rounded-md bg-slate-700/50 p-3 text-sm text-slate-300">
          {message}
        </div>
      )}

      <AffirmantForm
        title="Character Affirmant #1"
        affirmant={affirmants[0]}
        onUpdate={(field, value) => updateAffirmant(0, field, value)}
        onGeneratePdf={() => handleGeneratePdf(0)}
        isGenerating={isGenerating === 0}
      />

      <AffirmantForm
        title="Character Affirmant #2"
        affirmant={affirmants[1]}
        onUpdate={(field, value) => updateAffirmant(1, field, value)}
        onGeneratePdf={() => handleGeneratePdf(1)}
        isGenerating={isGenerating === 1}
      />
    </div>
  );
};

interface AffirmantFormProps {
  title: string;
  affirmant: AffirmantData;
  onUpdate: (field: keyof AffirmantData, value: string) => void;
  onGeneratePdf: () => void;
  isGenerating: boolean;
}

const AffirmantForm: React.FC<AffirmantFormProps> = ({ title, affirmant, onUpdate, onGeneratePdf, isGenerating }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Basic Info */}
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-slate-300 uppercase tracking-wide">Affirmant Information</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Full Name *</Label>
              <Input
                value={affirmant.full_name as string}
                onChange={(e) => onUpdate('full_name', e.target.value)}
                placeholder="First Middle Last"
              />
            </div>
          </div>
        </div>

        {/* Home Address */}
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-slate-300 uppercase tracking-wide">Home Address</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Street Address</Label>
              <Input
                value={affirmant.home_street as string}
                onChange={(e) => onUpdate('home_street', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input value={affirmant.home_city as string} onChange={(e) => onUpdate('home_city', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>State</Label>
              <Input value={affirmant.home_state as string} onChange={(e) => onUpdate('home_state', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>ZIP Code</Label>
              <Input value={affirmant.home_zip as string} onChange={(e) => onUpdate('home_zip', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Input value={affirmant.home_country as string} onChange={(e) => onUpdate('home_country', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={affirmant.home_phone as string} onChange={(e) => onUpdate('home_phone', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={affirmant.home_email as string} onChange={(e) => onUpdate('home_email', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Business Address */}
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-slate-300 uppercase tracking-wide">Business / Office Address</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Street Address</Label>
              <Input
                value={affirmant.business_street as string}
                onChange={(e) => onUpdate('business_street', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input value={affirmant.business_city as string} onChange={(e) => onUpdate('business_city', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>State</Label>
              <Input value={affirmant.business_state as string} onChange={(e) => onUpdate('business_state', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>ZIP Code</Label>
              <Input value={affirmant.business_zip as string} onChange={(e) => onUpdate('business_zip', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Input value={affirmant.business_country as string} onChange={(e) => onUpdate('business_country', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={affirmant.business_phone as string} onChange={(e) => onUpdate('business_phone', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={affirmant.business_email as string} onChange={(e) => onUpdate('business_email', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Attorney Status */}
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-slate-300 uppercase tracking-wide">Attorney Status (Section 2 on Form)</h4>
          <div className="space-y-4">
            <div>
              <Label>Is this person an attorney?</Label>
              <div className="mt-2 flex gap-4">
                <Radio
                  label="Yes"
                  checked={affirmant.is_attorney === 'Yes'}
                  onChange={() => onUpdate('is_attorney', 'Yes')}
                />
                <Radio
                  label="No"
                  checked={affirmant.is_attorney !== 'Yes'}
                  onChange={() => onUpdate('is_attorney', 'No')}
                />
              </div>
            </div>

            {affirmant.is_attorney === 'Yes' && (
              <div className="rounded-md bg-slate-700/50 p-4">
                <p className="mb-3 text-sm text-slate-300">
                  Enter the jurisdiction(s) where this attorney is admitted and the year of admission.
                  The form has space for up to 2 jurisdictions.
                </p>
                <div className="space-y-3">
                  {/* Row 1 */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Jurisdiction #1</Label>
                      <Input
                        value={affirmant.attorney_jurisdiction_1 as string}
                        onChange={(e) => onUpdate('attorney_jurisdiction_1', e.target.value)}
                        placeholder="e.g., New York"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Year Admitted #1</Label>
                      <Input
                        value={affirmant.attorney_year_1 as string}
                        onChange={(e) => onUpdate('attorney_year_1', e.target.value)}
                        placeholder="e.g., 2015"
                      />
                    </div>
                  </div>
                  {/* Row 2 */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Jurisdiction #2 (optional)</Label>
                      <Input
                        value={affirmant.attorney_jurisdiction_2 as string}
                        onChange={(e) => onUpdate('attorney_jurisdiction_2', e.target.value)}
                        placeholder="e.g., New Jersey"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Year Admitted #2</Label>
                      <Input
                        value={affirmant.attorney_year_2 as string}
                        onChange={(e) => onUpdate('attorney_year_2', e.target.value)}
                        placeholder="e.g., 2016"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Character Statement - Section 3 on the form */}
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-slate-300 uppercase tracking-wide">Character Statement (Section 3 on Form)</h4>
          <div className="rounded-md border border-slate-700 bg-slate-700/50 p-4">
            <p className="text-sm text-slate-300 mb-3">
              This is the main character statement section. The affirmant should provide: (1) length and nature of 
              acquaintance with you; (2) their opinion of your good moral character and fitness to practice law; 
              (3) the basis for their opinion; (4) any other relevant information; and (5) whether they recommend 
              you for admission to the NY State Bar.
            </p>
            <div className="space-y-1.5">
              <Label>Character Statement (optional pre-fill or notes)</Label>
              <Textarea
                value={affirmant.character_statement as string}
                onChange={(e) => onUpdate('character_statement', e.target.value)}
                rows={5}
                placeholder="You can pre-fill this or leave notes for your affirmant. They will complete this section when signing the form."
              />
            </div>
          </div>
        </div>

        {/* Generate PDF Button */}
        <div className="border-t border-slate-200 pt-4">
          <Button
            type="button"
            onClick={onGeneratePdf}
            disabled={isGenerating || !affirmant.full_name}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300"
          >
            {isGenerating ? 'Generating...' : `Generate Form C PDF for ${affirmant.full_name || 'this affirmant'}`}
          </Button>
          {!affirmant.full_name && (
            <p className="mt-2 text-xs text-slate-500 text-center">Enter a name to enable PDF generation</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupCharacterAffirmants;
