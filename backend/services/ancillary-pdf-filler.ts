import fs from 'fs';
import path from 'path';
import { PDFCheckBox, PDFDocument, PDFRadioGroup } from 'pdf-lib';

type AnyObject = Record<string, any>;

interface FieldDescriptor {
  field: string;
  type?: 'radio' | 'checkbox' | 'text';
  option?: string; // For radio buttons with specific option values
}

type MappingValue = string | FieldDescriptor;

// Template paths
const TEMPLATES: Record<string, string> = {
  C: 'C-Bar_Admissions-Good Moral Character.pdf',
  D: 'D-Bar_Admissions-Employment.pdf',
  E: 'E-Bar_Admissions-Law School Certificate.pdf',
  F: 'F-Bar_Admissions-Pro Bono Requirements.pdf',
  G: 'G-Bar_Admissions-Pro Bono Scholars Program.pdf',
  H: 'H-Bar_Admissions-Skills and Values.pdf',
};

const ancillaryMappingPath = path.resolve(__dirname, '../mappings/ancillary-maps.json');

/**
 * Load the ancillary mappings from JSON
 */
function loadAncillaryMappings(): AnyObject {
  return JSON.parse(fs.readFileSync(ancillaryMappingPath, 'utf8'));
}

/**
 * Get the PDF template path for a given form type
 */
function getTemplatePath(formType: string): string {
  const templateName = TEMPLATES[formType];
  if (!templateName) {
    throw new Error(`Unknown form type: ${formType}`);
  }
  return path.resolve(__dirname, '../templates', templateName);
}

/**
 * Map department selection string to the appropriate index (1-4)
 */
function getDepartmentIndex(department: string): number {
  const deptMap: Record<string, number> = {
    'First Department': 1,
    'Second Department': 2,
    'Third Department': 3,
    'Fourth Department': 4,
  };
  return deptMap[department] || 1;
}

/**
 * Combine first, middle, last name into full name
 */
function buildFullName(personalInfo: AnyObject): string {
  const parts = [
    personalInfo?.first_name,
    personalInfo?.middle_name,
    personalInfo?.last_name,
    personalInfo?.suffix,
  ].filter(Boolean);
  return parts.join(' ');
}

/**
 * Set a text field value in the PDF form
 */
function setTextField(form: ReturnType<PDFDocument['getForm']>, fieldName: string, value: any): void {
  if (value === undefined || value === null || value === '') return;
  try {
    const textField = form.getTextField(fieldName);
    textField.setText(String(value));
    console.log(`[ancillary-pdf] Set text field "${fieldName}" = "${value}"`);
  } catch (err) {
    console.warn(`[ancillary-pdf] Unable to set text field "${fieldName}": ${(err as Error).message}`);
  }
}

/**
 * Set a checkbox value in the PDF form
 */
function setCheckbox(form: ReturnType<PDFDocument['getForm']>, fieldName: string, checked: boolean): void {
  try {
    const checkbox: PDFCheckBox = form.getCheckBox(fieldName);
    if (checked) {
      checkbox.check();
    } else {
      checkbox.uncheck();
    }
    console.log(`[ancillary-pdf] Set checkbox "${fieldName}" = ${checked}`);
  } catch (err) {
    console.warn(`[ancillary-pdf] Unable to set checkbox "${fieldName}": ${(err as Error).message}`);
  }
}

/**
 * Set a radio button value in the PDF form
 */
function setRadio(form: ReturnType<PDFDocument['getForm']>, fieldName: string, optionValue: string): void {
  try {
    const radioGroup: PDFRadioGroup = form.getRadioGroup(fieldName);
    const options = radioGroup.getOptions();
    if (options.includes(optionValue)) {
      radioGroup.select(optionValue);
      console.log(`[ancillary-pdf] Set radio "${fieldName}" = "${optionValue}"`);
    } else {
      console.warn(`[ancillary-pdf] Option "${optionValue}" not found for radio "${fieldName}". Options: ${options.join(', ')}`);
    }
  } catch (err) {
    console.warn(`[ancillary-pdf] Unable to set radio "${fieldName}": ${(err as Error).message}`);
  }
}

/**
 * Apply a field value based on the mapping descriptor
 */
function applyField(form: ReturnType<PDFDocument['getForm']>, mapping: MappingValue, value: any): void {
  if (typeof mapping === 'string') {
    // Simple text field
    setTextField(form, mapping, value);
  } else if (typeof mapping === 'object' && mapping.field) {
    const { field, type, option } = mapping;
    if (type === 'checkbox') {
      setCheckbox(form, field, !!value);
    } else if (type === 'radio' && option) {
      // For radio buttons, we select the option if value is truthy
      if (value) {
        setRadio(form, field, option);
      }
    } else {
      setTextField(form, field, value);
    }
  }
}

// ============================================================================
// FORM E - Law School Certificate
// ============================================================================

interface FormEData {
  // From personal_info
  applicant_name: string;
  bole_id: string;
  ssn: string;
  // From contact_info
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  // Law school info (from law_schools array)
  school_name: string;
  school_street: string;
  school_city: string;
  school_state: string;
  school_zip: string;
  school_country: string;
  // Department
  department: string; // 'First Department', etc.
}

/**
 * Extract Form E data from the full user data object for a specific law school
 */
export function extractFormEData(userData: AnyObject, lawSchoolIndex: number): FormEData {
  const personalInfo = userData.personal_info || {};
  const contactInfo = userData.contact_info || {};
  const header = userData.header || {};
  const lawSchools = userData.law_schools || [];
  const lawSchool = lawSchools[lawSchoolIndex] || {};

  return {
    applicant_name: buildFullName(personalInfo),
    bole_id: header.bole_id || personalInfo.bole_id || '',
    ssn: personalInfo.ssn || '',
    street: contactInfo.street || '',
    city: contactInfo.city || '',
    state: contactInfo.state || '',
    zip: contactInfo.zip || '',
    country: contactInfo.country || '',
    phone: contactInfo.phone || '',
    email: contactInfo.email || '',
    school_name: lawSchool.school_name || '',
    school_street: lawSchool.street || '',
    school_city: lawSchool.city || '',
    school_state: lawSchool.state || '',
    school_zip: lawSchool.zip || '',
    school_country: lawSchool.country || '',
    department: header.department_selection || 'First Department',
  };
}

/**
 * Generate a Law School Certificate PDF (Form E) for a specific law school
 */
export async function generateFormE(userData: AnyObject, lawSchoolIndex: number = 0): Promise<Uint8Array> {
  const mappings = loadAncillaryMappings();
  const formEMap = mappings.form_e_law_school;
  
  if (!formEMap) {
    throw new Error('Form E mapping not found in ancillary-maps.json');
  }

  const templatePath = getTemplatePath('E');
  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  // Extract the data for this specific law school
  const data = extractFormEData(userData, lawSchoolIndex);
  
  console.log(`[ancillary-pdf] Generating Form E for law school index ${lawSchoolIndex}:`, data.school_name);

  // Fill header section (applicant info)
  const headerMap = formEMap.header || {};
  applyField(form, headerMap.applicant_name, data.applicant_name);
  applyField(form, headerMap.bole_id, data.bole_id);
  applyField(form, headerMap.street, data.street);
  applyField(form, headerMap.city, data.city);
  applyField(form, headerMap.state, data.state);
  applyField(form, headerMap.zip, data.zip);
  applyField(form, headerMap.country, data.country);
  applyField(form, headerMap.phone, data.phone);
  applyField(form, headerMap.email, data.email);
  applyField(form, headerMap.ssn, data.ssn);

  // Fill school target section
  const schoolMap = formEMap.school_target || {};
  applyField(form, schoolMap.school_name, data.school_name);
  applyField(form, schoolMap.school_street, data.school_street);
  applyField(form, schoolMap.school_city, data.school_city);
  applyField(form, schoolMap.school_state, data.school_state);
  applyField(form, schoolMap.school_zip, data.school_zip);
  applyField(form, schoolMap.school_country, data.school_country);

  // Fill authorization section (applicant name and school name printed)
  const authMap = formEMap.authorization || {};
  applyField(form, authMap.applicant_name_print, data.applicant_name);
  applyField(form, authMap.school_name_print, data.school_name);

  // Set the department checkbox
  const deptMap = formEMap.department_selection || {};
  const deptIndex = getDepartmentIndex(data.department);
  
  // Uncheck all department checkboxes first, then check the right one
  if (deptMap.dept_1) applyField(form, deptMap.dept_1, deptIndex === 1);
  if (deptMap.dept_2) applyField(form, deptMap.dept_2, deptIndex === 2);
  if (deptMap.dept_3) applyField(form, deptMap.dept_3, deptIndex === 3);
  if (deptMap.dept_4) applyField(form, deptMap.dept_4, deptIndex === 4);

  return pdfDoc.save();
}

/**
 * Generate all Law School Certificate PDFs for all law schools in the user's data
 */
export async function generateAllFormE(userData: AnyObject): Promise<{ schoolName: string; pdf: Uint8Array }[]> {
  const lawSchools = userData.law_schools || [];
  const results: { schoolName: string; pdf: Uint8Array }[] = [];

  for (let i = 0; i < lawSchools.length; i++) {
    const school = lawSchools[i];
    // Only generate if school has a name
    if (school?.school_name) {
      const pdf = await generateFormE(userData, i);
      results.push({
        schoolName: school.school_name,
        pdf,
      });
    }
  }

  return results;
}

// ============================================================================
// FORM C - Good Moral Character Affirmation
// ============================================================================

interface CharacterAffirmant {
  full_name?: string;
  home_street?: string;
  home_city?: string;
  home_state?: string;
  home_zip?: string;
  home_country?: string;
  home_phone?: string;
  home_email?: string;
  business_street?: string;
  business_city?: string;
  business_state?: string;
  business_zip?: string;
  business_country?: string;
  business_phone?: string;
  business_email?: string;
  is_attorney?: string;
  // Attorney admissions - 2 rows on the form (fields 18-21)
  attorney_jurisdiction_1?: string;
  attorney_year_1?: string;
  attorney_jurisdiction_2?: string;
  attorney_year_2?: string;
  // Character statement (field 22)
  character_statement?: string;
}

interface FormCData {
  applicant_name: string;
  bole_id: string;
  department: string;
  affirmant: CharacterAffirmant;
}

/**
 * Extract Form C data from the full user data object for a specific affirmant
 */
export function extractFormCData(userData: AnyObject, affirmantIndex: number): FormCData {
  const personalInfo = userData.personal_info || {};
  const header = userData.header || {};
  const affirmants = userData.character_affirmants || [];
  const affirmant = affirmants[affirmantIndex] || {};

  return {
    applicant_name: buildFullName(personalInfo),
    bole_id: header.bole_id || personalInfo.bole_id || '',
    department: header.department_selection || 'First Department',
    affirmant,
  };
}

/**
 * Generate a Good Moral Character Affirmation PDF (Form C) for a specific affirmant
 */
export async function generateFormC(userData: AnyObject, affirmantIndex: number = 0): Promise<Uint8Array> {
  const mappings = loadAncillaryMappings();
  const formCMap = mappings.form_c_moral_character;
  
  if (!formCMap) {
    throw new Error('Form C mapping not found in ancillary-maps.json');
  }

  const templatePath = getTemplatePath('C');
  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  // Extract the data for this specific affirmant
  const data = extractFormCData(userData, affirmantIndex);
  const affirmant = data.affirmant;
  
  console.log(`[ancillary-pdf] Generating Form C for affirmant index ${affirmantIndex}:`, affirmant.full_name || '(unnamed)');

  // Fill header section (applicant info - pre-filled)
  const headerMap = formCMap.header || {};
  applyField(form, headerMap.applicant_name, data.applicant_name);
  applyField(form, headerMap.bole_id, data.bole_id);

  // Set the department radio button
  const deptSelection = formCMap.department_selection;
  if (deptSelection && deptSelection.options) {
    const deptOption = deptSelection.options[data.department];
    if (deptOption) {
      setRadio(form, deptSelection.field, deptOption);
    }
  }

  // Fill affirmant info section (fields 3-17)
  const affirmantMap = formCMap.affirmant_info || {};
  applyField(form, affirmantMap.full_name, affirmant.full_name);
  applyField(form, affirmantMap.home_street, affirmant.home_street);
  applyField(form, affirmantMap.home_city, affirmant.home_city);
  applyField(form, affirmantMap.home_state, affirmant.home_state);
  applyField(form, affirmantMap.home_zip, affirmant.home_zip);
  applyField(form, affirmantMap.home_country, affirmant.home_country);
  applyField(form, affirmantMap.home_phone, affirmant.home_phone);
  applyField(form, affirmantMap.home_email, affirmant.home_email);
  applyField(form, affirmantMap.business_street, affirmant.business_street);
  applyField(form, affirmantMap.business_city, affirmant.business_city);
  applyField(form, affirmantMap.business_state, affirmant.business_state);
  applyField(form, affirmantMap.business_zip, affirmant.business_zip);
  applyField(form, affirmantMap.business_country, affirmant.business_country);
  applyField(form, affirmantMap.business_phone, affirmant.business_phone);
  applyField(form, affirmantMap.business_email, affirmant.business_email);

  // Fill attorney admissions section (fields 18-21) - only if attorney
  if (affirmant.is_attorney === 'Yes') {
    const attorneyMap = formCMap.attorney_admissions || {};
    applyField(form, attorneyMap.jurisdiction_1, affirmant.attorney_jurisdiction_1);
    applyField(form, attorneyMap.year_1, affirmant.attorney_year_1);
    applyField(form, attorneyMap.jurisdiction_2, affirmant.attorney_jurisdiction_2);
    applyField(form, attorneyMap.year_2, affirmant.attorney_year_2);
  }

  // Fill character statement section (field 22)
  const charStatementMap = formCMap.character_statement || {};
  applyField(form, charStatementMap.statement, affirmant.character_statement);

  // Signature block - printed name (affirmant's name)
  const sigMap = formCMap.signature_block || {};
  applyField(form, sigMap.printed_name, affirmant.full_name);

  return pdfDoc.save();
}

/**
 * Generate all Good Moral Character Affirmation PDFs (one per affirmant)
 */
export async function generateAllFormC(userData: AnyObject): Promise<{ affirmantName: string; pdf: Uint8Array }[]> {
  const affirmants = userData.character_affirmants || [];
  const results: { affirmantName: string; pdf: Uint8Array }[] = [];

  // We need exactly 2 affirmants
  for (let i = 0; i < Math.min(affirmants.length, 2); i++) {
    const affirmant = affirmants[i];
    if (affirmant?.full_name) {
      const pdf = await generateFormC(userData, i);
      results.push({
        affirmantName: affirmant.full_name,
        pdf,
      });
    }
  }

  return results;
}

// ============================================================================
// FORM D - Employment Affirmation
// ============================================================================

interface EmploymentAffirmant {
  employment_index?: number;
  affirmant_name?: string;
  affirmant_title?: string;
  affirmant_employer?: string;
  affirmant_street?: string;
  affirmant_city?: string;
  affirmant_state?: string;
  affirmant_zip?: string;
  affirmant_country?: string;
  affirmant_phone?: string;
  affirmant_email?: string;
  is_attorney?: string;
  attorney_jurisdiction_1?: string;
  attorney_year_1?: string;
  attorney_jurisdiction_2?: string;
  attorney_year_2?: string;
  employer_name?: string;
  employer_street?: string;
  employer_city?: string;
  employer_state?: string;
  employer_zip?: string;
  employer_country?: string;
  employer_phone?: string;
  nature_of_business?: string;
  applicant_position?: string;
  from_date?: string;
  to_date?: string;
  full_or_part_time?: string;
  hours_per_week?: string;
  how_ended?: string;
  reason_for_ending?: string;
  work_performed?: string;
  supervision_explanation?: string;
  was_satisfactory?: string;
  additional_info?: string;
}

interface FormDData {
  applicant_name: string;
  bole_id: string;
  department: string;
  affirmant: EmploymentAffirmant;
}

/**
 * Extract Form D data from the full user data object for a specific employment affirmant
 */
export function extractFormDData(userData: AnyObject, affirmantIndex: number): FormDData {
  const personalInfo = userData.personal_info || {};
  const header = userData.header || {};
  const affirmants = userData.employment_affirmants || [];
  const affirmant = affirmants[affirmantIndex] || {};

  return {
    applicant_name: buildFullName(personalInfo),
    bole_id: header.bole_id || personalInfo.bole_id || '',
    department: header.department_selection || 'First Department',
    affirmant,
  };
}

/**
 * Generate an Employment Affirmation PDF (Form D) for a specific employment
 */
export async function generateFormD(userData: AnyObject, affirmantIndex: number = 0): Promise<Uint8Array> {
  const mappings = loadAncillaryMappings();
  const formDMap = mappings.form_d_employment;
  
  if (!formDMap) {
    throw new Error('Form D mapping not found in ancillary-maps.json');
  }

  const templatePath = getTemplatePath('D');
  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  // Extract the data for this specific employment affirmant
  const data = extractFormDData(userData, affirmantIndex);
  const affirmant = data.affirmant;
  
  console.log(`[ancillary-pdf] Generating Form D for employment affirmant index ${affirmantIndex}:`, affirmant.affirmant_name || '(unnamed)');

  // Fill header section (applicant info - pre-filled)
  const headerMap = formDMap.header || {};
  applyField(form, headerMap.applicant_name, data.applicant_name);
  applyField(form, headerMap.bole_id, data.bole_id);

  // Set the department radio button
  const deptSelection = formDMap.header?.department_selection;
  if (deptSelection && deptSelection.options) {
    const deptOption = deptSelection.options[data.department];
    if (deptOption) {
      setRadio(form, deptSelection.field, deptOption);
    }
  }

  // Fill affirmant (supervisor) info section
  const affirmantMap = formDMap.affirmant_info || {};
  applyField(form, affirmantMap.full_name, affirmant.affirmant_name);
  applyField(form, affirmantMap.title, affirmant.affirmant_title);
  applyField(form, affirmantMap.employer_name, affirmant.affirmant_employer);
  applyField(form, affirmantMap.street, affirmant.affirmant_street);
  applyField(form, affirmantMap.city, affirmant.affirmant_city);
  applyField(form, affirmantMap.state, affirmant.affirmant_state);
  applyField(form, affirmantMap.zip, affirmant.affirmant_zip);
  applyField(form, affirmantMap.country, affirmant.affirmant_country);
  applyField(form, affirmantMap.phone, affirmant.affirmant_phone);
  applyField(form, affirmantMap.email, affirmant.affirmant_email);

  // Fill attorney status section - only if attorney
  const attorneyMap = formDMap.attorney_status || {};
  if (attorneyMap.is_attorney && attorneyMap.is_attorney.options) {
    const isAttorneyOption = attorneyMap.is_attorney.options[affirmant.is_attorney || 'No'];
    if (isAttorneyOption) {
      setRadio(form, attorneyMap.is_attorney.field, isAttorneyOption);
    }
  }
  
  if (affirmant.is_attorney === 'Yes') {
    applyField(form, attorneyMap.jurisdiction_1, affirmant.attorney_jurisdiction_1);
    applyField(form, attorneyMap.year_1, affirmant.attorney_year_1);
    applyField(form, attorneyMap.jurisdiction_2, affirmant.attorney_jurisdiction_2);
    applyField(form, attorneyMap.year_2, affirmant.attorney_year_2);
  }

  // Fill employment details section
  const employmentMap = formDMap.employment_details || {};
  applyField(form, employmentMap.employer_name, affirmant.employer_name);
  applyField(form, employmentMap.street, affirmant.employer_street);
  applyField(form, employmentMap.city, affirmant.employer_city);
  applyField(form, employmentMap.state, affirmant.employer_state);
  applyField(form, employmentMap.zip, affirmant.employer_zip);
  applyField(form, employmentMap.country, affirmant.employer_country);
  applyField(form, employmentMap.phone, affirmant.employer_phone);
  applyField(form, employmentMap.nature_of_business, affirmant.nature_of_business);
  applyField(form, employmentMap.applicant_position, affirmant.applicant_position);
  applyField(form, employmentMap.from_date, affirmant.from_date);
  applyField(form, employmentMap.to_date, affirmant.to_date);
  applyField(form, employmentMap.full_or_part_time, affirmant.full_or_part_time);
  applyField(form, employmentMap.hours_per_week, affirmant.hours_per_week);
  applyField(form, employmentMap.how_ended, affirmant.how_ended);
  applyField(form, employmentMap.reason_for_ending, affirmant.reason_for_ending);

  // Fill work description section
  const workMap = formDMap.work_description || {};
  applyField(form, workMap.work_performed, affirmant.work_performed);
  applyField(form, workMap.supervision_explanation, affirmant.supervision_explanation);
  applyField(form, workMap.was_satisfactory, affirmant.was_satisfactory);
  applyField(form, workMap.additional_info, affirmant.additional_info);

  // Signature block - printed name (affirmant's name)
  const sigMap = formDMap.signature_block || {};
  applyField(form, sigMap.printed_name, affirmant.affirmant_name);

  return pdfDoc.save();
}

/**
 * Generate all Employment Affirmation PDFs (one per employment)
 */
export async function generateAllFormD(userData: AnyObject): Promise<{ employerName: string; pdf: Uint8Array }[]> {
  const affirmants = userData.employment_affirmants || [];
  const results: { employerName: string; pdf: Uint8Array }[] = [];

  for (let i = 0; i < affirmants.length; i++) {
    const affirmant = affirmants[i];
    if (affirmant?.affirmant_name) {
      const pdf = await generateFormD(userData, i);
      results.push({
        employerName: affirmant.employer_name || `Employment ${i + 1}`,
        pdf,
      });
    }
  }

  return results;
}

// ============================================================================
// FORM H - Skills Competency and Professional Values
// ============================================================================

interface SkillsCompetencyData {
  pathway?: string;
  law_school_name?: string;
  // Pathway 1
  p1_school_official_name?: string;
  p1_school_official_title?: string;
  // Pathway 2
  p2_school_official_name?: string;
  p2_school_official_title?: string;
  // Pathway 4 Section A
  p4_from_date?: string;
  p4_to_date?: string;
  p4_employer_name?: string;
  p4_employer_street?: string;
  p4_employer_city?: string;
  p4_employer_state?: string;
  p4_employer_zip?: string;
  p4_employer_country?: string;
  // Pathway 4 Section B
  p4_attorney_name?: string;
  p4_unsatisfactory_explanation?: string;
  p4_additional_facts?: string;
  p4_attorney_title?: string;
  p4_attorney_employer?: string;
  p4_attorney_jurisdiction?: string;
  p4_attorney_email?: string;
  p4_attorney_phone?: string;
  // Pathway 5
  p5_jurisdiction?: string;
  p5_court_of_admission?: string;
  p5_admission_date?: string;
  p5_practice_duration?: string;
}

interface FormHData {
  applicant_name: string;
  bole_id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  department: string;
  skills: SkillsCompetencyData;
}

/**
 * Extract Form H data from the full user data object
 */
export function extractFormHData(userData: AnyObject): FormHData {
  const personalInfo = userData.personal_info || {};
  const contactInfo = userData.contact_info || {};
  const header = userData.header || {};
  const skills = userData.skills_competency || {};

  return {
    applicant_name: buildFullName(personalInfo),
    bole_id: header.bole_id || personalInfo.bole_id || '',
    street: contactInfo.home_street || '',
    city: contactInfo.home_city || '',
    state: contactInfo.home_state || '',
    zip: contactInfo.home_zip || '',
    country: contactInfo.home_country || 'USA',
    phone: contactInfo.home_phone || '',
    email: contactInfo.home_email || '',
    department: header.department_selection || 'First Department',
    skills,
  };
}

/**
 * Generate a Skills Competency and Professional Values PDF (Form H)
 */
export async function generateFormH(userData: AnyObject): Promise<Uint8Array> {
  const mappings = loadAncillaryMappings();
  const formHMap = mappings.form_h_skills;
  
  if (!formHMap) {
    throw new Error('Form H mapping not found in ancillary-maps.json');
  }

  const templatePath = getTemplatePath('H');
  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  const data = extractFormHData(userData);
  const skills = data.skills;
  
  console.log(`[ancillary-pdf] Generating Form H for pathway:`, skills.pathway || '(none selected)');

  // Fill header section (applicant info)
  const headerMap = formHMap.header || {};
  applyField(form, headerMap.applicant_name, data.applicant_name);
  applyField(form, headerMap.bole_id, data.bole_id);
  applyField(form, headerMap.street, data.street);
  applyField(form, headerMap.city, data.city);
  applyField(form, headerMap.state, data.state);
  applyField(form, headerMap.zip, data.zip);
  applyField(form, headerMap.country, data.country);
  applyField(form, headerMap.phone, data.phone);
  applyField(form, headerMap.email, data.email);

  // Set the department radio button
  const deptSelection = formHMap.department_selection;
  if (deptSelection && deptSelection.options) {
    const deptOption = deptSelection.options[data.department];
    if (deptOption) {
      setRadio(form, deptSelection.field, deptOption);
    }
  }

  // Set the pathway radio button
  const pathwaySelection = formHMap.pathway_selection;
  if (pathwaySelection && pathwaySelection.options && skills.pathway) {
    const pathwayOption = pathwaySelection.options[skills.pathway];
    if (pathwayOption) {
      setRadio(form, pathwaySelection.field, pathwayOption);
    }
  }

  // Fill pathway-specific fields based on the actual PDF structure
  if (skills.pathway === 'Pathway 1') {
    const p1Map = formHMap.pathway_1 || {};
    // Fields 10-13: Official name, Title, Law school, Applicant name
    applyField(form, p1Map.school_official_name, skills.p1_school_official_name);
    applyField(form, p1Map.school_official_title, skills.p1_school_official_title);
    applyField(form, p1Map.law_school_name, skills.law_school_name);
    applyField(form, p1Map.applicant_name, data.applicant_name);
  }

  if (skills.pathway === 'Pathway 2') {
    const p2Map = formHMap.pathway_2 || {};
    // Fields 14-17: Official name, Title, Law school, Applicant name
    applyField(form, p2Map.school_official_name, skills.p2_school_official_name);
    applyField(form, p2Map.school_official_title, skills.p2_school_official_title);
    applyField(form, p2Map.law_school_name, skills.law_school_name);
    applyField(form, p2Map.applicant_name, data.applicant_name);
  }

  if (skills.pathway === 'Pathway 3') {
    const p3Map = formHMap.pathway_3 || {};
    // Field 18: Applicant name
    applyField(form, p3Map.applicant_name, data.applicant_name);
  }

  // Notary section (fields 19-22) - always fill with applicant info for notarization
  const notaryMap = formHMap.notary_section || {};
  applyField(form, notaryMap.applicant_name, data.applicant_name);

  if (skills.pathway === 'Pathway 4') {
    // Section A - Applicant Certification (fields 23-31)
    const p4aMap = formHMap.pathway_4_section_a || {};
    applyField(form, p4aMap.applicant_name, data.applicant_name);
    applyField(form, p4aMap.apprenticeship_from, skills.p4_from_date);
    applyField(form, p4aMap.apprenticeship_to, skills.p4_to_date);
    applyField(form, p4aMap.employer_name, skills.p4_employer_name);
    applyField(form, p4aMap.employer_street, skills.p4_employer_street);
    applyField(form, p4aMap.employer_city, skills.p4_employer_city);
    applyField(form, p4aMap.employer_state, skills.p4_employer_state);
    applyField(form, p4aMap.employer_zip, skills.p4_employer_zip);
    applyField(form, p4aMap.employer_country, skills.p4_employer_country);

    // Section B - Supervising Attorney Certification (fields 32-42)
    const p4bMap = formHMap.pathway_4_section_b || {};
    applyField(form, p4bMap.attorney_name, skills.p4_attorney_name);
    applyField(form, p4bMap.applicant_name, data.applicant_name);
    applyField(form, p4bMap.unsatisfactory_explanation, skills.p4_unsatisfactory_explanation);
    applyField(form, p4bMap.additional_facts, skills.p4_additional_facts);
    applyField(form, p4bMap.attorney_printed_name, skills.p4_attorney_name);
    applyField(form, p4bMap.attorney_title, skills.p4_attorney_title);
    applyField(form, p4bMap.attorney_employer, skills.p4_attorney_employer);
    applyField(form, p4bMap.attorney_jurisdiction, skills.p4_attorney_jurisdiction);
    applyField(form, p4bMap.attorney_email, skills.p4_attorney_email);
    applyField(form, p4bMap.attorney_phone, skills.p4_attorney_phone);
  }

  if (skills.pathway === 'Pathway 5') {
    const p5Map = formHMap.pathway_5 || {};
    // Fields 43-47
    applyField(form, p5Map.jurisdiction_admitted, skills.p5_jurisdiction);
    applyField(form, p5Map.court_of_admission, skills.p5_court_of_admission);
    applyField(form, p5Map.admission_date, skills.p5_admission_date);
    applyField(form, p5Map.practice_duration, skills.p5_practice_duration);
    applyField(form, p5Map.applicant_name, data.applicant_name);
  }

  return pdfDoc.save();
}

