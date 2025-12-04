'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Button from '../ui/Button';
import Radio from '../ui/Radio';
import Textarea from '../ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { LicensesData, FidelityBondData } from '../../types/schema';

const getLicenseData = (data: any): LicensesData => ({
  has_issue: { value: '' },
  details: Array.isArray(data?.details) ? data.details : [],
  denial_explanation: '',
  revocation_explanation: '',
  ...data,
});

const getBondData = (data: any): FidelityBondData => ({
  has_issue: { value: '' },
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
    const updatedList = [...(licenses.details || [])];
    if (!updatedList[index]) updatedList[index] = {};
    updatedList[index] = { ...updatedList[index], [field]: value };
    setSection('licenses', { ...licenses, details: updatedList });
  };

  const addLicense = () => {
    const updatedList = [...(licenses.details || []), {}];
    setSection('licenses', { ...licenses, details: updatedList });
  };

  const updateLicenseText = (field: string, value: string) => {
    setField('licenses', field, value);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Licenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>Have you ever applied for any license requiring good character (other than bar)?</Label>
          <div className="flex gap-4">
            <Radio
              label="Yes"
              checked={licenses.has_issue?.value === 'Yes'}
              onChange={() => updateLicenseRadio('Yes')}
            />
            <Radio
              label="No"
              checked={licenses.has_issue?.value === 'No'}
              onChange={() => updateLicenseRadio('No')}
            />
          </div>

          {licenses.has_issue?.value === 'Yes' && (
            <div className="space-y-4 rounded-md bg-slate-700/50 p-4">
              {licenses.details?.map((lic, i) => (
                <div key={i} className="grid gap-4 rounded border border-slate-700 bg-slate-800/50 p-4">
                   <h4 className="font-medium text-slate-300">License #{i + 1}</h4>
                   <div className="space-y-2">
                     <Label>Type of License</Label>
                     <Input value={lic.name as string} onChange={(e) => updateLicenseDetail(i, 'name', e.target.value)} />
                   </div>
                   <div className="grid gap-4 sm:grid-cols-2">
                     <div className="space-y-2">
                       <Label>Issuing Authority</Label>
                       <Input value={lic.authority as string} onChange={(e) => updateLicenseDetail(i, 'authority', e.target.value)} />
                     </div>
                     <div className="space-y-2">
                       <Label>Date</Label>
                       <Input value={lic.date as string} onChange={(e) => updateLicenseDetail(i, 'date', e.target.value)} />
                     </div>
                   </div>
                </div>
              ))}
              <Button type="button" onClick={addLicense} variant="secondary" className="text-sm">
                + Add another license
              </Button>

              <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
                <div className="space-y-2">
                  <Label>Has any such license application ever been denied? (If yes, explain)</Label>
                  <Textarea
                    value={licenses.denial_explanation as string}
                    onChange={(e) => updateLicenseText('denial_explanation', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Has any such license ever been revoked/suspended? (If yes, explain)</Label>
                  <Textarea
                    value={licenses.revocation_explanation as string}
                    onChange={(e) => updateLicenseText('revocation_explanation', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fidelity Bond</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>Have you ever held a position covered by a fidelity bond?</Label>
          <div className="flex gap-4">
            <Radio
              label="Yes"
              checked={bond.has_issue?.value === 'Yes'}
              onChange={() => updateBondRadio('Yes')}
            />
            <Radio
              label="No"
              checked={bond.has_issue?.value === 'No'}
              onChange={() => updateBondRadio('No')}
            />
          </div>
          
          {bond.has_issue?.value === 'Yes' && (
            <div className="grid gap-4 rounded-md bg-slate-700/50 p-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Input value={bond.position as string} onChange={(e) => updateBond('position', e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>From:</Label>
                  <Input value={bond.from_date as string} onChange={(e) => updateBond('from_date', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>To:</Label>
                  <Input value={bond.to_date as string} onChange={(e) => updateBond('to_date', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Any claims made against the bond? (If yes, explain)</Label>
                <Textarea
                  value={bond.circumstances as string}
                  onChange={(e) => updateBond('circumstances', e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Group12Licenses;
