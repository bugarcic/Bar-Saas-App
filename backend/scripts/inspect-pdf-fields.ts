import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

async function inspectPdfFields(pdfPath: string) {
  const templateBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  console.log(`\n=== PDF Fields in: ${path.basename(pdfPath)} ===\n`);
  console.log(`Total fields: ${fields.length}\n`);

  const fieldsByType: Record<string, string[]> = {
    text: [],
    checkbox: [],
    radio: [],
    dropdown: [],
    other: [],
  };

  fields.forEach((field) => {
    const name = field.getName();
    const type = field.constructor.name;

    if (type === 'PDFTextField') {
      fieldsByType.text.push(name);
    } else if (type === 'PDFCheckBox') {
      fieldsByType.checkbox.push(name);
    } else if (type === 'PDFRadioGroup') {
      fieldsByType.radio.push(name);
    } else if (type === 'PDFDropdown') {
      fieldsByType.dropdown.push(name);
    } else {
      fieldsByType.other.push(`${name} (${type})`);
    }
  });

  if (fieldsByType.text.length > 0) {
    console.log('TEXT FIELDS:');
    fieldsByType.text.sort().forEach((name) => console.log(`  "${name}"`));
    console.log();
  }

  if (fieldsByType.checkbox.length > 0) {
    console.log('CHECKBOXES:');
    fieldsByType.checkbox.sort().forEach((name) => console.log(`  "${name}"`));
    console.log();
  }

  if (fieldsByType.radio.length > 0) {
    console.log('RADIO GROUPS:');
    fieldsByType.radio.sort().forEach((name) => console.log(`  "${name}"`));
    console.log();
  }

  if (fieldsByType.dropdown.length > 0) {
    console.log('DROPDOWNS:');
    fieldsByType.dropdown.sort().forEach((name) => console.log(`  "${name}"`));
    console.log();
  }

  if (fieldsByType.other.length > 0) {
    console.log('OTHER:');
    fieldsByType.other.forEach((name) => console.log(`  ${name}`));
    console.log();
  }
}

// Get the PDF path from command line argument or default to Form E
const pdfArg = process.argv[2];
const templatesDir = path.resolve(__dirname, '../templates');

if (pdfArg) {
  const pdfPath = path.resolve(templatesDir, pdfArg);
  if (fs.existsSync(pdfPath)) {
    inspectPdfFields(pdfPath);
  } else {
    console.error(`File not found: ${pdfPath}`);
    process.exit(1);
  }
} else {
  // Inspect all templates
  const templates = fs.readdirSync(templatesDir).filter((f) => f.endsWith('.pdf'));
  templates.forEach((template) => {
    inspectPdfFields(path.join(templatesDir, template));
  });
}

