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
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    // Verify patient belongs to this user
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient || patient.clerkUserId !== userId) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Fetch all chat messages for this patient, ordered by creation time
    const messages = await prisma.chatMessage.findMany({
      where: { patientId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        role: true,
        message: true,
        audioUrl: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      messages,
      count: messages.length
    });

  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}
