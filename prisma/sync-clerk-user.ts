import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log('Syncing Clerk user to database...\n');

  // Update kurokirito23@gmail.com with Clerk ID
  const clerkUserId = "user_37UG4rdEjZ2W2NhVIlJEHuvIXdw"; // From the logs
  const email = "kurokirito23@gmail.com";
  
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        clerkUserId,
        firstName: "Ahmed",
        lastName: "Amin",
        role: "PATIENT"
      },
      create: {
        clerkUserId,
        email,
        name: "Ahmed Amin",
        firstName: "Ahmed",
        lastName: "Amin",
        credit: 100,
        role: "PATIENT",
        riskScore: 5
      }
    });
    
    console.log(`✅ Synced user: ${user.email}`);
    console.log(`   Clerk ID: ${user.clerkUserId}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Role: ${user.role}`);
  } catch (error) {
    console.error('❌ Error:', error);
  }

  // List all users
  console.log('\n📋 All users in database:');
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      clerkUserId: true,
      firstName: true,
      lastName: true,
      role: true,
      surgeryType: true
    }
  });

  allUsers.forEach(user => {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'N/A';
    console.log(`   ${user.id}. ${user.email} | ${fullName} | ${user.role} | Surgery: ${user.surgeryType || 'N/A'}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
