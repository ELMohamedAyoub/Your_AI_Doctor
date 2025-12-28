import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed doctors...');

  // Create 5 doctor accounts with Clerk test emails (auto-verified)
  const doctors = [
    {
      email: "dr.smith+clerk_test@hospital.com",
      name: "Dr. Sarah Smith",
      firstName: "Sarah",
      lastName: "Smith",
      role: "DOCTOR",
      credit: 100,
      phone: "+1-555-0101",
    },
    {
      email: "dr.johnson+clerk_test@hospital.com",
      name: "Dr. Michael Johnson",
      firstName: "Michael",
      lastName: "Johnson",
      role: "DOCTOR",
      credit: 100,
      phone: "+1-555-0102",
    },
    {
      email: "dr.williams+clerk_test@hospital.com",
      name: "Dr. Emily Williams",
      firstName: "Emily",
      lastName: "Williams",
      role: "DOCTOR",
      credit: 100,
      phone: "+1-555-0103",
    },
    {
      email: "dr.brown+clerk_test@hospital.com",
      name: "Dr. David Brown",
      firstName: "David",
      lastName: "Brown",
      role: "DOCTOR",
      credit: 100,
      phone: "+1-555-0104",
    },
    {
      email: "dr.davis+clerk_test@hospital.com",
      name: "Dr. Jennifer Davis",
      firstName: "Jennifer",
      lastName: "Davis",
      role: "DOCTOR",
      credit: 100,
      phone: "+1-555-0105",
    },
  ];

  for (const doctor of doctors) {
    const existing = await prisma.user.findUnique({
      where: { email: doctor.email },
    });

    if (existing) {
      console.log(`Doctor already exists: ${doctor.email}`);
      // Update role to DOCTOR if it's not already
      if (existing.role !== 'DOCTOR') {
        await prisma.user.update({
          where: { email: doctor.email },
          data: { role: 'DOCTOR' },
        });
        console.log(`Updated ${doctor.email} role to DOCTOR`);
      }
    } else {
      await prisma.user.create({
        data: doctor,
      });
      console.log(`Created doctor: ${doctor.email}`);
    }
  }

  // Also create some sample patients for testing
  const patients = [
    {
      email: "patient1@example.com",
      name: "John Anderson",
      firstName: "John",
      lastName: "Anderson",
      role: "PATIENT",
      credit: 10,
      surgeryType: "Knee Replacement",
      surgeryDate: new Date("2024-12-15"),
      riskScore: 7,
      phone: "+1-555-1001",
    },
    {
      email: "patient2@example.com",
      name: "Maria Garcia",
      firstName: "Maria",
      lastName: "Garcia",
      role: "PATIENT",
      credit: 10,
      surgeryType: "Appendectomy",
      surgeryDate: new Date("2024-12-20"),
      riskScore: 4,
      phone: "+1-555-1002",
    },
    {
      email: "patient3@example.com",
      name: "Robert Lee",
      firstName: "Robert",
      lastName: "Lee",
      role: "PATIENT",
      credit: 10,
      surgeryType: "Cesarean Section",
      surgeryDate: new Date("2024-12-10"),
      riskScore: 8,
      phone: "+1-555-1003",
    },
  ];

  for (const patient of patients) {
    const existing = await prisma.user.findUnique({
      where: { email: patient.email },
    });

    if (existing) {
      console.log(`Patient already exists: ${patient.email}`);
    } else {
      await prisma.user.create({
        data: patient,
      });
      console.log(`Created patient: ${patient.email}`);
    }
  }

  console.log('\nSeeding complete!');
  console.log('\n=== DOCTOR LOGIN CREDENTIALS ===');
  console.log('\nYou can use these emails to create Clerk accounts:');
  console.log('\n1. dr.smith@hospital.com - Dr. Sarah Smith (Orthopedic Surgeon)');
  console.log('2. dr.johnson@hospital.com - Dr. Michael Johnson (General Surgeon)');
  console.log('3. dr.williams@hospital.com - Dr. Emily Williams (OB/GYN)');
  console.log('4. dr.brown@hospital.com - Dr. David Brown (Cardiothoracic Surgeon)');
  console.log('5. dr.davis@hospital.com - Dr. Jennifer Davis (Emergency Medicine)');
  console.log('\n=== SAMPLE PATIENTS ===');
  console.log('\n1. patient1@example.com - John Anderson (Knee Replacement, Day 13, High Risk)');
  console.log('2. patient2@example.com - Maria Garcia (Appendectomy, Day 8, Medium Risk)');
  console.log('3. patient3@example.com - Robert Lee (Cesarean Section, Day 18, High Risk)');
  console.log('\nPassword: You can set any password when creating these accounts in Clerk');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
