-- Lightweight seed data for local development / demo video recording.
-- Password for both seed users is 'password123' (bcrypt hash below).
-- Real seeding logic with proper hashing lives in db/seed.js - this file
-- exists only as a migration-tracked placeholder so `npm run migrate` alone
-- leaves a usable dev database; run `npm run seed` for realistic fixtures.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users LIMIT 1) THEN
    RAISE NOTICE 'No users found - run "npm run seed" to populate demo data.';
  END IF;
END $$;
