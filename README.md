# Bar Admission SaaS

## Project Structure
- `backend/`: Node.js/Express backend
- `backend/db/`: Database scripts

## Database Setup (Phase 1)

The PostgreSQL schema is located in `backend/db/schema.sql`.

To initialize the database:
1. Ensure PostgreSQL is installed and running.
2. Create a database for the project.
3. Run the schema script:
   ```bash
   psql -d your_database_name -f backend/db/schema.sql
   ```

## Tables
- `users`: Core user data and questionnaire JSON.
- `employment_history`: Employment records.
- `affirmations_tracker`: Tracks document signing workflows.

