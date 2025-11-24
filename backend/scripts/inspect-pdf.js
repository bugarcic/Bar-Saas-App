const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const inspectPdf = async () => {
  // 1. Parse command line arguments to get filename
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/inspect-pdf.js <filename>');
    console.error('Example: node scripts/inspect-pdf.js "B-Bar_Admissions-Questionaire.pdf"');
    process.exit(1);
  }

  const filename = args[0];
  // Assuming templates are stored in backend/templates
  const templatesDir = path.join(__dirname, '../templates');
  const filePath = path.join(templatesDir, filename);

  // 2. Verify file exists
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found at ${filePath}`);
    process.exit(1);
  }

  try {
    // 3. Load PDF
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // 4. Get Form Fields
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    console.log(`--- Inspetcing PDF: ${filename} ---`);
    console.log(`Total Fields Found: ${fields.length}`);
    console.log('-----------------------------------');

    fields.forEach((field) => {
      const name = field.getName();
      const type = field.constructor.name;
      console.log(`Field Name: ${name}`);
      console.log(`Type:       ${type}`);
      
      // Optional: Print possible values for Dropdowns/RadioGroups if needed in future
      // if (type === 'PDFDropdown') { ... }

      console.log('-');
    });

    console.log('-----------------------------------');
    console.log('✅ Inspection complete.');

  } catch (err) {
    console.error('❌ Error inspecting PDF:', err);
    process.exit(1);
  }
};

inspectPdf();

