import { z } from 'zod';

// --- Shared Helpers ---

const YesNoSchema = z.object({ value: z.enum(['Yes', 'No', '']) }).optional();

export const GenericIssueSchema = z.object({
  has_issue: YesNoSchema,
  details: z.string().optional(),
  explanation: z.string().optional(),
}).refine((data) => {
  if (data.has_issue?.value === 'Yes') {
    // Check for either details or explanation
    return (!!data.details && data.details.length > 0) || (!!data.explanation && data.explanation.length > 0);
  }
  return true;
}, { message: "Details/Explanation required if 'Yes' is selected" });

// --- Section Schemas ---

export const HeaderSchema = z.object({
  admission_type: z.string().min(1, "Admission type is required"),
  department_selection: z.string().min(1, "Department selection is required"),
  has_notice: z.string().min(1, "Notice of certification status is required"),
  bole_id: z.string().min(1, "BOLE ID is required"),
  pro_bono_scholars: z.string().optional(),
});

export const PersonalInfoSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  suffix: z.string().optional(),
  ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/, "SSN must be in format ###-##-####").optional().or(z.literal('')),
  bole_id: z.string().min(1, "BOLE ID is required"),
  dob: z.string().min(1, "Date of birth is required"),
  birth_city: z.string().min(1, "Birth city is required"),
  birth_state: z.string().optional(),
  birth_country: z.string().min(1, "Birth country is required"),
  has_other_names: z.union([z.string(), z.object({ value: z.string() })]).optional(),
  other_names: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    reason: z.string().min(1, "Reason is required"),
  })).optional(),
});

export const ContactInfoSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Invalid email address"),
});

export const PriorResidenceSchema = z.object({
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
});

export const OfficeAddressSchema = z.object({
  name_and_street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
});

export const EducationEntrySchema = z.object({
  school_name: z.string().min(1, "School name is required"),
  from_date: z.string().min(1, "Start date is required"),
  to_date: z.string().min(1, "End date is required"),
  degree: z.string().optional(),
  street: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().min(1, "Country is required"),
});

export const DisciplineSchema = z.object({
  has_issue: YesNoSchema,
  institution: z.string().optional(),
  date: z.string().optional(),
  reason: z.string().optional(),
}).refine((data) => {
  if (data.has_issue?.value === 'Yes') {
    return !!data.institution && !!data.date && !!data.reason;
  }
  return true;
}, { message: "Details required if 'Yes' is selected" });

export const EmploymentEntrySchema = z.object({
  employer: z.string().min(1, "Employer name is required"),
  position: z.string().min(1, "Position is required"),
  from_date: z.string().min(1, "Start date is required"),
  to_date: z.string().optional(),
  street: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  is_legal_work: z.boolean().optional(),
});

export const AffirmantSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  home_street: z.string().min(1, "Home street is required"),
  home_city: z.string().min(1, "Home city is required"),
  home_email: z.string().email("Invalid email address").optional().or(z.literal('')),
});

export const EmploymentAffirmantSchema = z.object({
  affirmant_name: z.string().min(1, "Supervisor name is required"),
  employer_name: z.string().min(1, "Employer name is required"),
});

export const SkillsCompetencySchema = z.object({
  pathway: z.string().min(1, "Pathway selection is required"),
}).passthrough(); // Allow other fields for now, just check pathway

export const ProBonoEntrySchema = z.object({
  organization_name: z.string().min(1, "Organization name is required"),
  hours: z.string().min(1, "Hours are required"),
});

export const ProBonoScholarsSchema = z.object({
  placement_name: z.string().min(1, "Placement name is required"),
  hours: z.string().min(1, "Hours are required"),
});

export const SignatureSchema = z.object({
  applicant_name_in_oath: z.string().min(1, "Applicant name is required"),
  date: z.string().min(1, "Date is required"),
});

// --- Combined Application Schema (Optional, for reference) ---
export const ApplicationSchema = z.object({
  header: HeaderSchema.optional(),
  personal_info: PersonalInfoSchema.optional(),
  contact_info: ContactInfoSchema.optional(),
  education_undergrad: z.array(EducationEntrySchema).optional(),
  law_schools: z.array(EducationEntrySchema).optional(),
  employment_history: z.array(EmploymentEntrySchema).optional(),
});
