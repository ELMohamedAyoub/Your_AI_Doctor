import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log('Updating user roles...');

  // Update kurokirito23@gmail.com to PATIENT with full name
  const patientEmail = "kurokirito23@gmail.com";
  
  try {
    const patient = await prisma.user.update({
      where: { email: patientEmail },
      data: { 
        role: "PATIENT",
        firstName: "Mohamed",
        lastName: "Khan"
      }
    });
    console.log(`✅ Updated ${patientEmail} to PATIENT role with name: Mohamed Khan`);
  } catch (error) {
    console.log(`ℹ️  User ${patientEmail} not found, skipping...`);
  }

  // Update all doctor emails to DOCTOR role
  const doctorEmails = [
    "dr.smith+clerk_test@hospital.com",
    "dr.johnson+clerk_test@hospital.com",
    "dr.williams+clerk_test@hospital.com",
    "dr.brown+clerk_test@hospital.com",
    "dr.davis+clerk_test@hospital.com"
  ];

  for (const email of doctorEmails) {
    try {
      await prisma.user.update({
        where: { email },
        data: { role: "DOCTOR" }
      });
      console.log(`✅ Updated ${email} to DOCTOR role`);
    } catch (error) {
      console.log(`ℹ️  User ${email} not found, skipping...`);
    }
  }

  // List all users with their roles
  console.log('\n📋 Current users:');
  const allUsers = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      role: true,
      surgeryType: true,
      riskScore: true
    }
  });

  allUsers.forEach(user => {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name;
    console.log(`- ${user.email} | ${user.role} | ${fullName} | Surgery: ${user.surgeryType || 'N/A'} | Risk: ${user.riskScore}`);
  });

  console.log('\n✅ Role update complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
