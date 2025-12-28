import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    // Get patient details
    const patient = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        surgeryType: true,
        surgeryDate: true,
        riskScore: true,
        phone: true,
        createdAt: true,
      }
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Get daily tracking entries
    const dailyEntries = await prisma.dailyTracking.findMany({
      where: { patientId: id },
      orderBy: { createdAt: 'desc' },
      take: 30 // Last 30 days
    });

    // Get medication logs
    const medicationLogs = await prisma.medicationLog.findMany({
      where: { patientId: id },
      orderBy: { createdAt: 'desc' },
      take: 100 // Last 100 logs
    });

    // Get chat sessions
    const chatSessions = await prisma.session.findMany({
      where: { patientId: id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Get voice check-ins (from sessions with transcription)
    const voiceCheckIns = chatSessions.filter((s: any) => s.transcription);

    // Group data by date
    const historyByDate = new Map();

    // Process daily tracking
    dailyEntries.forEach((entry: any) => {
      const dateKey = new Date(entry.createdAt).toDateString();
      if (!historyByDate.has(dateKey)) {
        historyByDate.set(dateKey, {
          date: dateKey,
          timestamp: entry.createdAt,
          dailyTracking: [],
          medicationLogs: [],
          chatSessions: [],
          voiceCheckIns: []
        });
      }
      historyByDate.get(dateKey).dailyTracking.push(entry);
    });

    // Process medication logs
    medicationLogs.forEach((log: any) => {
      const dateKey = new Date(log.date).toDateString();
      if (!historyByDate.has(dateKey)) {
        historyByDate.set(dateKey, {
          date: dateKey,
          timestamp: log.createdAt,
          dailyTracking: [],
          medicationLogs: [],
          chatSessions: [],
          voiceCheckIns: []
        });
      }
      historyByDate.get(dateKey).medicationLogs.push(log);
    });

    // Process chat sessions
    chatSessions.forEach((session: any) => {
      const dateKey = new Date(session.createdAt).toDateString();
      if (!historyByDate.has(dateKey)) {
        historyByDate.set(dateKey, {
          date: dateKey,
          timestamp: session.createdAt,
          dailyTracking: [],
          medicationLogs: [],
          chatSessions: [],
          voiceCheckIns: []
        });
      }
      
      if (session.transcription) {
        historyByDate.get(dateKey).voiceCheckIns.push(session);
      } else {
        historyByDate.get(dateKey).chatSessions.push(session);
      }
    });

    // Convert to array and sort by date
    const history = Array.from(historyByDate.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Calculate statistics
    const stats = {
      totalCheckIns: chatSessions.length,
      voiceCheckIns: voiceCheckIns.length,
      dailyEntries: dailyEntries.length,
      medicationLogs: medicationLogs.length,
      medicationAdherence: medicationLogs.length > 0
        ? Math.round((medicationLogs.filter((l: any) => l.status === 'taken').length / medicationLogs.length) * 100)
        : null,
      avgPainScore: dailyEntries.length > 0
        ? (dailyEntries.reduce((sum: number, e: any) => sum + e.painScore, 0) / dailyEntries.length).toFixed(1)
        : null,
      avgMobilityScore: dailyEntries.length > 0
        ? (dailyEntries.reduce((sum: number, e: any) => sum + e.mobilityScore, 0) / dailyEntries.length).toFixed(1)
        : null,
      latestPainScore: dailyEntries[0]?.painScore || null,
      latestMobilityScore: dailyEntries[0]?.mobilityScore || null,
      daysSinceSurgery: patient.surgeryDate
        ? Math.floor((new Date().getTime() - new Date(patient.surgeryDate).getTime()) / (1000 * 60 * 60 * 24))
        : null
    };

    return NextResponse.json({
      patient,
      history,
      stats
    });
  } catch (error) {
    console.error("Error fetching patient history:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient history" },
      { status: 500 }
    );
  }
}
