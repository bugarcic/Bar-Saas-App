'use client';

import React, { useMemo, useState } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Button from '../ui/Button';
import Radio from '../ui/Radio';
import Textarea from '../ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { saveDraft, generateFormH } from '../../lib/api';
import { SkillsCompetencyData, EducationEntry, ContactInfoData, PersonalInfoData } from '../../types/schema';

const SECTION_KEY = 'skills_competency';

const PATHWAYS = [
  { value: 'Pathway 1', label: 'Pathway 1 – Law School Certification of Competence', description: 'Law school certification that you have acquired sufficient competency in skills and professional values.' },
  { value: 'Pathway 2', label: 'Pathway 2 – Law School Certification of Credit Acquisition', description: 'You have completed at least 15 credit hours of practice-based experiential coursework.' },
  { value: 'Pathway 3', label: 'Pathway 3 – Pro Bono Scholars Program', description: 'You successfully completed the Pro Bono Scholars Program as prescribed in section 520.17.' },
  { value: 'Pathway 4', label: 'Pathway 4 – Apprenticeship', description: 'You completed a six-month full-time apprenticeship meeting the requirements of section 520.18.' },
  { value: 'Pathway 5', label: 'Pathway 5 – Practice in Another Jurisdiction', description: 'You are admitted and have practiced in another jurisdiction.' },
];

const getDefaultData = (): SkillsCompetencyData => ({
  pathway: '',
  law_school_name: '',
  p1_school_official_name: '',
  p1_school_official_title: '',
  p2_school_official_name: '',
  p2_school_official_title: '',
  p4_from_date: '',
  p4_to_date: '',
  p4_employer_name: '',
  p4_employer_street: '',
  p4_employer_city: '',
  p4_employer_state: '',
  p4_employer_zip: '',
  p4_employer_country: '',
  p4_attorney_name: '',
  p4_unsatisfactory_explanation: '',
  p4_additional_facts: '',
  p4_attorney_title: '',
  p4_attorney_employer: '',
  p4_attorney_jurisdiction: '',
  p4_attorney_email: '',
  p4_attorney_phone: '',
  p5_jurisdiction: '',
  p5_court_of_admission: '',
  p5_admission_date: '',
  p5_practice_duration: '',
});

const getData = (data: any): SkillsCompetencyData => {
  return { ...getDefaultData(), ...(data || {}) };
};

export const GroupSkillsCompetency: React.FC = () => {
  const rawData = useApplicationStore((state) => state.data[SECTION_KEY]);
  const lawSchools = useApplicationStore((state) => state.data['law_schools']);
  const personalInfo = useApplicationStore((state) => state.data['personal_info']) as PersonalInfoData | undefined;
  const contactInfo = useApplicationStore((state) => state.data['contact_info']) as ContactInfoData | undefined;
  const allData = useApplicationStore((state) => state.data);
  const userId = useApplicationStore((state) => state.userId);
  const setSection = useApplicationStore((state) => state.setSection);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const data = useMemo(() => getData(rawData), [rawData]);

  const schoolList = useMemo(() => (lawSchools as EducationEntry[]) || [], [lawSchools]);

  // Check if we have pre-filled data from earlier sections
  const hasPersonalData = personalInfo?.first_name || personalInfo?.last_name;
  const hasContactData = contactInfo?.street || contactInfo?.city;
  const hasLawSchoolData = schoolList.length > 0 && schoolList[0]?.school_name;
  
  // Get applicant's full name
  const applicantName = useMemo(() => {
    if (!personalInfo) return '';
    const parts = [personalInfo.first_name, personalInfo.middle_name, personalInfo.last_name].filter(Boolean);
    return parts.join(' ');
  }, [personalInfo]);

  // Get applicant's address
  const applicantAddress = useMemo(() => {
    if (!contactInfo) return '';
    const parts = [
      contactInfo.street,
      contactInfo.city,
      contactInfo.state,
      contactInfo.zip
    ].filter(Boolean);
    return parts.join(', ');
  }, [contactInfo]);

  const updateField = (field: keyof SkillsCompetencyData, value: string) => {
    setSection(SECTION_KEY, { ...data, [field]: value } as any);
  };

  // Pre-fill law school from Group 4 if available
  const prefillLawSchool = (schoolIndex: number) => {
    const school = schoolList?.[schoolIndex];
    if (school) {
      setSection(SECTION_KEY, {
        ...data,
        law_school_name: school.school_name || '',
      } as any);
    }
  };

  const handleGeneratePdf = async () => {
    if (!userId) {
      setMessage('Session not initialized yet.');
      return;
    }

    if (!data.pathway) {
      setMessage('Please select a pathway first.');
      return;
    }

    try {
      setIsGenerating(true);
      setMessage('Generating PDF...');
      
      await saveDraft(userId, allData);
      const blob = await generateFormH(allData);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `skills-competency-${data.pathway?.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setMessage('Form H downloaded!');
    } catch (error) {
      console.error('Error generating Form H:', error);
      setMessage('Failed to generate PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-amber-700 bg-amber-900/30 p-4">
        <h3 className="font-semibold text-amber-300">About Skills Competency (Form H)</h3>
        <p className="mt-2 text-sm text-amber-300/80">
          This form is required for exam-based applicants whose legal education falls under Rule 520.18 
          (JD programs starting after August 1, 2016, or LLM programs starting after August 1, 2018).
        </p>
        <p className="mt-2 text-sm text-amber-300/80">
          You must select <strong className="text-amber-200">one pathway</strong> and provide the required documentation for that pathway.
        </p>
      </div>

      {/* Auto-fill Preview */}
      {(hasPersonalData || hasLawSchoolData) && (
        <div className="rounded-lg border border-blue-700 bg-blue-900/30 p-4">
          <h3 className="font-semibold text-blue-300">✓ Auto-Filled from Your Application</h3>
          <p className="mt-1 text-sm text-blue-300/80">
            The following information will be pre-filled on Form H:
          </p>
          <div className="mt-3 grid gap-2 text-sm">
            {applicantName && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Name:</span>
                <span className="font-medium text-white">{applicantName}</span>
              </div>
            )}
            {personalInfo?.ssn && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400">SSN:</span>
                <span className="font-medium text-white">***-**-{personalInfo.ssn.slice(-4)}</span>
              </div>
            )}
            {applicantAddress && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Address:</span>
                <span className="font-medium text-white">{applicantAddress}</span>
              </div>
            )}
            {hasLawSchoolData && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Law School:</span>
                <span className="font-medium text-white">{schoolList?.[0]?.school_name}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {message && (
        <div className="rounded-md bg-slate-700/50 p-3 text-sm text-slate-300">
          {message}
        </div>
      )}

      {/* Pathway Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Your Pathway</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {PATHWAYS.map((pathway) => (
            <label
              key={pathway.value}
              className={`block cursor-pointer rounded-lg border p-4 transition-colors ${
                data.pathway === pathway.value
                  ? 'border-blue-500 bg-blue-900/30'
                  : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="pathway"
                  value={pathway.value}
                  checked={data.pathway === pathway.value}
                  onChange={() => updateField('pathway', pathway.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-white">{pathway.label}</div>
                  <div className="mt-1 text-sm text-slate-300">{pathway.description}</div>
                </div>
              </div>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Pathway-specific fields */}
      {data.pathway === 'Pathway 1' && (
        <Card>
          <CardHeader>
            <CardTitle>Pathway 1 – Law School Certification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-slate-300">
              Your law school official will certify that the school has developed a plan and that you have 
              acquired sufficient competency in skills and professional values.
            </p>
            
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
                <Label>Law School Official Name</Label>
                <Input
                  value={data.p1_school_official_name as string}
                  onChange={(e) => updateField('p1_school_official_name', e.target.value)}
                  placeholder="Name of certifying official"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input
                  value={data.p1_school_official_title as string}
                  onChange={(e) => updateField('p1_school_official_title', e.target.value)}
                  placeholder="e.g., Associate Dean, Registrar"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Law School Name</Label>
                <Input
                  value={data.law_school_name as string}
                  onChange={(e) => updateField('law_school_name', e.target.value)}
                  placeholder="e.g., Fordham University School of Law"
                />
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Note: The official will sign and date this form. Your name will be pre-filled from your application.
            </p>
          </CardContent>
        </Card>
      )}

      {data.pathway === 'Pathway 2' && (
        <Card>
          <CardHeader>
            <CardTitle>Pathway 2 – 15 Credits Experiential Coursework</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-slate-300">
              Your law school official will certify that you have completed at least 15 credit hours of 
              practice-based experiential coursework.
            </p>
            
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
                <Label>Law School Official Name</Label>
                <Input
                  value={data.p2_school_official_name as string}
                  onChange={(e) => updateField('p2_school_official_name', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input
                  value={data.p2_school_official_title as string}
                  onChange={(e) => updateField('p2_school_official_title', e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Law School Name</Label>
                <Input
                  value={data.law_school_name as string}
                  onChange={(e) => updateField('law_school_name', e.target.value)}
                  placeholder="e.g., Fordham University School of Law"
                />
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Note: The official will sign and date this form. Your name will be pre-filled from your application.
            </p>
          </CardContent>
        </Card>
      )}

      {data.pathway === 'Pathway 3' && (
        <Card>
          <CardHeader>
            <CardTitle>Pathway 3 – Pro Bono Scholars Program</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-blue-900/30 border border-blue-800 p-4">
              <p className="text-sm text-blue-300">
                <strong>Good news!</strong> If you completed the Pro Bono Scholars Program, this pathway is straightforward.
              </p>
              <p className="mt-2 text-sm text-blue-300">
                This form confirms that you successfully completed the Pro Bono Scholars Program as prescribed 
                in section 520.17 of the Rules of the Court of Appeals. Proof is provided in the Form Affidavit 
                of Applicant's Completion of the Pro Bono Scholars Program.
              </p>
              <p className="mt-2 text-sm text-blue-300">
                Your name will be pre-filled from your application. You will need to sign and date this form.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {data.pathway === 'Pathway 4' && (
        <div className="space-y-6">
          {/* Section A - Applicant Certification */}
          <Card>
            <CardHeader>
              <CardTitle>Pathway 4 – Section A: Applicant Certification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-slate-300">
                Provide details about your six-month full-time apprenticeship.
              </p>
              
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Dates of Apprenticeship - From: (mm/dd/yyyy)</Label>
                    <Input
                      value={data.p4_from_date as string}
                      onChange={(e) => updateField('p4_from_date', e.target.value)}
                      placeholder="MM/DD/YYYY"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>To: (mm/dd/yyyy)</Label>
                    <Input
                      value={data.p4_to_date as string}
                      onChange={(e) => updateField('p4_to_date', e.target.value)}
                      placeholder="MM/DD/YYYY"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Name of Firm/Law Office Where Apprenticeship Was Completed</Label>
                  <Input
                    value={data.p4_employer_name as string}
                    onChange={(e) => updateField('p4_employer_name', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Employer's Address</Label>
                  <Input
                    value={data.p4_employer_street as string}
                    onChange={(e) => updateField('p4_employer_street', e.target.value)}
                    placeholder="Street Address"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label>City/Town/Village</Label>
                    <Input value={data.p4_employer_city as string} onChange={(e) => updateField('p4_employer_city', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>State</Label>
                    <Input value={data.p4_employer_state as string} onChange={(e) => updateField('p4_employer_state', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>ZIP</Label>
                    <Input value={data.p4_employer_zip as string} onChange={(e) => updateField('p4_employer_zip', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Country (if not US)</Label>
                    <Input value={data.p4_employer_country as string} onChange={(e) => updateField('p4_employer_country', e.target.value)} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section B - Supervising Attorney Certification */}
          <Card>
            <CardHeader>
              <CardTitle>Pathway 4 – Section B: Supervising Attorney Certification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-slate-300">
                Information about the supervising attorney who will certify your apprenticeship.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Name of Attorney (Supervisor)</Label>
                  <Input
                    value={data.p4_attorney_name as string}
                    onChange={(e) => updateField('p4_attorney_name', e.target.value)}
                    placeholder="Full name of supervising attorney"
                  />
                </div>

                <div className="rounded-md bg-slate-700/50 p-4">
                  <p className="text-sm text-slate-300 font-medium mb-2">
                    If the apprenticeship was NOT satisfactorily completed:
                  </p>
                  <div className="space-y-1.5">
                    <Label>Explanation (if performance was not satisfactory)</Label>
                    <Textarea
                      value={data.p4_unsatisfactory_explanation as string}
                      onChange={(e) => updateField('p4_unsatisfactory_explanation', e.target.value)}
                      rows={3}
                      placeholder="Leave blank if satisfactory"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Additional Facts (optional)</Label>
                  <Textarea
                    value={data.p4_additional_facts as string}
                    onChange={(e) => updateField('p4_additional_facts', e.target.value)}
                    rows={3}
                    placeholder="Any other facts bearing on applicant's qualifications, moral character, or fitness to practice law"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Attorney Title</Label>
                    <Input
                      value={data.p4_attorney_title as string}
                      onChange={(e) => updateField('p4_attorney_title', e.target.value)}
                      placeholder="e.g., Partner, Associate"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Attorney Employer</Label>
                    <Input
                      value={data.p4_attorney_employer as string}
                      onChange={(e) => updateField('p4_attorney_employer', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Jurisdiction Where Admitted</Label>
                    <Input
                      value={data.p4_attorney_jurisdiction as string}
                      onChange={(e) => updateField('p4_attorney_jurisdiction', e.target.value)}
                      placeholder="e.g., New York"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Attorney Email</Label>
                    <Input
                      value={data.p4_attorney_email as string}
                      onChange={(e) => updateField('p4_attorney_email', e.target.value)}
                      type="email"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Attorney Phone</Label>
                    <Input
                      value={data.p4_attorney_phone as string}
                      onChange={(e) => updateField('p4_attorney_phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {data.pathway === 'Pathway 5' && (
        <Card>
          <CardHeader>
            <CardTitle>Pathway 5 – Practice in Another Jurisdiction</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-slate-300">
              Provide details about your admission and practice in another jurisdiction.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Jurisdiction Admitted</Label>
                <Input
                  value={data.p5_jurisdiction as string}
                  onChange={(e) => updateField('p5_jurisdiction', e.target.value)}
                  placeholder="e.g., California, District of Columbia"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Court of Admission</Label>
                <Input
                  value={data.p5_court_of_admission as string}
                  onChange={(e) => updateField('p5_court_of_admission', e.target.value)}
                  placeholder="e.g., Supreme Court of California"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Date of Admission</Label>
                <Input
                  value={data.p5_admission_date as string}
                  onChange={(e) => updateField('p5_admission_date', e.target.value)}
                  placeholder="MM/DD/YYYY"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Duration of Practice</Label>
                <Input
                  value={data.p5_practice_duration as string}
                  onChange={(e) => updateField('p5_practice_duration', e.target.value)}
                  placeholder="e.g., 3 years"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate PDF Button */}
      {data.pathway && (
        <Card>
          <CardContent className="pt-6">
            <Button
              type="button"
              onClick={handleGeneratePdf}
              disabled={isGenerating || !data.pathway}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300"
            >
              {isGenerating ? 'Generating...' : `Generate Form H PDF (${data.pathway})`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GroupSkillsCompetency;
