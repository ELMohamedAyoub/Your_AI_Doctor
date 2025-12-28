import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all patients with their latest session and alert
    const patients = await prisma.patient.findMany({
      include: {
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Transform data for frontend
    const patientList = patients.map(patient => {
      const lastSession = patient.sessions[0];
      const lastAlert = patient.alerts[0];
      
      const surgeryDate = new Date(patient.surgeryDate);
      const daysSinceSurgery = Math.floor(
        (Date.now() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: patient.id,
        name: patient.name,
        surgery: patient.surgery,
        surgeryDate: patient.surgeryDate,
        lastPainScore: lastSession?.painScore ?? null,
        lastSymptoms: lastSession?.symptoms ?? [],
        alertLevel: lastAlert?.level ?? "NORMAL",
        daysSinceSurgery
      };
    });

    return NextResponse.json({ patients: patientList });

  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}
