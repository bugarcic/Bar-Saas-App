const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the root .env file
// We are in backend/scripts, so root is ../../
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL is not defined in .env');
  process.exit(1);
}

const initDb = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for some Supabase/cloud connections
    },
  });

  try {
    console.log('Connecting to database...');
    await client.connect();

    const schemaPath = path.resolve(__dirname, '../db/schema.sql');
    console.log(`Reading schema from ${schemaPath}...`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    await client.query(schemaSql);

    console.log('✅ Database initialized successfully!');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
};

initDb();

