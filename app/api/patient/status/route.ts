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

    const patient = await prisma.user.findFirst({
      where: { 
        clerkUserId: userId,
        role: "PATIENT"
      },
      include: {
        sessions: {
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

    const surgeryDate = patient.surgeryDate ? new Date(patient.surgeryDate) : new Date();
    const daysSinceSurgery = Math.floor(
      (Date.now() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const fullName = [patient.firstName, patient.lastName].filter(Boolean).join(' ') || patient.name;

    // Generate alert from latest session if it has red flags
    let lastAlert = null;
    const latestSession = patient.sessions[0];
    
    if (latestSession) {
      // Check for red flags in the session
      const hasRedFlags = latestSession.redFlags && latestSession.redFlags.length > 0;
      
      if (hasRedFlags) {
        // Determine alert level based on pain score and red flags
        let alertLevel = "YELLOW";
        let alertReason = "Monitor closely";
        
        if (latestSession.painScore && latestSession.painScore >= 9) {
          alertLevel = "RED";
          alertReason = `Critical: Severe pain (${latestSession.painScore}/10) - GO TO ER`;
        } else if (latestSession.painScore && latestSession.painScore >= 7) {
          alertLevel = "ORANGE";
          alertReason = `High pain level (${latestSession.painScore}/10) - Contact surgeon`;
        } else if (latestSession.redFlags.some((flag: string) => flag.toLowerCase().includes('severe') || flag.toLowerCase().includes('critical'))) {
          alertLevel = "RED";
          alertReason = "Critical symptoms detected - Seek immediate care";
        } else if (latestSession.emotion === 'distressed' || latestSession.emotion === 'anxious') {
          alertLevel = "ORANGE";
          alertReason = "Emotional distress with symptoms - Contact surgeon";
        }
        
        lastAlert = {
          level: alertLevel,
          reason: alertReason,
          symptoms: latestSession.redFlags,
          createdAt: latestSession.createdAt
        };
      }
    }

    const response = {
      patient: {
        id: patient.id.toString(), // Convert to string for compatibility
        name: fullName,
        surgery: patient.surgeryType || 'Not specified',
        surgeryDate: patient.surgeryDate?.toISOString() || new Date().toISOString()
      },
      lastSession: patient.sessions[0] || null,
      lastAlert,
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
