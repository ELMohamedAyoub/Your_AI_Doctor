import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// POST - Log medication taken/skipped
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { patientId: patientIdInput, medicationId, medicationName, dosage, status, scheduledTime } = body;

    // Convert patientId to Int
    const patientId = typeof patientIdInput === 'string' ? parseInt(patientIdInput, 10) : patientIdInput;

    if (!patientId || isNaN(patientId) || !medicationId || !medicationName || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const log = await prisma.medicationLog.create({
      data: {
        patientId,
        medicationId,
        medicationName,
        dosage: dosage || "N/A",
        status, // "taken", "skipped", "missed"
        scheduledTime: scheduledTime || "N/A",
        takenAt: status === "taken" ? new Date() : null,
        date: today,
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error("Error logging medication:", error);
    return NextResponse.json(
      { error: "Failed to log medication" },
      { status: 500 }
    );
  }
}

// GET - Get medication logs for a patient
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patientIdStr = searchParams.get("patientId");
    const days = parseInt(searchParams.get("days") || "7");

    if (!patientIdStr) {
      return NextResponse.json(
        { error: "Patient ID required" },
        { status: 400 }
      );
    }

    const patientId = parseInt(patientIdStr, 10);
    if (isNaN(patientId)) {
      return NextResponse.json(
        { error: "Invalid Patient ID" },
        { status: 400 }
      );
    }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    daysAgo.setHours(0, 0, 0, 0);

    const logs = await prisma.medicationLog.findMany({
      where: {
        patientId,
        date: {
          gte: daysAgo,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get today's logs to know what's already been logged
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getTime() === today.getTime();
    });

    return NextResponse.json({ 
      logs, 
      todayLogs,
      success: true 
    });
  } catch (error) {
    console.error("Error fetching medication logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch medication logs" },
      { status: 500 }
    );
  }
}
