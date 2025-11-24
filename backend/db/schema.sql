-- Enable UUID extension for generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enum Types
-- AD1: Manhattan/Bronx
-- AD2: Brooklyn/Queens/Long Island
-- AD3: Upstate/Non-Resident
-- AD4: Western NY
DO $$ BEGIN
    CREATE TYPE department_enum AS ENUM ('AD1', 'AD2', 'AD3', 'AD4');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE affirmation_type_enum AS ENUM ('MORAL_CHARACTER', 'EMPLOYMENT', 'PRO_BONO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE affirmation_status_enum AS ENUM ('PENDING', 'SENT', 'SIGNED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users Table
-- Stores core user profile and unstructured questionnaire draft data
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    bole_id VARCHAR(50) UNIQUE, -- Bar of Law Examiners ID
    department department_enum,
    residence_zip VARCHAR(20),
    questionnaire_data JSONB DEFAULT '{}'::jsonb, -- Unstructured answers for Groups 1-13
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Employment History Table
-- Captures work history which may trigger affirmation requirements
CREATE TABLE IF NOT EXISTS employment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employer_name VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_law_related BOOLEAN DEFAULT FALSE, -- Trigger: If TRUE, create row in affirmations_tracker
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Affirmations Tracker Table
-- The Workflow Engine for managing document signing status
CREATE TABLE IF NOT EXISTS affirmations_tracker (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type affirmation_type_enum NOT NULL,
    signer_email VARCHAR(255),
    status affirmation_status_enum DEFAULT 'PENDING',
    s3_key VARCHAR(1024), -- Path to the stored PDF in S3
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_employment_history_user_id ON employment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_affirmations_tracker_user_id ON affirmations_tracker(user_id);
CREATE INDEX IF NOT EXISTS idx_affirmations_tracker_status ON affirmations_tracker(status);

