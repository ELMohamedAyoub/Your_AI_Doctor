-- CreateTable
CREATE TABLE "DailyTracking" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "painScore" INTEGER NOT NULL,
    "mobilityScore" INTEGER NOT NULL,
    "sleepHours" DOUBLE PRECISION NOT NULL,
    "sleepQuality" INTEGER NOT NULL,
    "steps" INTEGER,
    "exerciseMinutes" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyTracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyTracking_patientId_createdAt_idx" ON "DailyTracking"("patientId", "createdAt");

-- AddForeignKey
ALTER TABLE "DailyTracking" ADD CONSTRAINT "DailyTracking_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
