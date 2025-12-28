import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log("[Chat History API] Starting request");
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    console.log("[Chat History API] Patient ID from params:", patientId);

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    // Convert patientId to Int
    const patientIdInt = parseInt(patientId, 10);
    if (isNaN(patientIdInt)) {
      return NextResponse.json(
        { error: "Invalid patient ID" },
        { status: 400 }
      );
    }

    // Verify patient belongs to this user (using User model)
    const patient = await prisma.user.findUnique({
      where: { id: patientIdInt }
    });

    console.log("[Chat History API] Found patient:", patient?.email);

    if (!patient || patient.clerkUserId !== userId) {
      console.log("[Chat History API] Patient not found or unauthorized");
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Fetch all chat messages for this patient, ordered by creation time
    const messages = await prisma.chatMessage.findMany({
      where: { patientId: patientIdInt },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        role: true,
        message: true,
        audioUrl: true,
        createdAt: true
      }
    });

    console.log("[Chat History API] Found messages:", messages.length);

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
