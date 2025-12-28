# Doctor Account Seeding Guide

## Quick Start

To create doctor accounts that you can use to login directly:

### Option 1: Use Your Own Account (Fastest)

1. Login to your Clerk dashboard: https://dashboard.clerk.com
2. Find your Clerk User ID (in your profile or Users section)
3. Open `prisma/seed-doctors.ts`
4. Replace `CLERK_USER_IDS.doctor1` with your actual Clerk ID
5. Run: `npx tsx prisma/seed-doctors.ts`
6. You can now login as "Dr. Sarah Johnson"!

### Option 2: Create New Doctor Accounts

1. Go to https://dashboard.clerk.com
2. Navigate to "Users" → "Create User"
3. Create users with these emails (or your own):
   - dr.sarah@hospital.com
   - dr.michael@hospital.com
   - dr.emily@hospital.com
   - dr.james@hospital.com
   - dr.aisha@hospital.com
4. Set passwords (e.g., "Doctor123!")
5. Copy each user's Clerk ID (starts with "user_...")
6. Update `CLERK_USER_IDS` in `prisma/seed-doctors.ts`
7. Run: `npx tsx prisma/seed-doctors.ts`

## Running the Seed Script

```bash
cd "/home/mohamed/Desktop/DeepLearning project/Ai-docter-agent"
npx tsx prisma/seed-doctors.ts
```

## What Gets Created

5 doctor accounts:
- Dr. Sarah Johnson (General Surgery)
- Dr. Michael Chen (Orthopedic Surgery)
- Dr. Emily Rodriguez (Obstetrics & Gynecology)
- Dr. James Williams (Cardiothoracic Surgery)
- Dr. Aisha Rahman (General Practice)

## After Seeding

Doctors can login using:
- Their email (from Clerk)
- Password (set in Clerk)
- No signup needed - they'll be automatically recognized as doctors!

## Troubleshooting

**Error: "Clerk user ID not found"**
- Make sure you created the users in Clerk first
- Check that the Clerk IDs are correct (copy/paste from dashboard)

**Error: "Doctor already exists"**
- The doctor is already in the database - you're good to go!
- Try logging in with their Clerk credentials

**Script says "Update Clerk IDs first"**
- You forgot to replace the placeholder IDs
- Open the file and update `CLERK_USER_IDS`
