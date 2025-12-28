import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const patientId = params.id;

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        sessions: {
          orderBy: { createdAt: 'desc' }
        },
        alerts: {
          orderBy: { createdAt: 'desc' }
        },
        chatMessages: {
          orderBy: { createdAt: 'asc' }
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
    console.error("Error fetching patient detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient data" },
      { status: 500 }
    );
  }
}
