-- Step 1: Add a temporary column for the new Int patientId
ALTER TABLE "ChatMessage" ADD COLUMN "patientId_new" INTEGER;

-- Step 2: Try to convert existing string IDs to User IDs
-- This attempts to match old Patient.id (UUID string) to User.clerkUserId or email
-- If there's no match, the row will be deleted
UPDATE "ChatMessage" cm
SET "patientId_new" = u.id
FROM "User" u
INNER JOIN "Patient" p ON p."clerkUserId" = u."clerkUserId"
WHERE cm."patientId" = p.id;

-- Step 3: Delete orphaned chat messages that couldn't be matched
DELETE FROM "ChatMessage" WHERE "patientId_new" IS NULL;

-- Step 4: Drop the old patientId column
ALTER TABLE "ChatMessage" DROP COLUMN "patientId";

-- Step 5: Rename the new column to patientId
ALTER TABLE "ChatMessage" RENAME COLUMN "patientId_new" TO "patientId";

-- Step 6: Make the column NOT NULL
ALTER TABLE "ChatMessage" ALTER COLUMN "patientId" SET NOT NULL;
