'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Select from '../ui/Select';
import DatePicker from '../ui/DatePicker';
import { US_STATES, formatPhone } from '../../lib/constants';

interface ContactInfoData {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  email?: string;
}

interface PriorResidenceData {
  from_date?: string;
  to_date?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

interface OfficeAddressData {
  name_and_street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  email?: string;
}

const getContactData = (data: any): ContactInfoData => ({
  street: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  phone: '',
  email: '',
  ...(data ?? {}),
});

const getPriorResidenceData = (data: any): PriorResidenceData => ({
  from_date: '',
  to_date: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  ...(data ?? {}),
});

const getOfficeData = (data: any): OfficeAddressData => ({
  name_and_street: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  phone: '',
  email: '',
  ...(data ?? {}),
});

export const Group3Contact: React.FC = () => {
  const contactData = useApplicationStore((state) => state.data['contact_info']);
  const priorResidenceData = useApplicationStore((state) => state.data['prior_residence']);
  const officeData = useApplicationStore((state) => state.data['office_address']);
  const setField = useApplicationStore((state) => state.setField);

  const contact = useMemo(() => getContactData(contactData), [contactData]);
  const prior = useMemo(() => getPriorResidenceData(priorResidenceData), [priorResidenceData]);
  const office = useMemo(() => getOfficeData(officeData), [officeData]);

  const updateContact = (field: keyof ContactInfoData, value: string) => {
    setField('contact_info', field, value);
  };

  const updatePrior = (field: keyof PriorResidenceData, value: string) => {
    setField('prior_residence', field, value);
  };

  const updateOffice = (field: keyof OfficeAddressData, value: string) => {
    setField('office_address', field, value);
  };

  return (
    <div className="space-y-8">
      {/* Contact Information */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 ">
        <h3 className="mb-4 text-base font-semibold text-white">Contact Information</h3>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Primary Email Address</Label>
              <Input
                value={contact.email ?? ''}
                onChange={(e) => updateContact('email', e.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Main Telephone Number</Label>
              <Input
                value={contact.phone ?? ''}
                onChange={(e) => updateContact('phone', formatPhone(e.target.value))}
                placeholder="(555) 555-5555"
                maxLength={14}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Current Residence */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 ">
        <h3 className="mb-4 text-base font-semibold text-white">Current Residence</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Street Address</Label>
            <Input
              value={contact.street ?? ''}
              onChange={(e) => updateContact('street', e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={contact.city ?? ''}
                onChange={(e) => updateContact('city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Select
                options={US_STATES}
                value={contact.state ?? ''}
                onChange={(value) => updateContact('state', value)}
                placeholder="Select state..."
              />
            </div>
            <div className="space-y-2">
              <Label>ZIP Code</Label>
              <Input
                value={contact.zip ?? ''}
                onChange={(e) => updateContact('zip', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                value={contact.country ?? ''}
                onChange={(e) => updateContact('country', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Prior Residence */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 ">
        <h3 className="mb-4 text-base font-semibold text-white">Previous Residence</h3>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-3 block">From:</Label>
              <DatePicker
                selected={prior.from_date ? new Date(prior.from_date + '-01') : null}
                onChange={(date) => updatePrior('from_date', date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : '')}
                showMonthYearPicker
                dateFormat="MM/yyyy"
                placeholder="Select month/year..."
              />
            </div>
            <div>
              <Label className="mb-3 block">To:</Label>
              <DatePicker
                selected={prior.to_date ? new Date(prior.to_date + '-01') : null}
                onChange={(date) => updatePrior('to_date', date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : '')}
                showMonthYearPicker
                dateFormat="MM/yyyy"
                placeholder="Select month/year..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Street Address</Label>
            <Input
              value={prior.street ?? ''}
              onChange={(e) => updatePrior('street', e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={prior.city ?? ''}
                onChange={(e) => updatePrior('city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Select
                options={US_STATES}
                value={prior.state ?? ''}
                onChange={(value) => updatePrior('state', value)}
                placeholder="Select state..."
              />
            </div>
            <div className="space-y-2">
              <Label>ZIP Code</Label>
              <Input
                value={prior.zip ?? ''}
                onChange={(e) => updatePrior('zip', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                value={prior.country ?? ''}
                onChange={(e) => updatePrior('country', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Office Address */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 ">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="text-base font-semibold text-white">Current Office Address</h3>
          <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">Optional</span>
        </div>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Employer/Organization Name & Street</Label>
            <Input
              value={office.name_and_street ?? ''}
              onChange={(e) => updateOffice('name_and_street', e.target.value)}
              placeholder="e.g. Law Firm LLP, 123 Main St"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={office.city ?? ''}
                onChange={(e) => updateOffice('city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Select
                options={US_STATES}
                value={office.state ?? ''}
                onChange={(value) => updateOffice('state', value)}
                placeholder="Select state..."
              />
            </div>
            <div className="space-y-2">
              <Label>ZIP Code</Label>
              <Input
                value={office.zip ?? ''}
                onChange={(e) => updateOffice('zip', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                value={office.country ?? ''}
                onChange={(e) => updateOffice('country', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Office Phone</Label>
              <Input
                value={office.phone ?? ''}
                onChange={(e) => updateOffice('phone', formatPhone(e.target.value))}
                placeholder="(555) 555-5555"
                maxLength={14}
              />
            </div>
            <div className="space-y-2">
              <Label>Office Email</Label>
              <Input
                value={office.email ?? ''}
                onChange={(e) => updateOffice('email', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Group3Contact;
