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
    const patientIdStr = searchParams.get("patientId");
    const days = parseInt(searchParams.get("days") || "30");

    if (!patientIdStr) {
      return NextResponse.json({ error: "Patient ID required" }, { status: 400 });
    }

    const patientId = parseInt(patientIdStr, 10);
    if (isNaN(patientId)) {
      return NextResponse.json({ error: "Invalid Patient ID" }, { status: 400 });
    }

    const patient = await prisma.user.findUnique({ where: { id: patientId } });
    if (!patient || patient.clerkUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const entries = await prisma.dailyTracking.findMany({
      where: {
        patientId,
        createdAt: { gte: cutoffDate }
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        painScore: true,
        mobilityScore: true,
        sleepHours: true,
        sleepQuality: true,
        steps: true,
        exerciseMinutes: true,
        notes: true,
        createdAt: true
      }
    });

    return NextResponse.json({ entries: entries || [] });
  } catch (error) {
    console.error("Error fetching tracking data:", error);
    return NextResponse.json({ entries: [] }, { status: 200 });
  }
}

// POST: Add daily tracking entry
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.error("POST daily-tracking: No userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("POST daily-tracking body:", body);
    
    const { patientId: patientIdInput, painScore, mobilityScore, sleepHours, sleepQuality, steps, exerciseMinutes, notes } = body;

    // Convert patientId to number
    const patientId = typeof patientIdInput === 'string' ? parseInt(patientIdInput, 10) : patientIdInput;

    if (!patientId || isNaN(patientId) || painScore === undefined || mobilityScore === undefined || sleepHours === undefined || sleepQuality === undefined) {
      console.error("POST daily-tracking: Missing required fields", { patientId, painScore, mobilityScore, sleepHours, sleepQuality });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const patient = await prisma.user.findUnique({ where: { id: patientId } });
    if (!patient || patient.clerkUserId !== userId) {
      console.error("POST daily-tracking: Patient not found or unauthorized", { patientId, userId, found: !!patient, clerkMatch: patient?.clerkUserId === userId });
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const entry = await prisma.dailyTracking.create({
      data: {
        patientId,
        painScore,
        mobilityScore,
        sleepHours,
        sleepQuality,
        steps: steps || 0,
        exerciseMinutes: exerciseMinutes || 0,
        notes
      }
    });

    console.log("POST daily-tracking: Created entry", entry.id);
    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Error creating tracking entry:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
