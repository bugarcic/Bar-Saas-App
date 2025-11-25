'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';

interface SignatureData {
  state_country?: string;
  county?: string;
  city?: string;
  applicant_name_in_oath?: string;
  date?: string;
}

interface AgentData {
  applicant_name?: string;
  judicial_department?: string;
  date?: string;
  notary_state?: string;
  notary_county?: string;
  notary_city?: string;
}

const getSignatureData = (data: any): SignatureData => ({
  state_country: '',
  county: '',
  city: '',
  applicant_name_in_oath: '',
  date: '',
  ...(data ?? {}),
});

const getAgentData = (data: any): AgentData => ({
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
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 ">
        <h3 className="mb-4 text-base font-semibold text-white">Signature & Oath</h3>
        <p className="mb-4 text-sm text-slate-300">
          This section will be signed in front of a Notary Public. Please enter the location where you plan to sign.
        </p>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Applicant Name (as it will appear in oath)</Label>
            <Input value={signature.applicant_name_in_oath} onChange={(e) => updateSig('applicant_name_in_oath', e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>State / Country</Label>
              <Input value={signature.state_country} onChange={(e) => updateSig('state_country', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>County</Label>
              <Input value={signature.county} onChange={(e) => updateSig('county', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={signature.city} onChange={(e) => updateSig('city', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Date of Signing</Label>
              <Input value={signature.date} onChange={(e) => updateSig('date', e.target.value)} placeholder="MM/DD/YYYY" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 ">
        <h3 className="mb-4 text-base font-semibold text-white">Designation of Agent</h3>
        <p className="mb-4 text-sm text-slate-300">
          Required for non-residents / non-full-time NY employees.
        </p>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Applicant Name</Label>
            <Input value={agent.applicant_name} onChange={(e) => updateAgent('applicant_name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Judicial Department</Label>
            <Input value={agent.judicial_department} onChange={(e) => updateAgent('judicial_department', e.target.value)} />
          </div>
          
          <h4 className="mt-2 font-medium text-slate-300">Notary Location</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Notary State</Label>
              <Input value={agent.notary_state} onChange={(e) => updateAgent('notary_state', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notary County</Label>
              <Input value={agent.notary_county} onChange={(e) => updateAgent('notary_county', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notary City</Label>
              <Input value={agent.notary_city} onChange={(e) => updateAgent('notary_city', e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label>Date</Label>
              <Input value={agent.date} onChange={(e) => updateAgent('date', e.target.value)} placeholder="MM/DD/YYYY" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Group13Signature;
