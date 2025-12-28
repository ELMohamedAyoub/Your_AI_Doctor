import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    console.log("[Doctor Patients API] Starting request...");
    const { userId } = await auth();
    console.log("[Doctor Patients API] User ID:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Doctor Patients API] Fetching patients from database...");
    // Get all patients with their latest data
    const patients = await prisma.user.findMany({
      where: {
        role: "PATIENT"
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        surgeryType: true,
        surgeryDate: true,
        riskScore: true,
        createdAt: true,
        _count: {
          select: {
            sessions: true,
          }
        }
      },
      orderBy: {
        riskScore: 'desc'
      }
    });

    console.log("[Doctor Patients API] Found patients:", patients.length);

    // Calculate days since surgery for each patient
    const patientsWithDetails = patients.map(patient => {
      const daysSinceSurgery = patient.surgeryDate 
        ? Math.floor((new Date().getTime() - new Date(patient.surgeryDate).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      // Handle null firstName/lastName gracefully
      const fullName = [patient.firstName, patient.lastName]
        .filter(Boolean)
        .join(' ') || patient.email.split('@')[0];

      return {
        ...patient,
        daysSinceSurgery,
        fullName
      };
    });

    console.log("[Doctor Patients API] Returning patients:", patientsWithDetails.length);
    return NextResponse.json({ patients: patientsWithDetails });
  } catch (error) {
    console.error("[Doctor Patients API] Error fetching patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}
