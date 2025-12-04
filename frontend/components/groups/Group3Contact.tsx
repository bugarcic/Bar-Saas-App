'use client';

import React, { useMemo } from 'react';
import { useApplicationStore } from '../../store/useApplicationStore';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Select from '../ui/Select';
import DatePicker from '../ui/DatePicker';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { US_STATES, formatPhone } from '../../lib/constants';
import { ContactInfoData, PriorResidenceData, OfficeAddressData } from '../../types/schema';

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
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Primary Email Address</Label>
              <Input
                value={contact.email as string}
                onChange={(e) => updateContact('email', e.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Main Telephone Number</Label>
              <Input
                value={contact.phone as string}
                onChange={(e) => updateContact('phone', formatPhone(e.target.value))}
                placeholder="(555) 555-5555"
                maxLength={14}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Residence */}
      <Card>
        <CardHeader>
          <CardTitle>Current Residence</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label>Street Address</Label>
            <Input
              value={contact.street as string}
              onChange={(e) => updateContact('street', e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={contact.city as string}
                onChange={(e) => updateContact('city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Select
                options={US_STATES}
                value={contact.state as string}
                onChange={(value) => updateContact('state', value)}
                placeholder="Select state..."
              />
            </div>
            <div className="space-y-2">
              <Label>ZIP Code</Label>
              <Input
                value={contact.zip as string}
                onChange={(e) => updateContact('zip', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                value={contact.country as string}
                onChange={(e) => updateContact('country', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prior Residence */}
      <Card>
        <CardHeader>
          <CardTitle>Previous Residence</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-3 block">From:</Label>
              <DatePicker
                selected={prior.from_date ? new Date(prior.from_date as string + '-01') : null}
                onChange={(date) => updatePrior('from_date', date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : '')}
                showMonthYearPicker
                dateFormat="MM/yyyy"
                placeholder="Select month/year..."
              />
            </div>
            <div>
              <Label className="mb-3 block">To:</Label>
              <DatePicker
                selected={prior.to_date ? new Date(prior.to_date as string + '-01') : null}
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
              value={prior.street as string}
              onChange={(e) => updatePrior('street', e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={prior.city as string}
                onChange={(e) => updatePrior('city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Select
                options={US_STATES}
                value={prior.state as string}
                onChange={(value) => updatePrior('state', value)}
                placeholder="Select state..."
              />
            </div>
            <div className="space-y-2">
              <Label>ZIP Code</Label>
              <Input
                value={prior.zip as string}
                onChange={(e) => updatePrior('zip', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                value={prior.country as string}
                onChange={(e) => updatePrior('country', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Office Address */}
      <Card>
        <CardHeader>
          <div className="flex w-full flex-row items-center justify-between">
            <CardTitle>Current Office Address</CardTitle>
            <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">Optional</span>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label>Employer/Organization Name & Street</Label>
            <Input
              value={office.name_and_street as string}
              onChange={(e) => updateOffice('name_and_street', e.target.value)}
              placeholder="e.g. Law Firm LLP, 123 Main St"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={office.city as string}
                onChange={(e) => updateOffice('city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Select
                options={US_STATES}
                value={office.state as string}
                onChange={(value) => updateOffice('state', value)}
                placeholder="Select state..."
              />
            </div>
            <div className="space-y-2">
              <Label>ZIP Code</Label>
              <Input
                value={office.zip as string}
                onChange={(e) => updateOffice('zip', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                value={office.country as string}
                onChange={(e) => updateOffice('country', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Office Phone</Label>
              <Input
                value={office.phone as string}
                onChange={(e) => updateOffice('phone', formatPhone(e.target.value))}
                placeholder="(555) 555-5555"
                maxLength={14}
              />
            </div>
            <div className="space-y-2">
              <Label>Office Email</Label>
              <Input
                value={office.email as string}
                onChange={(e) => updateOffice('email', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Group3Contact;
