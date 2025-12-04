'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { HiOutlineCloudUpload, HiOutlineDocumentText, HiOutlineX } from 'react-icons/hi';

// Define the shape of the data for this section
// We'll store these in a 'header' section in the store, similar to the map
const SECTION_KEY = 'header';

interface HeaderData {
  admission_type?: string;
  department_selection?: string;
  has_notice?: string; // 'Yes' | 'No'
  bole_id?: string;
  pro_bono_scholars?: string; // 'Yes' | 'No'
}

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
    setField(SECTION_KEY, field, value);
    
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
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
        <h3 className="mb-4 text-base font-semibold text-white">Notice of Certification</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Have you passed the New York bar exam and received your "Notice of Certification"?</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="radio"
                  name="has_notice"
                  value="Yes"
                  checked={section.has_notice === 'Yes'}
                  onChange={(e) => updateField('has_notice', e.target.value)}
                  className="h-4 w-4 text-white accent-white"
                /> Yes             </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="radio"
                  name="has_notice"
                  value="No"
                  checked={section.has_notice === 'No'}
                  onChange={(e) => updateField('has_notice', e.target.value)}
                  className="h-4 w-4 text-white accent-white"
                /> No             </label>
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
        </div>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
        <h3 className="mb-4 text-base font-semibold text-white">Application Details</h3>
        
        <div className="grid gap-6">
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
                <label key={dept} className="flex items-center gap-2 rounded border border-slate-700 bg-slate-800/50 p-3 text-slate-300 hover:bg-slate-700/50 hover:text-white">
                  <input
                    type="radio"
                    name="department"
                    value={dept}
                    checked={section.department_selection === dept}
                    onChange={(e) => updateField('department_selection', e.target.value)}
                    className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
                  />
                  {dept}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>How are you applying for admission?</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="radio"
                  name="admission_type"
                  value="Examination"
                  checked={section.admission_type === 'Examination'}
                  onChange={(e) => updateField('admission_type', e.target.value)}
                  className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
                />
                Admission on examination
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="radio"
                  name="admission_type"
                  value="Motion"
                  checked={section.admission_type === 'Motion'}
                  onChange={(e) => updateField('admission_type', e.target.value)}
                  className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
                />
                Admission on motion without examination
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <Label>How will you fulfill the Pro Bono requirement?</Label>
            <p className="text-sm text-slate-400">
              All applicants must complete pro bono work. Choose one option:
            </p>
            <div className="space-y-3">
              <label 
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                  section.pro_bono_scholars === 'No'
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
                }`}
              >
                <input
                  type="radio"
                  name="pro_bono"
                  value="No"
                  checked={section.pro_bono_scholars === 'No'}
                  onChange={(e) => updateField('pro_bono_scholars', e.target.value)}
                  className="mt-1 h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
                />
                <div>
                  <div className="font-medium text-white">50-Hour Pro Bono Requirement</div>
                  <div className="text-sm text-slate-400">
                    I completed 50+ hours of qualifying pro bono work (before or after passing the bar exam). 
                    Requires Form F for each placement.
                  </div>
                </div>
              </label>
              <label 
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                  section.pro_bono_scholars === 'Yes'
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
                }`}
              >
                <input
                  type="radio"
                  name="pro_bono"
                  value="Yes"
                  checked={section.pro_bono_scholars === 'Yes'}
                  onChange={(e) => updateField('pro_bono_scholars', e.target.value)}
                  className="mt-1 h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-blue-500 checked:bg-blue-500 accent-blue-500 cursor-pointer"
                />
                <div>
                  <div className="font-medium text-white">Pro Bono Scholars Program</div>
                  <div className="text-sm text-slate-400">
                    I participated in the PBSP during my final year of law school. 
                    Requires Form G (PBSP Completion Affidavit).
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Group1Start;

