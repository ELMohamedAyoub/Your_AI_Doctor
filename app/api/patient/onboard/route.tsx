import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    console.log("[Patient Onboard] API called");
    
    const { userId } = await auth();
    console.log("[Patient Onboard] User ID:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, phone, surgeryType, surgeryDate, role } = body;

    console.log("[Patient Onboard] Received data:", { firstName, lastName, phone, surgeryType, surgeryDate, role });

    if (!firstName || !lastName) {
      console.log("[Patient Onboard] Validation failed: missing firstName or lastName");
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    // Get user's email from Clerk
    console.log("[Patient Onboard] Fetching email from Clerk for userId:", userId);
    
    const clerkResponse = await fetch(
      `https://api.clerk.com/v1/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      }
    );

    if (!clerkResponse.ok) {
      console.error("[Patient Onboard] Clerk API error:", clerkResponse.status, await clerkResponse.text());
      return NextResponse.json({ error: "Failed to fetch user data from Clerk" }, { status: 500 });
    }

    const clerkData = await clerkResponse.json();
    console.log("[Patient Onboard] Clerk data received:", JSON.stringify(clerkData, null, 2));
    
    const email = clerkData.email_addresses?.[0]?.email_address;

    if (!email) {
      console.log("[Patient Onboard] Email not found for user:", userId);
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    console.log("[Patient Onboard] User email:", email);

    // Calculate risk score based on surgery type
    const getRiskScore = (surgery?: string): number => {
      if (!surgery) return 5; // Default medium risk
      
      const highRisk = ["Coronary Artery Bypass", "Hip Replacement", "Spinal Fusion"];
      const mediumRisk = ["Knee Replacement", "Hysterectomy", "Cholecystectomy"];
      
      if (highRisk.some(s => surgery.includes(s))) return 7;
      if (mediumRisk.some(s => surgery.includes(s))) return 5;
      return 3;
    };

    // Update or create user with patient role
    const patient = await prisma.user.upsert({
      where: { email },
      update: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        phone: phone || null,
        surgeryType: surgeryType || null,
        surgeryDate: surgeryDate ? new Date(surgeryDate) : null,
        riskScore: getRiskScore(surgeryType),
        role: "PATIENT",
        clerkUserId: userId,
      },
      create: {
        email,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        phone: phone || null,
        surgeryType: surgeryType || null,
        surgeryDate: surgeryDate ? new Date(surgeryDate) : null,
        riskScore: getRiskScore(surgeryType),
        role: "PATIENT",
        credit: 10,
        clerkUserId: userId,
      },
    });

    console.log("[Patient Onboard] Creating patient with data:", {
      email,
      firstName,
      lastName,
      phone: phone || null,
      surgeryType: surgeryType || null,
      surgeryDate: surgeryDate ? new Date(surgeryDate) : null,
    });

    return NextResponse.json({ 
      success: true, 
      patient,
      message: "Patient profile created successfully" 
    });
  } catch (error) {
    console.error("[Patient Onboard] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create patient profile" },
      { status: 500 }
    );
  }
}
