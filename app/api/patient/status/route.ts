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

    const patient = await prisma.patient.findUnique({
      where: { clerkUserId: userId },
      include: {
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    const surgeryDate = new Date(patient.surgeryDate);
    const daysSinceSurgery = Math.floor(
      (Date.now() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const response = {
      patient: {
        id: patient.id,
        name: patient.name,
        surgery: patient.surgery,
        surgeryDate: patient.surgeryDate
      },
      lastSession: patient.sessions[0] || null,
      lastAlert: patient.alerts[0] || null,
      daysSinceSurgery
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error fetching patient status:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient status" },
      { status: 500 }
    );
  }
}
