import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID required" }, { status: 400 });
    }

    // Verify patient belongs to user
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient || patient.clerkUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get the latest alert for this patient with RED or ORANGE level
    const latestAlert = await prisma.alert.findFirst({
      where: {
        patientId,
        level: {
          in: ["RED", "ORANGE", "YELLOW"]
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!latestAlert) {
      return NextResponse.json({ hasRedFlags: false }, { status: 200 });
    }

    // Parse the alert reason to reconstruct red flags
    // The reason format is: "summary. Detected: symptom1, symptom2, ..."
    const parts = latestAlert.reason.split(". Detected: ");
    const summary = parts[0];
    const symptoms = parts[1] ? parts[1].split(", ") : [];

    // Reconstruct red flag result
    const redFlagResult = {
      hasRedFlags: true,
      level: latestAlert.level,
      summary,
      flags: symptoms.map((symptom: string) => ({
        symptom,
        level: latestAlert.level,
        category: "other", // We don't store category, default to "other"
        action: getActionForLevel(latestAlert.level)
      })),
      actions: getActionsForLevel(latestAlert.level),
      createdAt: latestAlert.createdAt
    };

    return NextResponse.json(redFlagResult);
  } catch (error) {
    console.error("Error fetching red flags:", error);
    return NextResponse.json(
      { error: "Failed to fetch red flags" },
      { status: 500 }
    );
  }
}

function getActionForLevel(level: string): string {
  switch (level) {
    case "RED":
      return "Call 911 immediately";
    case "ORANGE":
      return "Contact surgeon within 2 hours";
    case "YELLOW":
      return "Call surgeon's office today";
    default:
      return "Monitor symptoms";
  }
}

function getActionsForLevel(level: string): string[] {
  switch (level) {
    case "RED":
      return [
        "Call 911 immediately",
        "Do not drive yourself to the hospital",
        "Have someone stay with you",
        "Note all symptoms to report to emergency responders"
      ];
    case "ORANGE":
      return [
        "Contact your surgeon's office within 2 hours",
        "Take your temperature if you have a fever",
        "Document all symptoms and when they started",
        "Do not wait if symptoms worsen - call 911"
      ];
    case "YELLOW":
      return [
        "Call your surgeon's office during business hours",
        "Keep monitoring your symptoms",
        "Document symptom progression",
        "Contact surgeon immediately if symptoms worsen"
      ];
    default:
      return ["Continue normal recovery"];
  }
}
