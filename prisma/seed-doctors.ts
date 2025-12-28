/**
 * Doctor Account Seed Script
 * 
 * This script creates doctor accounts in the database.
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. First, create doctor accounts in Clerk:
 *    - Go to https://dashboard.clerk.com
 *    - Navigate to your application
 *    - Go to "Users" section
 *    - Create 5 new users with these emails:
 *      * dr.sarah@hospital.com
 *      * dr.michael@hospital.com
 *      * dr.emily@hospital.com
 *      * dr.james@hospital.com
 *      * dr.aisha@hospital.com
 *    - Set passwords for each (e.g., "Doctor123!")
 *    - Copy their Clerk User IDs (starts with "user_")
 * 
 * 2. Update the CLERK_USER_IDS object below with the real IDs
 * 
 * 3. Run this script: npx tsx prisma/seed-doctors.ts
 * 
 * QUICK START (Using your own Clerk account):
 * - If you want to use your own Clerk account as a doctor,
 *   just update ONE of the clerkUserId values below with your
 *   Clerk user ID (find it in Clerk dashboard under your profile)
 */

import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

// WARNING: REPLACE THESE WITH REAL CLERK USER IDS FROM YOUR CLERK DASHBOARD
const CLERK_USER_IDS = {
  doctor1: 'REPLACE_WITH_CLERK_USER_ID_1', // Dr. Sarah Johnson
  doctor2: 'REPLACE_WITH_CLERK_USER_ID_2', // Dr. Michael Chen
  doctor3: 'REPLACE_WITH_CLERK_USER_ID_3', // Dr. Emily Rodriguez
  doctor4: 'REPLACE_WITH_CLERK_USER_ID_4', // Dr. James Williams
  doctor5: 'REPLACE_WITH_CLERK_USER_ID_5', // Dr. Aisha Rahman
};

const doctors = [
  {
    clerkUserId: CLERK_USER_IDS.doctor1,
    name: 'Dr. Sarah Johnson',
    specialization: 'General Surgery'
  },
  {
    clerkUserId: CLERK_USER_IDS.doctor2,
    name: 'Dr. Michael Chen',
    specialization: 'Orthopedic Surgery'
  },
  {
    clerkUserId: CLERK_USER_IDS.doctor3,
    name: 'Dr. Emily Rodriguez',
    specialization: 'Obstetrics & Gynecology'
  },
  {
    clerkUserId: CLERK_USER_IDS.doctor4,
    name: 'Dr. James Williams',
    specialization: 'Cardiothoracic Surgery'
  },
  {
    clerkUserId: CLERK_USER_IDS.doctor5,
    name: 'Dr. Aisha Rahman',
    specialization: 'General Practice'
  }
];

async function main() {
  console.log('Seeding doctor accounts...\n');

  // Check if Clerk IDs have been updated
  if (CLERK_USER_IDS.doctor1.startsWith('REPLACE_')) {
    console.log('WARNING: You need to update the Clerk User IDs first!');
    console.log('See instructions at the top of this file\n');
    console.log('Quick option: Use your own Clerk user ID from the dashboard');
    console.log('Just replace doctor1 clerkUserId with yours and run again.\n');
    return;
  }

  let successCount = 0;
  let skipCount = 0;

  for (const doctor of doctors) {
    try {
      // Check if doctor already exists
      const existingDoctor = await prisma.doctor.findUnique({
        where: { clerkUserId: doctor.clerkUserId }
      });

      if (existingDoctor) {
        console.log(`Skipped: ${doctor.name} (already exists)`);
        skipCount++;
        continue;
      }

      // Create the doctor
      const created = await prisma.doctor.create({
        data: doctor
      });

      console.log(`Created: ${created.name}`);
      console.log(`   Specialization: ${created.specialization}`);
      console.log(`   Clerk ID: ${created.clerkUserId}`);
      console.log(`   Database ID: ${created.id}\n`);
      successCount++;
    } catch (error: any) {
      console.error(`Error creating ${doctor.name}:`, error.message);
    }
  }

  console.log(`\nSummary:`);
  console.log(`   Created: ${successCount}`);
  console.log(`   Skipped: ${skipCount}`);
  console.log(`   Total: ${doctors.length}\n`);

  if (successCount > 0) {
    console.log('Doctors can now login using their Clerk credentials!\n');
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
