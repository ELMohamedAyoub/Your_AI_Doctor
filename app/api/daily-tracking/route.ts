import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// GET: Fetch daily tracking data
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const days = parseInt(searchParams.get("days") || "30");

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID required" }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient || patient.clerkUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const sessions = await prisma.session.findMany({
      where: {
        patientId,
        createdAt: { gte: cutoffDate }
      },
      orderBy: { createdAt: 'asc' },
      select: {
        painScore: true,
        symptoms: true,
        emotion: true,
        createdAt: true
      }
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error fetching tracking data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

// POST: Add daily tracking entry
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { patientId, painScore, mobilityScore, sleepHours, sleepQuality, steps, exerciseMinutes, notes } = await request.json();

    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient || patient.clerkUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const session = await prisma.session.create({
      data: {
        patientId,
        painScore,
        symptoms: notes ? [notes] : [],
        emotion: mobilityScore >= 7 ? "good" : mobilityScore >= 4 ? "okay" : "struggling"
      }
    });

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Error creating tracking entry:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
