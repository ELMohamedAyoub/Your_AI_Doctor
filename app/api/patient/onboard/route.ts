import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, surgery, surgeryDate } = await request.json();

    if (!name || !surgery || !surgeryDate) {
      return NextResponse.json(
        { error: "Name, surgery, and surgery date are required" },
        { status: 400 }
      );
    }

    // Check if patient already exists
    const existingPatient = await prisma.patient.findUnique({
      where: { clerkUserId: userId }
    });

    if (existingPatient) {
      return NextResponse.json(
        { error: "Patient profile already exists" },
        { status: 400 }
      );
    }

    // Create new patient
    const patient = await prisma.patient.create({
      data: {
        clerkUserId: userId,
        name,
        surgery,
        surgeryDate: new Date(surgeryDate)
      }
    });

    return NextResponse.json({
      success: true,
      patient: {
        id: patient.id,
        name: patient.name,
        surgery: patient.surgery,
        surgeryDate: patient.surgeryDate
      }
    });

  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json(
      { error: "Failed to create patient profile" },
      { status: 500 }
    );
  }
}

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
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ patient });

  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient data" },
      { status: 500 }
    );
  }
}
