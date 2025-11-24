const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const mapPath = path.join(__dirname, '../mappings/questionnaire-map.json');
const templatePath = path.join(__dirname, '../templates/B-Bar_Admissions-Questionaire.pdf');
const outputPath = path.join(__dirname, '../debug-output/test-filled-page2.pdf');

const fillPage2 = async () => {
  try {
    // 1. Load Mapping and Template
    const mapping = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    const pdfBuffer = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const form = pdfDoc.getForm();

    console.log('Filling Page 2 with sample data...');

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

    // 3. Fill Office Address
    console.log('\n--- Office Address ---');
    setField(mapping.office_address.name_and_street, 'Law Firm LLP, 456 Legal Ave');
    setField(mapping.office_address.city, 'Albany');
    setField(mapping.office_address.state, 'NY');
    setField(mapping.office_address.zip, '12207');
    setField(mapping.office_address.country, 'USA');
    setField(mapping.office_address.phone, '(518) 555-0123');
    setField(mapping.office_address.email, 'office@lawfirm.com');

    // 4. Fill Education (School 2 specifically as requested)
    console.log('\n--- Education (School 2) ---');
    // Note: The mapping for education_undergrad is an array. Index 1 corresponds to the second school slot.
    const school2 = mapping.education_undergrad[1];
    
    setField(school2.from_date, '09/2017');
    setField(school2.to_date, '05/2021');
    setField(school2.school_name, 'University of Buffalo');
    setField(school2.degree, 'B.A. Political Science');
    setField(school2.street, '12 Capen Hall');
    setField(school2.city, 'Buffalo');
    setField(school2.state, 'NY');
    setField(school2.zip, '14260');
    setField(school2.country, 'USA');
    setField(school2.no_degree_reason, 'Transferred');

    // 5. Save Output
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    console.log(`\n🎉 Filled PDF saved to: ${outputPath}`);

  } catch (err) {
    console.error('❌ Error filling PDF:', err);
    process.exit(1);
  }
};

fillPage2();

