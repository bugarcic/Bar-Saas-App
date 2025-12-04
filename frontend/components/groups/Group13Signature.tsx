'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';
import DatePicker from '../ui/DatePicker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { SignatureData, DesignationOfAgentData } from '../../types/schema';

const getSignatureData = (data: any): SignatureData => ({
  state_country: '',
  county: '',
  city: '',
  applicant_name_in_oath: '',
  date: '',
  ...(data ?? {}),
});

const getAgentData = (data: any): DesignationOfAgentData => ({
  applicant_name: '',
  judicial_department: '',
  date: '',
  notary_state: '',
  notary_county: '',
  notary_city: '',
  ...(data ?? {}),
});

export const Group13Signature: React.FC = () => {
  const signatureData = useApplicationStore((state) => state.data['signature_block']);
  const agentData = useApplicationStore((state) => state.data['designation_of_agent']);
  const setField = useApplicationStore((state) => state.setField);

  const signature = useMemo(() => getSignatureData(signatureData), [signatureData]);
  const agent = useMemo(() => getAgentData(agentData), [agentData]);

  const updateSig = (field: string, value: string) => {
    setField('signature_block', field, value);
  };

  const updateAgent = (field: string, value: string) => {
    setField('designation_of_agent', field, value);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Signature & Oath</CardTitle>
          <CardDescription>
            This section will be signed in front of a Notary Public. Please enter the location where you plan to sign.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label>Applicant Name (as it will appear in oath)</Label>
            <Input value={signature.applicant_name_in_oath as string} onChange={(e) => updateSig('applicant_name_in_oath', e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>State / Country</Label>
              <Input value={signature.state_country as string} onChange={(e) => updateSig('state_country', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>County</Label>
              <Input value={signature.county as string} onChange={(e) => updateSig('county', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={signature.city as string} onChange={(e) => updateSig('city', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Date of Signing</Label>
              <DatePicker
                selected={signature.date ? new Date(signature.date as string) : null}
                onChange={(date) => updateSig('date', date ? date.toISOString().split('T')[0] : '')}
                placeholder="Select date..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Designation of Agent</CardTitle>
          <CardDescription>
            Required for non-residents / non-full-time NY employees.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label>Applicant Name</Label>
            <Input value={agent.applicant_name as string} onChange={(e) => updateAgent('applicant_name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Judicial Department</Label>
            <Input value={agent.judicial_department as string} onChange={(e) => updateAgent('judicial_department', e.target.value)} />
          </div>
          
          <h4 className="mt-2 font-medium text-slate-300">Notary Location</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Notary State</Label>
              <Input value={agent.notary_state as string} onChange={(e) => updateAgent('notary_state', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notary County</Label>
              <Input value={agent.notary_county as string} onChange={(e) => updateAgent('notary_county', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notary City</Label>
              <Input value={agent.notary_city as string} onChange={(e) => updateAgent('notary_city', e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label>Date</Label>
              <DatePicker
                selected={agent.date ? new Date(agent.date as string) : null}
                onChange={(date) => updateAgent('date', date ? date.toISOString().split('T')[0] : '')}
                placeholder="Select date..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Group13Signature;
