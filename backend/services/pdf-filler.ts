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
      // Handle both simple string values ('Yes'/'No') and legacy object format ({ value: 'Yes' })
      let rawValue = value;
      if (typeof value === 'object' && value !== null && 'value' in value) {
        rawValue = value.value;
      }
      const radioGroup: PDFRadioGroup = form.getRadioGroup(fieldName);
      const options = radioGroup.getOptions();
      
      // Map Yes/No to Choice1/Choice2 which is what the PDF uses
      const radioValue = mapYesNoToChoice(rawValue, options, fieldName);
      
      console.log(`[pdf-filler] Radio "${fieldName}": mapping "${rawValue}" → "${radioValue}", available options: ${options.join(', ')}`);
      if (options.includes(radioValue)) {
        radioGroup.select(radioValue);
      } else {
        console.warn(`[pdf-filler] Option "${radioValue}" not found for radio group "${fieldName}". Options: ${options.join(', ')}`);
      }
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

/**
 * Maps user-friendly values to PDF radio button options.
 * Handles Yes/No → Choice1/Choice2 mapping and other patterns.
 */
function mapYesNoToChoice(input: any, availableOptions: string[], fieldName: string): string {
  const strValue = booleanToYesNo(input);
  const lowerValue = strValue.toLowerCase();
  
  // If the value is already one of the available options, use it directly
  if (availableOptions.includes(strValue)) {
    return strValue;
  }
  
  // Try case-insensitive match first
  const match = availableOptions.find(opt => opt.toLowerCase() === lowerValue);
  if (match) return match;
  
  // Check if options are Choice1/Choice2 or "Choice 1"/"Choice 2" pattern (binary choice)
  const hasChoice1 = availableOptions.some(opt => opt === 'Choice1' || opt === 'Choice 1');
  const hasChoice2 = availableOptions.some(opt => opt === 'Choice2' || opt === 'Choice 2');
  const choice1Option = availableOptions.find(opt => opt === 'Choice1' || opt === 'Choice 1');
  const choice2Option = availableOptions.find(opt => opt === 'Choice2' || opt === 'Choice 2');
  
  if (hasChoice1 && hasChoice2 && choice1Option && choice2Option) {
    // For Yes/No questions: Choice1 = No, Choice2 = Yes
    if (lowerValue === 'yes' || lowerValue === 'true') {
      return choice2Option;
    }
    if (lowerValue === 'no' || lowerValue === 'false') {
      return choice1Option;
    }
    // For Examination/Motion: Choice 1 = Examination, Choice 2 = Motion
    if (lowerValue === 'examination') {
      return choice1Option;
    }
    if (lowerValue === 'motion') {
      return choice2Option;
    }
  }
  
  // For multi-option radio buttons (more than 2 choices), try to match by index
  if (availableOptions.length > 2) {
    // Try matching by common patterns
    const departmentMap: Record<string, number> = {
      'first department': 0,
      'second department': 1,
      'third department': 2,
      'fourth department': 3,
    };
    
    if (departmentMap[lowerValue] !== undefined && availableOptions[departmentMap[lowerValue]]) {
      return availableOptions[departmentMap[lowerValue]];
    }
  }
  
  // Return the original value if no mapping found
  return strValue;
}

function formatValue(value: any): string {
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (typeof value === 'object') {
      return JSON.stringify(value);
  }
  return String(value);
}
