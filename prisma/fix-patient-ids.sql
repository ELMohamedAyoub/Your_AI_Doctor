-- This script fixes the patientId type mismatch
-- DailyTracking and MedicationLog currently have String patientId
-- but need to reference User.id which is Int

-- First, delete any orphaned records that don't match
DELETE FROM "DailyTracking" WHERE "patientId" NOT IN (SELECT CAST(id AS TEXT) FROM "User");
DELETE FROM "MedicationLog" WHERE "patientId" NOT IN (SELECT CAST(id AS TEXT) FROM "User");

-- Create temporary columns
ALTER TABLE "DailyTracking" ADD COLUMN "patientIdInt" INTEGER;
ALTER TABLE "MedicationLog" ADD COLUMN "patientIdInt" INTEGER;

-- Convert the data
UPDATE "DailyTracking" SET "patientIdInt" = CAST("patientId" AS INTEGER);
UPDATE "MedicationLog" SET "patientIdInt" = CAST("patientId" AS INTEGER);

-- Drop old columns
ALTER TABLE "DailyTracking" DROP COLUMN "patientId";
ALTER TABLE "MedicationLog" DROP COLUMN "patientId";

-- Rename new columns
ALTER TABLE "DailyTracking" RENAME COLUMN "patientIdInt" TO "patientId";
ALTER TABLE "MedicationLog" RENAME COLUMN "patientIdInt" TO "patientId";

-- Add NOT NULL constraints
ALTER TABLE "DailyTracking" ALTER COLUMN "patientId" SET NOT NULL;
ALTER TABLE "MedicationLog" ALTER COLUMN "patientId" SET NOT NULL;
