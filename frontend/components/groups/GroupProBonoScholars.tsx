'use client';

import React, { useMemo, useState } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { saveDraft, generateFormG } from '../../lib/api';
import { ProBonoScholarsData, EducationEntry } from '../../types/schema';

const SECTION_KEY = 'pro_bono_scholars';

const getDefaultData = (): ProBonoScholarsData => ({
  law_school_name: '',
  law_school_city: '',
  placement_name: '',
  placement_street: '',
  placement_city: '',
  placement_state: '',
  placement_zip: '',
  placement_country: '',
  placement_phone: '',
  from_date: '',
  to_date: '',
  hours: '',
  description: '',
  supervisor_name: '',
  supervisor_title: '',
  supervisor_phone: '',
  supervisor_email: '',
  faculty_name: '',
  faculty_title: '',
  faculty_phone: '',
  faculty_email: '',
});

const getData = (data: any): ProBonoScholarsData => {
  return { ...getDefaultData(), ...(data || {}) };
};

export const GroupProBonoScholars: React.FC = () => {
  const rawData = useApplicationStore((state) => state.data[SECTION_KEY]);
  const lawSchools = useApplicationStore((state) => state.data['law_schools']);
  const headerData = useApplicationStore((state) => state.data['header']);
  const allData = useApplicationStore((state) => state.data);
  const userId = useApplicationStore((state) => state.userId);
  const setSection = useApplicationStore((state) => state.setSection);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const data = useMemo(() => getData(rawData), [rawData]);
  const schoolList = useMemo(() => (lawSchools as EducationEntry[]) || [], [lawSchools]);

  const updateField = (field: keyof ProBonoScholarsData, value: string) => {
    setSection(SECTION_KEY, { ...data, [field]: value } as any);
  };

  // Pre-fill law school from Group 4 if available
  const prefillLawSchool = (schoolIndex: number) => {
    const school = schoolList?.[schoolIndex];
    if (school) {
      setSection(SECTION_KEY, {
        ...data,
        law_school_name: school.school_name || '',
        law_school_city: school.city || '',
      } as any);
    }
  };

  const handleGeneratePdf = async () => {
    if (!userId) {
      setMessage('Session not initialized yet.');
      return;
    }

    try {
      setIsGenerating(true);
      setMessage('Generating Pro Bono Scholars Affidavit...');
      
      await saveDraft(userId, allData);
      const blob = await generateFormG(allData);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pro-bono-scholars-completion.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setMessage('Form G downloaded!');
    } catch (error) {
      console.error('Error generating Form G:', error);
      setMessage('Failed to generate PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Check if user indicated they are a Pro Bono Scholar
  const isProBonoScholar = headerData?.pro_bono_scholars === 'Yes';

  // If not a Pro Bono Scholar, show redirect message
  if (!isProBonoScholar) {
    return (
      <div className="space-y-8">
        <div className="rounded-lg border border-orange-700 bg-orange-900/30 p-6">
          <h3 className="text-lg font-semibold text-orange-300">50-Hour Pro Bono Requirement Selected</h3>
          <p className="mt-3 text-sm text-orange-300/90">
            You indicated in the <strong>Start</strong> section that you are completing the standard <strong>50-hour pro bono requirement</strong>.
          </p>
          <p className="mt-2 text-sm text-orange-300/90">
            This section (Form G) is only for Pro Bono Scholars Program participants.
          </p>
          <div className="mt-4 rounded-md bg-slate-800/50 p-4">
            <p className="text-sm text-slate-300">
              <strong>Next Step:</strong> Go to the "Pro Bono (50 Hours)" section to complete Form F for each of your placements.
            </p>
          </div>
          <p className="mt-4 text-xs text-orange-400">
            If you DID participate in PBSP, go back to the Start section and change your selection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-purple-700 bg-purple-900/30 p-4">
        <h3 className="font-semibold text-purple-300">Pro Bono Scholars Program Completion (Form G)</h3>
        <p className="mt-2 text-sm text-purple-300">
          This form documents your completion of the Pro Bono Scholars Program. It requires certification 
          from both your <strong>placement supervisor</strong> and your <strong>law school faculty supervisor</strong>.
        </p>
        <p className="mt-2 text-sm text-purple-300">
          This form, along with Skills Competency Form H (Pathway 3), serves as your pro bono proof 
          and replaces the standard 50-hour pro bono affidavits.
        </p>
      </div>

      {message && (
        <div className="rounded-md bg-slate-700/50 p-3 text-sm text-slate-300">
          {message}
        </div>
      )}

      {/* Law School Info */}
      <Card>
        <CardHeader>
          <CardTitle>Law School Information</CardTitle>
        </CardHeader>
        <CardContent>
          {schoolList.length > 0 && (
            <div className="mb-4 rounded-md bg-slate-700/50 p-4">
              <Label className="text-slate-300">Pre-fill from Education History</Label>
              <select
                className="mt-2 w-full rounded-md border border-slate-600 bg-slate-800 p-2 text-sm text-white"
                onChange={(e) => {
                  const idx = parseInt(e.target.value, 10);
                  if (!isNaN(idx)) prefillLawSchool(idx);
                }}
                defaultValue=""
              >
                <option value="">Select a law school...</option>
                {schoolList.map((school, i) => (
                  <option key={i} value={i}>
                    {school.school_name || `School #${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Law School Name *</Label>
              <Input
                value={data.law_school_name as string}
                onChange={(e) => updateField('law_school_name', e.target.value)}
                placeholder="e.g., Fordham University School of Law"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Law School City</Label>
              <Input
                value={data.law_school_city as string}
                onChange={(e) => updateField('law_school_city', e.target.value)}
                placeholder="e.g., New York"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placement Info */}
      <Card>
        <CardHeader>
          <CardTitle>Pro Bono Placement Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-slate-300">
            Provide details about the organization where you completed your Pro Bono Scholars placement.
          </p>
          
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Placement Organization Name *</Label>
              <Input
                value={data.placement_name as string}
                onChange={(e) => updateField('placement_name', e.target.value)}
                placeholder="e.g., Legal Aid Society, Public Defender's Office"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Street Address</Label>
              <Input
                value={data.placement_street as string}
                onChange={(e) => updateField('placement_street', e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={data.placement_city as string} onChange={(e) => updateField('placement_city', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input value={data.placement_state as string} onChange={(e) => updateField('placement_state', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>ZIP</Label>
                <Input value={data.placement_zip as string} onChange={(e) => updateField('placement_zip', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input value={data.placement_country as string} onChange={(e) => updateField('placement_country', e.target.value)} placeholder="USA" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Placement Phone</Label>
              <Input
                value={data.placement_phone as string}
                onChange={(e) => updateField('placement_phone', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Details */}
      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>From Date: *</Label>
                <Input
                  value={data.from_date as string}
                  onChange={(e) => updateField('from_date', e.target.value)}
                  placeholder="MM/DD/YYYY"
                />
              </div>
              <div className="space-y-1.5">
                <Label>To Date: *</Label>
                <Input
                  value={data.to_date as string}
                  onChange={(e) => updateField('to_date', e.target.value)}
                  placeholder="MM/DD/YYYY"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Total Hours *</Label>
                <Input
                  value={data.hours as string}
                  onChange={(e) => updateField('hours', e.target.value)}
                  placeholder="e.g., 500"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description of Pro Bono Work *</Label>
              <Textarea
                value={data.description as string}
                onChange={(e) => updateField('description', e.target.value)}
                rows={5}
                placeholder="Describe the full-time pro bono work you performed under the Pro Bono Scholars Program, including the types of cases or matters handled, clients served, and skills developed..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placement Supervisor */}
      <Card>
        <CardHeader>
          <CardTitle>Placement Supervisor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-slate-300">
            Information about the supervisor at your placement organization who will certify your completion.
          </p>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Supervisor Name *</Label>
              <Input
                value={data.supervisor_name as string}
                onChange={(e) => updateField('supervisor_name', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={data.supervisor_title as string}
                onChange={(e) => updateField('supervisor_title', e.target.value)}
                placeholder="e.g., Staff Attorney, Supervising Attorney"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                value={data.supervisor_phone as string}
                onChange={(e) => updateField('supervisor_phone', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                value={data.supervisor_email as string}
                onChange={(e) => updateField('supervisor_email', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Supervisor */}
      <Card>
        <CardHeader>
          <CardTitle>Law School Faculty Supervisor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-slate-300">
            Information about the law school faculty member who supervised your Pro Bono Scholars participation.
          </p>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Faculty Name *</Label>
              <Input
                value={data.faculty_name as string}
                onChange={(e) => updateField('faculty_name', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={data.faculty_title as string}
                onChange={(e) => updateField('faculty_title', e.target.value)}
                placeholder="e.g., Clinical Professor, Director of Pro Bono"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                value={data.faculty_phone as string}
                onChange={(e) => updateField('faculty_phone', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                value={data.faculty_email as string}
                onChange={(e) => updateField('faculty_email', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate PDF Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            type="button"
            onClick={handleGeneratePdf}
            disabled={isGenerating || !data.law_school_name || !data.placement_name}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300"
          >
            {isGenerating ? 'Generating...' : 'Generate Form G PDF (Pro Bono Scholars Completion)'}
          </Button>
          {(!data.law_school_name || !data.placement_name) && (
            <p className="mt-2 text-center text-xs text-slate-500">
              Enter law school and placement name to enable PDF generation
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupProBonoScholars;
