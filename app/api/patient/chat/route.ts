import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { openai } from "@/shared/OpenAiModel";
import { searchGuidelines, getCriticalGuidelines } from "@/lib/medicalGuidelines";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, patientId } = await request.json();

    if (!message || !patientId) {
      return NextResponse.json(
        { error: "Message and patientId are required" },
        { status: 400 }
      );
    }

    // Get patient info including surgery type
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Calculate days since surgery
    const daysSinceSurgery = Math.floor(
      (new Date().getTime() - new Date(patient.surgeryDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Build context from recent sessions
    const recentHistory = patient.sessions.slice(0, 3).map(s => 
      `Pain: ${s.painScore}/10, Symptoms: ${s.symptoms.join(', ')}, Emotion: ${s.emotion}`
    ).join('\n');

    // RAG: Search for relevant medical guidelines
    const relevantGuidelines = searchGuidelines(message, patient.surgery, 2);
    const criticalGuidelines = getCriticalGuidelines(patient.surgery).slice(0, 1);
    
    // Build RAG context with sources
    const guidelinesContext = relevantGuidelines.length > 0
      ? `\n\nRELEVANT MEDICAL GUIDELINES (cite these sources in your response):\n${relevantGuidelines.map(g => 
          `[${g.source || 'Medical Guidelines'}] ${g.title}:\n${g.content}`
        ).join('\n\n')}`
      : '';

    const criticalWarnings = criticalGuidelines.length > 0
      ? `\n\nCRITICAL SAFETY INFORMATION:\n${criticalGuidelines.map(g => `[${g.source || 'Medical Guidelines'}] ${g.content}`).join('\n')}`
      : '';

    // AI Doctor prompt
    const systemPrompt = `You are an AI medical assistant helping patients recover from surgery.

Patient Information:
- Surgery Type: ${patient.surgery}
- Days Since Surgery: ${daysSinceSurgery}
- Recent History:
${recentHistory || 'No previous sessions'}
${guidelinesContext}
${criticalWarnings}

Your role:
1. Provide compassionate, supportive responses based on EVIDENCE from the medical guidelines above
2. Give post-surgical care advice specific to ${patient.surgery}
3. Monitor recovery progress and compare to normal recovery timeline
4. Alert if concerning symptoms (reference the critical safety information)
5. Encourage medication adherence and rest
6. Respond in the same language as the patient (French or English)
7. ALWAYS cite specific guidelines when giving medical advice
8. If patient describes critical symptoms, strongly urge them to contact their surgeon or go to ER

Be warm, empathetic, and professional. Keep responses concise (3-4 sentences).
Base your advice on the medical guidelines provided above.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 400  // Increased for guideline-based responses
    });

    const doctorResponse = response.choices[0]?.message?.content || "I'm here to help. Please tell me more about how you're feeling.";

    // Generate voice audio from response
    let audioUrl = null;
    try {
      const ttsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: doctorResponse })
      });

      if (ttsResponse.ok) {
        const { audioUrl: url } = await ttsResponse.json();
        audioUrl = url;
      }
    } catch (error) {
      console.error("TTS generation failed:", error);
      // Continue without audio
    }

    // Save both patient and doctor messages to database
    await prisma.chatMessage.createMany({
      data: [
        {
          patientId,
          role: 'patient',
          message: message,
          audioUrl: null, // Text message from patient
        },
        {
          patientId,
          role: 'doctor',
          message: doctorResponse,
          audioUrl: audioUrl || null,
        }
      ]
    });

    return NextResponse.json({
      response: doctorResponse,
      audioUrl,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in patient chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
