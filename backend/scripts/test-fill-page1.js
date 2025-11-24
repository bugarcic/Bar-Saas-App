const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const mapPath = path.join(__dirname, '../mappings/questionnaire-map.json');
const templatePath = path.join(__dirname, '../templates/B-Bar_Admissions-Questionaire.pdf');
const outputPath = path.join(__dirname, '../debug-output/test-filled-page1.pdf');

const fillPage1 = async () => {
  try {
    // 1. Load Mapping and Template
    const mapping = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    const pdfBuffer = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const form = pdfDoc.getForm();

    console.log('Filling Page 1 with sample data...');

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

    // 3. Helper to safely select radio buttons (simplified for this test)
    // Note: Radio buttons often require knowing the specific "option" values. 
    // For this visual test, we might just try to select the first available option if we don't know specific export values yet.
    // Or we skip them if we don't have the specific option values from inspection.
    // Let's try to set them if possible, or log them.
    const setRadio = (fieldName, option) => {
       try {
           const radio = form.getRadioGroup(fieldName);
           // We need to know the valid options. 
           // For now, we'll just log that we *would* set it.
           // Or try to select the option provided if we knew the export values.
           // Let's try to select the option passed.
           radio.select(option); 
           console.log(`✅ Selected radio ${fieldName} = "${option}"`);
       } catch(err) {
           console.warn(`⚠️ Could not select radio ${fieldName}: ${err.message}`);
       }
    };

    // 4. Fill Data based on Mapping
    
    // Header (Radio buttons - assuming generic option names for now, might fail if options are named differently like 'Choice1')
    // setRadio(mapping.header.admission_type, '1'); 

    // Personal Info
    setField(mapping.personal_info.first_name, 'John');
    setField(mapping.personal_info.middle_name, 'Quincy');
    setField(mapping.personal_info.last_name, 'Doe');
    setField(mapping.personal_info.suffix, 'Jr.');
    
    // Other Names (Radio)
    // setRadio(mapping.personal_info.has_other_names.field, 'Yes');

    // Other Names List
    setField(mapping.personal_info.other_names[0].name, 'Johnny Doe');
    setField(mapping.personal_info.other_names[0].reason, 'Nickname');
    setField(mapping.personal_info.other_names[1].name, 'J. Doe');
    setField(mapping.personal_info.other_names[1].reason, 'Initials');

    // IDs
    setField(mapping.personal_info.ssn, '000-12-3456');
    setField(mapping.personal_info.bole_id, 'BOLE-99999');

    // Birth Info
    setField(mapping.personal_info.age, '25');
    setField(mapping.personal_info.dob, '01/01/1999');
    setField(mapping.personal_info.birth_city, 'New York');
    setField(mapping.personal_info.birth_state, 'NY');
    setField(mapping.personal_info.birth_country, 'USA');

    // Contact Info
    setField(mapping.contact_info.street, '123 Main St, Apt 4B');
    setField(mapping.contact_info.city, 'Brooklyn');
    setField(mapping.contact_info.state, 'NY');
    setField(mapping.contact_info.zip, '11201');
    setField(mapping.contact_info.country, 'USA');
    setField(mapping.contact_info.phone, '(212) 555-0199');
    setField(mapping.contact_info.email, 'john.doe@example.com');

    // 5. Save Output
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    console.log(`\n🎉 Filled PDF saved to: ${outputPath}`);

  } catch (err) {
    console.error('❌ Error filling PDF:', err);
    process.exit(1);
  }
};

fillPage1();

