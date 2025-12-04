'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Radio from '../ui/Radio';
import { HiOutlineCloudUpload, HiOutlineDocumentText, HiOutlineX } from 'react-icons/hi';
import { HeaderData } from '../../types/schema';

// Define the shape of the data for this section
// We'll store these in a 'header' section in the store, similar to the map
const SECTION_KEY = 'header';

const getSectionData = (data: any): HeaderData => ({
  admission_type: '',
  department_selection: '',
  has_notice: '',
  bole_id: '',
  pro_bono_scholars: '',
  ...(data ?? {}),
});

export const Group1Start: React.FC = () => {
  const data = useApplicationStore((state) => state.data[SECTION_KEY]);
  const setField = useApplicationStore((state) => state.setField);

  const section = useMemo(() => getSectionData(data), [data]);
  
  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const updateField = (field: keyof HeaderData, value: string) => {
    // Explicitly cast field to string to satisfy the generic store signature
    // while maintaining type safety within this component via the function signature
    setField(SECTION_KEY, field as string, value);
    
    // Sync bole_id to personal_info as well
    if (field === 'bole_id') {
      setField('personal_info', 'bole_id', value);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setUploadedFile(file);
      }
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
    }
  }, []);

  const removeFile = useCallback(() => {
    setUploadedFile(null);
  }, []);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Notice of Certification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Have you passed the New York bar exam and received your "Notice of Certification"?</Label>
            <div className="flex gap-4">
              <Radio
                name="has_notice"
                label="Yes"
                checked={section.has_notice === 'Yes'}
                onChange={() => updateField('has_notice', 'Yes')}
              />
              <Radio
                name="has_notice"
                label="No"
                checked={section.has_notice === 'No'}
                onChange={() => updateField('has_notice', 'No')}
              />
            </div>
          </div>

          {section.has_notice === 'Yes' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-300">
                Upload your Notice of Certification (PDF). You can find this in your email from the NY Bar.
              </p>
              
              {!uploadedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                    isDragging
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/30'
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  <HiOutlineCloudUpload className={`mb-3 h-12 w-12 ${isDragging ? 'text-blue-400' : 'text-slate-500'}`} />
                  <p className="mb-1 text-sm font-medium text-slate-300">
                    Drag and drop your PDF here
                  </p>
                  <p className="text-xs text-slate-500">
                    or click to browse files
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                  <HiOutlineDocumentText className="h-8 w-8 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{uploadedFile.name}</p>
                    <p className="text-xs text-slate-400">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
                    title="Remove file"
                  >
                    <HiOutlineX className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {section.has_notice === 'No' && (
            <div className="rounded-md bg-amber-900/30 border border-amber-800 p-4 text-sm text-amber-300">
              <p>
                You can still answer the rest of these questions now, but you may need your Notice of Certification
                before you can file (depending on your Department).
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        
        <CardContent className="grid gap-6">
          <div className="space-y-2">
            <Label>BOLE ID Number</Label>
            <Input
              value={section.bole_id ?? ''}
              onChange={(e) => updateField('bole_id', e.target.value)}
              placeholder="Enter your BOLE ID"
            />
          </div>

          <div className="space-y-2">
            <Label>Which Appellate Division are you applying to?</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {['First Department', 'Second Department', 'Third Department', 'Fourth Department'].map((dept) => (
                <div key={dept} className="rounded border border-slate-700 bg-slate-800/50 p-3 hover:bg-slate-700/50">
                  <Radio
                    name="department"
                    label={dept}
                    checked={section.department_selection === dept}
                    onChange={() => updateField('department_selection', dept)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>How are you applying for admission?</Label>
            <div className="space-y-2">
              <Radio
                name="admission_type"
                label="Admission on examination"
                checked={section.admission_type === 'Examination'}
                onChange={() => updateField('admission_type', 'Examination')}
              />
              <Radio
                name="admission_type"
                label="Admission on motion without examination"
                checked={section.admission_type === 'Motion'}
                onChange={() => updateField('admission_type', 'Motion')}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>How will you fulfill the Pro Bono requirement?</Label>
            <p className="text-sm text-slate-400">
              All applicants must complete pro bono work. Choose one option:
            </p>
            <div className="space-y-3">
              <div 
                onClick={() => updateField('pro_bono_scholars', 'No')}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                  section.pro_bono_scholars === 'No'
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
                }`}
              >
                <div className="mt-1">
                  <Radio
                    name="pro_bono"
                    checked={section.pro_bono_scholars === 'No'}
                    onChange={() => {}} // Handled by parent div
                  />
                </div>
                <div>
                  <div className="font-medium text-white">50-Hour Pro Bono Requirement</div>
                  <div className="text-sm text-slate-400">
                    I completed 50+ hours of qualifying pro bono work (before or after passing the bar exam). 
                    Requires Form F for each placement.
                  </div>
                </div>
              </div>
              <div 
                onClick={() => updateField('pro_bono_scholars', 'Yes')}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                  section.pro_bono_scholars === 'Yes'
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
                }`}
              >
                <div className="mt-1">
                  <Radio
                    name="pro_bono"
                    checked={section.pro_bono_scholars === 'Yes'}
                    onChange={() => {}} // Handled by parent div
                  />
                </div>
                <div>
                  <div className="font-medium text-white">Pro Bono Scholars Program</div>
                  <div className="text-sm text-slate-400">
                    I participated in the PBSP during my final year of law school. 
                    Requires Form G (PBSP Completion Affidavit).
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Group1Start;
