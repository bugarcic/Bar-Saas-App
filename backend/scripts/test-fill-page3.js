const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const mapPath = path.join(__dirname, '../mappings/questionnaire-map.json');
const templatePath = path.join(__dirname, '../templates/B-Bar_Admissions-Questionaire.pdf');
const outputPath = path.join(__dirname, '../debug-output/test-filled-page3.pdf');

const fillPage3 = async () => {
  try {
    // 1. Load Mapping and Template
    const mapping = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    const pdfBuffer = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const form = pdfDoc.getForm();

    console.log('Filling Page 3 with sample data...');

    // 2. Helper to safely set text fields
    const setField = (fieldName, value) => {
      try {
        const field = form.getTextField(fieldName);
        field.setText(value);
        console.log(`✅ Set ${fieldName} = "${value}"`);
      } catch (err) {
        console.warn(`⚠️ Could not set field ${fieldName}: ${err.message}`);
      }
    };

    // 3. Fill Denied Admission (Character Issues)
    console.log('\n--- Character Issues (Denied Admission) ---');
    const deniedAdmission = mapping.character_issues.denied_admission;
    
    setField(deniedAdmission.institution, 'State Bar of California');
    setField(deniedAdmission.date, '07/2020');
    setField(deniedAdmission.reason, 'Missing documentation');

    // 4. Fill School Discipline (Optional Test)
    console.log('\n--- Character Issues (School Discipline) ---');
    const schoolDiscipline = mapping.character_issues.school_discipline;
    setField(schoolDiscipline.institution, 'Example University');
    setField(schoolDiscipline.date, '05/2019');
    setField(schoolDiscipline.reason, 'Academic Probation');


    // 5. Save Output
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    console.log(`\n🎉 Filled PDF saved to: ${outputPath}`);

  } catch (err) {
    console.error('❌ Error filling PDF:', err);
    process.exit(1);
  }
};

fillPage3();

