# Project: Bar Admission SaaS (New York)
**Objective:** Build a B2B SaaS for law firms to automate the NY State Bar Admission application process for new associates.

## 1. Core Workflow
The application acts as a logic router and form-filler. It takes a single user profile and populates disparate PDF forms required by the 4 different Appellate Divisions (AD) of NY.

### The "Golden Rule" (Department Logic)
The app must automatically route users to one of 4 buckets based on residence/employment.
- **AD1 (Manhattan/Bronx):** Strict portal upload, Pre-filing Orientation.
- **AD2 (Brooklyn/Queens/Long Island):** Email submission, Post-filing Orientation allowed, Requires OCA Receipt, strict "Moral Character" signer rules.
- **AD3 (Upstate/Non-Resident):** Default for non-residents. Single merged PDF via email.
- **AD4 (Western NY):** Physical mail only. Hard postmark deadlines.

## 2. Technical Stack
- **Frontend:** React / Next.js
- **Backend:** Node.js (TypeScript)
- **Database:** PostgreSQL
- **File Storage:** AWS S3 (for generated/signed PDFs)
- **PDF Manipulation:** `pdf-lib` or similar

## 3. Database Schema Strategy
We use a Hybrid SQL/JSON approach.
- **Structured (SQL):** User ID, Email, Department, Employment History (dates), Affirmation Status.
- **Unstructured (JSONB):** The "Draft" answers for the massive Questionnaire (Groups 1-13).

### Key Tables
**1. `users`**
- `id` (UUID)
- `email` (String)
- `bole_id` (String)
- `department` (Enum: AD1, AD2, AD3, AD4)
- `residence_zip` (String)

**2. `employment_history`**
- `id` (UUID)
- `user_id` (FK)
- `employer_name` (String)
- `start_date` (Date)
- `end_date` (Date)
- `is_law_related` (Boolean) -> *Trigger: If TRUE, create row in `affirmations_tracker`*

**3. `affirmations_tracker` (The Workflow Engine)**
- `id` (UUID)
- `user_id` (FK)
- `type` (Enum: MORAL_CHARACTER, EMPLOYMENT, PRO_BONO)
- `signer_email` (String)
- `status` (Enum: PENDING, SENT, SIGNED, REJECTED)
- `s3_key` (String)

## 4. Automation Logic (Pseudo-Code)

### Department Router
```javascript
if (user.residesInNY || user.worksInNY) {
  return mapCountyToDept(user.county);
} else {
  return "AD3"; // Default for non-residents
}