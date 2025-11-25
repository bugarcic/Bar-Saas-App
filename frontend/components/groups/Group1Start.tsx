'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';

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

  const updateField = (field: keyof HeaderData, value: string) => {
    setField(SECTION_KEY, field, value);
    
    // Sync bole_id to personal_info as well
    if (field === 'bole_id') {
      setField('personal_info', 'bole_id', value);
    }
  };

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
            <div className="rounded-md bg-slate-700/50 p-4">
              <p className="mb-2 text-sm text-slate-300">
                Please upload your Notice of Certification (PDF).
              </p>
              <input type="file" accept=".pdf" className="text-sm text-slate-400" />
              {/* Placeholder for parsing logic */}
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
                    className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-emerald-500 checked:bg-emerald-500 accent-emerald-500 cursor-pointer"
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
                  className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-emerald-500 checked:bg-emerald-500 accent-emerald-500 cursor-pointer"
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
                  className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-emerald-500 checked:bg-emerald-500 accent-emerald-500 cursor-pointer"
                />
                Admission on motion without examination
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Did you participate in the Pro Bono Scholars Program?</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="radio"
                  name="pro_bono"
                  value="Yes"
                  checked={section.pro_bono_scholars === 'Yes'}
                  onChange={(e) => updateField('pro_bono_scholars', e.target.value)}
                  className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-emerald-500 checked:bg-emerald-500 accent-emerald-500 cursor-pointer"
                /> Yes             </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="radio"
                  name="pro_bono"
                  value="No"
                  checked={section.pro_bono_scholars === 'No'}
                  onChange={(e) => updateField('pro_bono_scholars', e.target.value)}
                  className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-emerald-500 checked:bg-emerald-500 accent-emerald-500 cursor-pointer"
                /> No             </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Group1Start;

