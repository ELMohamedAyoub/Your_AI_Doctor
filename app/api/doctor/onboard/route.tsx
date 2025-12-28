import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, phone, specialization, licenseNumber, role } = body;

    if (!firstName || !lastName || !specialization) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user's email from Clerk
    const { emailAddresses } = await fetch(
      `https://api.clerk.com/v1/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      }
    ).then((res) => res.json());

    const email = emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    // Update or create user with doctor role
    const doctor = await prisma.user.upsert({
      where: { email },
      update: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        phone,
        role: "DOCTOR",
      },
      create: {
        email,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        phone,
        role: "DOCTOR",
        credit: 100,
      },
    });

    return NextResponse.json({ 
      success: true, 
      doctor,
      message: "Doctor profile created successfully" 
    });
  } catch (error) {
    console.error("Doctor onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to create doctor profile" },
      { status: 500 }
    );
  }
}
