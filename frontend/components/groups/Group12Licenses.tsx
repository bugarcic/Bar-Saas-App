'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';

interface License {
  name?: string;
  date?: string;
  authority?: string;
}

interface LicensesData {
  has_issue?: { value?: string };
  details?: License[];
  denial_explanation?: string;
  revocation_explanation?: string;
}

interface FidelityBond {
  has_issue?: { value?: string };
  position?: string;
  from_date?: string;
  to_date?: string;
  circumstances?: string;
}

const getLicenseData = (data: any): LicensesData => ({
  has_issue: { value: 'No' },
  details: Array.isArray(data?.details) ? data.details : [],
  denial_explanation: '',
  revocation_explanation: '',
  ...data,
});

const getBondData = (data: any): FidelityBond => ({
  has_issue: { value: 'No' },
  position: '',
  from_date: '',
  to_date: '',
  circumstances: '',
  ...(data ?? {}),
});

export const Group12Licenses: React.FC = () => {
  const licensesData = useApplicationStore((state) => state.data['licenses']);
  const bondData = useApplicationStore((state) => state.data['fidelity_bond']);
  
  const setSection = useApplicationStore((state) => state.setSection);
  const setField = useApplicationStore((state) => state.setField);

  const licenses = useMemo(() => getLicenseData(licensesData), [licensesData]);
  const bond = useMemo(() => getBondData(bondData), [bondData]);

  const updateLicenseRadio = (val: string) => {
    setField('licenses', 'has_issue', { type: 'radio', value: val });
  };

  const updateBondRadio = (val: string) => {
    setField('fidelity_bond', 'has_issue', { type: 'radio', value: val });
  };

  const updateBond = (field: string, value: string) => {
    setField('fidelity_bond', field, value);
  };

  const updateLicenseDetail = (index: number, field: string, value: string) => {
    const updatedList = [...licenses.details!];
    if (!updatedList[index]) updatedList[index] = {};
    updatedList[index] = { ...updatedList[index], [field]: value };
    setSection('licenses', { ...licenses, details: updatedList });
  };

  const addLicense = () => {
    const updatedList = [...licenses.details!, {}];
    setSection('licenses', { ...licenses, details: updatedList });
  };

  const updateLicenseText = (field: string, value: string) => {
    setField('licenses', field, value);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 ">
        <h3 className="mb-4 text-base font-semibold text-white">Licenses</h3>
        <div className="space-y-4">
          <Label>Have you ever applied for any license requiring good character (other than bar)?</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="radio"
                checked={licenses.has_issue?.value === 'Yes'}
                onChange={() => updateLicenseRadio('Yes')}
                className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-emerald-500 checked:bg-emerald-500 accent-emerald-500 cursor-pointer"
              /> Yes             </label>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="radio"
                checked={licenses.has_issue?.value === 'No'}
                onChange={() => updateLicenseRadio('No')}
                className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-emerald-500 checked:bg-emerald-500 accent-emerald-500 cursor-pointer"
              /> No             </label>
          </div>

          {licenses.has_issue?.value === 'Yes' && (
            <div className="space-y-4 rounded-md bg-slate-700/50 p-4">
              {licenses.details?.map((lic, i) => (
                <div key={i} className="grid gap-4 rounded border border-slate-700 bg-slate-800/50 p-4">
                   <h4 className="font-medium text-slate-300">License #{i + 1}</h4>
                   <div className="space-y-2">
                     <Label>Type of License</Label>
                     <Input value={lic.name} onChange={(e) => updateLicenseDetail(i, 'name', e.target.value)} />
                   </div>
                   <div className="grid gap-4 sm:grid-cols-2">
                     <div className="space-y-2">
                       <Label>Issuing Authority</Label>
                       <Input value={lic.authority} onChange={(e) => updateLicenseDetail(i, 'authority', e.target.value)} />
                     </div>
                     <div className="space-y-2">
                       <Label>Date</Label>
                       <Input value={lic.date} onChange={(e) => updateLicenseDetail(i, 'date', e.target.value)} />
                     </div>
                   </div>
                </div>
              ))}
              <button onClick={addLicense} className="text-sm text-white hover:underline">+ Add another license</button>

              <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
                <div className="space-y-2">
                  <Label>Has any such license application ever been denied? (If yes, explain)</Label>
                  <textarea
                    value={licenses.denial_explanation}
                    onChange={(e) => updateLicenseText('denial_explanation', e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-800 p-2 text-sm text-white placeholder:text-slate-500"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Has any such license ever been revoked/suspended? (If yes, explain)</Label>
                  <textarea
                    value={licenses.revocation_explanation}
                    onChange={(e) => updateLicenseText('revocation_explanation', e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-800 p-2 text-sm text-white placeholder:text-slate-500"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 ">
        <h3 className="mb-4 text-base font-semibold text-white">Fidelity Bond</h3>
        <div className="space-y-4">
          <Label>Have you ever held a position covered by a fidelity bond?</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="radio"
                checked={bond.has_issue?.value === 'Yes'}
                onChange={() => updateBondRadio('Yes')}
                className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-emerald-500 checked:bg-emerald-500 accent-emerald-500 cursor-pointer"
              /> Yes             </label>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="radio"
                checked={bond.has_issue?.value === 'No'}
                onChange={() => updateBondRadio('No')}
                className="h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-800 checked:border-emerald-500 checked:bg-emerald-500 accent-emerald-500 cursor-pointer"
              /> No             </label>
          </div>
          
          {bond.has_issue?.value === 'Yes' && (
            <div className="grid gap-4 rounded-md bg-slate-700/50 p-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Input value={bond.position} onChange={(e) => updateBond('position', e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Input value={bond.from_date} onChange={(e) => updateBond('from_date', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input value={bond.to_date} onChange={(e) => updateBond('to_date', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Any claims made against the bond? (If yes, explain)</Label>
                <textarea
                  value={bond.circumstances}
                  onChange={(e) => updateBond('circumstances', e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-800 p-2 text-sm text-white placeholder:text-slate-500"
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Group12Licenses;
