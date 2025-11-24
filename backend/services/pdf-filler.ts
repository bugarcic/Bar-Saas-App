import fs from 'fs';
import path from 'path';
import { PDFCheckBox, PDFDocument, PDFRadioGroup } from 'pdf-lib';

type AnyObject = Record<string, any>;
type MappingNode = string | MappingDescriptor | MappingNode[];

interface MappingDescriptor {
  field?: string;
  type?: 'radio' | 'checkbox' | 'text';
  [key: string]: MappingNode | string | undefined;
}

const mappingPath = path.resolve(__dirname, '../mappings/questionnaire-map.json');
const templatePath = path.resolve(__dirname, '../templates/B-Bar_Admissions-Questionaire.pdf');

/**
 * Generates a filled questionnaire PDF buffer using the provided user data.
 * The data object is expected to mirror the structure of questionnaire-map.json.
 */
export async function generateQuestionnairePdf(userData: AnyObject): Promise<Uint8Array> {
  const mapping: MappingNode = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  const templateBytes = fs.readFileSync(templatePath);

  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  fillFromMapping(form, mapping, userData);

  return pdfDoc.save();
}

function fillFromMapping(form: ReturnType<PDFDocument['getForm']>, mappingNode: MappingNode, dataNode: any): void {
  if (mappingNode === null || mappingNode === undefined) return;

  if (typeof mappingNode === 'string') {
    if (dataNode !== undefined && dataNode !== null) {
      setTextField(form, mappingNode, dataNode);
    }
    return;
  }

  if (Array.isArray(mappingNode)) {
    if (!Array.isArray(dataNode)) return;
    mappingNode.forEach((childNode, index) => {
      fillFromMapping(form, childNode, dataNode[index]);
    });
    return;
  }

  if (typeof mappingNode === 'object' && mappingNode.field) {
    applyFieldValue(form, mappingNode as MappingDescriptor, dataNode);
    return;
  }

  if (typeof mappingNode === 'object') {
    Object.entries(mappingNode).forEach(([key, childNode]) => {
      fillFromMapping(form, childNode as MappingNode, dataNode ? dataNode[key] : undefined);
    });
  }
}

function applyFieldValue(
  form: ReturnType<PDFDocument['getForm']>,
  descriptor: MappingDescriptor,
  value: any,
): void {
  if (value === undefined || value === null) return;
  const fieldName = descriptor.field;
  if (!fieldName) return;

  const fieldType = descriptor.type ?? 'text';

  try {
    if (fieldType === 'radio') {
      const radioValue = booleanToYesNo(value);
      const radioGroup: PDFRadioGroup = form.getRadioGroup(fieldName);
      radioGroup.select(radioValue);
    } else if (fieldType === 'checkbox') {
      const checkbox: PDFCheckBox = form.getCheckBox(fieldName);
      if (!!value) {
        checkbox.check();
      } else {
        checkbox.uncheck?.();
      }
    } else {
      setTextField(form, fieldName, value);
    }
  } catch (err) {
    console.warn(`[pdf-filler] Unable to set field "${fieldName}": ${(err as Error).message}`);
  }
}

function setTextField(form: ReturnType<PDFDocument['getForm']>, fieldName: string, value: any): void {
  if (value === undefined || value === null) return;
  try {
    const textField = form.getTextField(fieldName);
    textField.setText(formatValue(value));
  } catch (err) {
    console.warn(`[pdf-filler] Unable to set text field "${fieldName}": ${(err as Error).message}`);
  }
}

function booleanToYesNo(input: any): string {
  if (typeof input === 'boolean') {
    return input ? 'Yes' : 'No';
  }
  return String(input);
}

function formatValue(value: any): string {
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  return value;
}

