const { PDFDocument, PDFTextField, PDFRadioGroup, PDFCheckBox } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '../templates');
const debugDir = path.join(__dirname, '../debug-output');

const ANCILLARY_TEMPLATES = [
  { input: 'C-Bar_Admissions-Good Moral Character.pdf', output: 'visual-map-C.pdf' },
  { input: 'D-Bar_Admissions-Employment.pdf', output: 'visual-map-D.pdf' },
  { input: 'E-Bar_Admissions-Law School Certificate.pdf', output: 'visual-map-E.pdf' },
  { input: 'F-Bar_Admissions-Pro Bono Requirements.pdf', output: 'visual-map-F.pdf' },
  { input: 'G-Bar_Admissions-Pro Bono Scholars Program.pdf', output: 'visual-map-G.pdf' },
  { input: 'H-Bar_Admissions-Skills and Values.pdf', output: 'visual-map-H.pdf' },
];

async function generateVisualMap(inputFilename, outputFilename) {
  const inputPath = path.join(templatesDir, inputFilename);
  const outputPath = path.join(debugDir, outputFilename);

  if (!fs.existsSync(debugDir)) {
    fs.mkdirSync(debugDir, { recursive: true });
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input file not found at ${inputPath}`);
    return false;
  }

  try {
    console.log(`Loading ${inputFilename}...`);
    const pdfBuffer = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    console.log(`Found ${fields.length} fields. Mapping values...`);

    let textFieldsCount = 0;
    let otherFieldsCount = 0;

    fields.forEach((field) => {
      const name = field.getName();

      if (field instanceof PDFTextField) {
        try {
          field.setText(name);
          textFieldsCount++;
        } catch (err) {
          console.warn(`Could not set text for field "${name}": ${err.message}`);
        }
      } else if (field instanceof PDFRadioGroup || field instanceof PDFCheckBox) {
        console.log(`[Skipping Non-Text Field] ${name} (${field.constructor.name})`);
        otherFieldsCount++;
      } else {
        console.log(`[Skipping Other Field] ${name} (${field.constructor.name})`);
        otherFieldsCount++;
      }
    });

    console.log(`Mapped ${textFieldsCount} TextFields.`);
    console.log(`Skipped ${otherFieldsCount} other fields (Radio/Checkbox/Sig).`);

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    console.log(`✅ Generated visual map at: ${outputPath}`);
    return true;
  } catch (err) {
    console.error('❌ Error generating visual map:', err);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const runAll = args.includes('--all') || args.includes('-a');
  const customFile = args.find((arg) => !arg.startsWith('-'));

  if (runAll) {
    for (const { input, output } of ANCILLARY_TEMPLATES) {
      // eslint-disable-next-line no-await-in-loop
      await generateVisualMap(input, output);
    }
    return;
  }

  const filename = customFile ?? 'B-Bar_Admissions-Questionaire.pdf';
  const outputName = customFile
    ? `visual-map-${path.basename(customFile, '.pdf')}.pdf`
    : 'visual-map-B.pdf';

  await generateVisualMap(filename, outputName);
}

main();

