'use client';

import React, { useState } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import { generatePdf, generateFormE, generateFormC, generateFormD, generateFormH, generateFormF, generateFormG, saveDraft } from '../../lib/api';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { EducationEntry, AffirmantData, EmploymentAffirmantData, SkillsCompetencyData, ProBonoEntry, ProBonoScholarsData } from '../../types/schema';

export default function GroupReviewExport() {
  const data = useApplicationStore((state) => state.data);
  const userId = useApplicationStore((state) => state.userId);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingFormE, setIsGeneratingFormE] = useState(false);
  const [isGeneratingFormC, setIsGeneratingFormC] = useState(false);
  const [isGeneratingFormD, setIsGeneratingFormD] = useState(false);
  const [isGeneratingFormH, setIsGeneratingFormH] = useState(false);
  const [isGeneratingFormF, setIsGeneratingFormF] = useState(false);
  const [isGeneratingFormG, setIsGeneratingFormG] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Get law schools from data for Form E generation
  const lawSchools = (Array.isArray(data.law_schools) ? data.law_schools : []) as EducationEntry[];
  
  // Get character affirmants from data for Form C generation
  const characterAffirmants = (Array.isArray(data.character_affirmants) ? data.character_affirmants : []) as AffirmantData[];
  
  // Get employment affirmants from data for Form D generation
  const employmentAffirmants = (Array.isArray(data.employment_affirmants) ? data.employment_affirmants : []) as EmploymentAffirmantData[];
  
  // Get skills competency data for Form H generation
  const skillsCompetency = (data.skills_competency || {}) as SkillsCompetencyData;
  
  // Get pro bono entries for Form F generation
  const proBonoEntries = (Array.isArray(data.pro_bono_entries) ? data.pro_bono_entries : []) as ProBonoEntry[];
  
  // Get pro bono scholars data for Form G generation
  const proBonoScholars = (data.pro_bono_scholars || {}) as ProBonoScholarsData;
  const isProBonoScholar = (data.header as any)?.pro_bono_scholar === 'Yes';

  const ensureSaved = async () => {
    if (!userId) {
      setMessage('Session not initialized.');
      return false;
    }
    try {
      setIsSaving(true);
      await saveDraft(userId, data);
      return true;
    } catch (error) {
      console.error(error);
      setMessage('Failed to save latest changes.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!await ensureSaved()) return;

    try {
      setIsGeneratingPdf(true);
      setMessage('Generating Questionnaire...');
      const blob = await generatePdf(data);
      downloadBlob(blob, 'bar-admission-questionnaire.pdf');
      setMessage('Questionnaire downloaded!');
    } catch (error) {
      console.error(error);
      setMessage('Failed to generate Questionnaire.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleGenerateFormE = async (index: number) => {
    if (!await ensureSaved()) return;

    try {
      setIsGeneratingFormE(true);
      setMessage('Generating Law School Certificate...');
      const blob = await generateFormE(data, index);
      const schoolName = lawSchools[index]?.school_name || `school-${index + 1}`;
      downloadBlob(blob, `law-school-certificate-${sanitize(schoolName)}.pdf`);
      setMessage('Law School Certificate downloaded!');
    } catch (error) {
      console.error(error);
      setMessage('Failed to generate Law School Certificate.');
    } finally {
      setIsGeneratingFormE(false);
    }
  };

  const handleGenerateFormC = async (index: number) => {
    if (!await ensureSaved()) return;

    try {
      setIsGeneratingFormC(true);
      setMessage('Generating Character Affirmation...');
      const blob = await generateFormC(data, index);
      const name = characterAffirmants[index]?.full_name || `affirmant-${index + 1}`;
      downloadBlob(blob, `character-affirmation-${index + 1}-${sanitize(name)}.pdf`);
      setMessage('Character Affirmation downloaded!');
    } catch (error) {
      console.error(error);
      setMessage('Failed to generate Character Affirmation.');
    } finally {
      setIsGeneratingFormC(false);
    }
  };

  const handleGenerateFormD = async (index: number) => {
    if (!await ensureSaved()) return;

    try {
      setIsGeneratingFormD(true);
      setMessage('Generating Employment Affirmation...');
      const blob = await generateFormD(data, index);
      const name = employmentAffirmants[index]?.employer_name || `employment-${index + 1}`;
      downloadBlob(blob, `employment-affirmation-${index + 1}-${sanitize(name)}.pdf`);
      setMessage('Employment Affirmation downloaded!');
    } catch (error) {
      console.error(error);
      setMessage('Failed to generate Employment Affirmation.');
    } finally {
      setIsGeneratingFormD(false);
    }
  };

  const handleGenerateFormH = async () => {
    if (!await ensureSaved()) return;

    try {
      setIsGeneratingFormH(true);
      setMessage('Generating Skills Competency Affidavit...');
      const blob = await generateFormH(data);
      const pathway = skillsCompetency.pathway?.replace(/\s+/g, '-').toLowerCase() || 'form-h';
      downloadBlob(blob, `skills-competency-${pathway}.pdf`);
      setMessage('Skills Competency Affidavit downloaded!');
    } catch (error) {
      console.error(error);
      setMessage('Failed to generate Skills Competency Affidavit.');
    } finally {
      setIsGeneratingFormH(false);
    }
  };

  const handleGenerateFormF = async (index: number) => {
    if (!await ensureSaved()) return;

    try {
      setIsGeneratingFormF(true);
      setMessage('Generating Pro Bono Affidavit...');
      const blob = await generateFormF(data, index);
      const name = proBonoEntries[index]?.organization_name || `placement-${index + 1}`;
      downloadBlob(blob, `pro-bono-affidavit-${sanitize(name)}.pdf`);
      setMessage('Pro Bono Affidavit downloaded!');
    } catch (error) {
      console.error(error);
      setMessage('Failed to generate Pro Bono Affidavit.');
    } finally {
      setIsGeneratingFormF(false);
    }
  };

  const handleGenerateFormG = async () => {
    if (!await ensureSaved()) return;

    try {
      setIsGeneratingFormG(true);
      setMessage('Generating Pro Bono Scholars Affidavit...');
      const blob = await generateFormG(data);
      downloadBlob(blob, 'pro-bono-scholars-completion.pdf');
      setMessage('Pro Bono Scholars Affidavit downloaded!');
    } catch (error) {
      console.error(error);
      setMessage('Failed to generate Pro Bono Scholars Affidavit.');
    } finally {
      setIsGeneratingFormG(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '_');

  return (
    <div className="space-y-8 text-slate-300">
      <Card>
        <CardHeader>
          <CardTitle>Application Questionnaire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-md border border-slate-700">
            <div>
              <p className="font-medium text-white">Form B - Questionnaire</p>
              <p className="text-sm text-slate-400">The main application document.</p>
            </div>
            <Button 
              onClick={handleGeneratePdf} 
              disabled={isGeneratingPdf || isSaving}
              className="min-w-[120px]"
            >
              {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Affirmations & Certificates</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Form E */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Law School Certificates (Form E)</h4>
            {lawSchools.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No law schools added.</p>
            ) : (
              lawSchools.map((school, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-md border border-slate-700">
                  <span className="text-sm">{school.school_name || `School ${i + 1}`}</span>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleGenerateFormE(i)}
                    disabled={isGeneratingFormE || isSaving}
                  >
                    Download
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Form C */}
          <div className="space-y-3 mt-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Character Affirmations (Form C)</h4>
            {characterAffirmants.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No character affirmants added.</p>
            ) : (
              characterAffirmants.map((aff, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-md border border-slate-700">
                  <span className="text-sm">{aff.full_name || `Affirmant ${i + 1}`}</span>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleGenerateFormC(i)}
                    disabled={isGeneratingFormC || isSaving}
                  >
                    Download
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Form D */}
          <div className="space-y-3 mt-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Employment Affirmations (Form D)</h4>
            {employmentAffirmants.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No employment affirmations added.</p>
            ) : (
              employmentAffirmants.map((aff, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-md border border-slate-700">
                  <span className="text-sm">{aff.employer_name || `Employer ${i + 1}`}</span>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleGenerateFormD(i)}
                    disabled={isGeneratingFormD || isSaving}
                  >
                    Download
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Form H */}
          <div className="space-y-3 mt-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Skills Competency (Form H)</h4>
            <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-md border border-slate-700">
              <span className="text-sm">{skillsCompetency.pathway || 'No pathway selected'}</span>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={handleGenerateFormH}
                disabled={isGeneratingFormH || isSaving || !skillsCompetency.pathway}
              >
                Download
              </Button>
            </div>
          </div>

          {/* Form F */}
          <div className="space-y-3 mt-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Pro Bono Affidavits (Form F)</h4>
            {proBonoEntries.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No pro bono entries added.</p>
            ) : (
              proBonoEntries.map((entry, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-md border border-slate-700">
                  <span className="text-sm">{entry.organization_name || `Placement ${i + 1}`}</span>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleGenerateFormF(i)}
                    disabled={isGeneratingFormF || isSaving}
                  >
                    Download
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Form G */}
          {isProBonoScholar && (
            <div className="space-y-3 mt-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Pro Bono Scholars (Form G)</h4>
              <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-md border border-slate-700">
                <span className="text-sm">{proBonoScholars.placement_name || 'Incomplete'}</span>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={handleGenerateFormG}
                  disabled={isGeneratingFormG || isSaving || !proBonoScholars.placement_name}
                >
                  Download
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {message && (
        <div className="fixed bottom-8 right-8 bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-4">
          {message}
        </div>
      )}
    </div>
  );
}
