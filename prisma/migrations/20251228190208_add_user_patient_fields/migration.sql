-- DropForeignKey
ALTER TABLE "DailyTracking" DROP CONSTRAINT "DailyTracking_patientId_fkey";

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "emotion" TEXT,
ADD COLUMN     "mobility" TEXT,
ADD COLUMN     "painScore" INTEGER,
ADD COLUMN     "patientId" INTEGER,
ADD COLUMN     "redFlags" TEXT[],
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "transcription" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "riskScore" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'PATIENT',
ADD COLUMN     "surgeryDate" TIMESTAMP(3),
ADD COLUMN     "surgeryType" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Session_patientId_createdAt_idx" ON "Session"("patientId", "createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
