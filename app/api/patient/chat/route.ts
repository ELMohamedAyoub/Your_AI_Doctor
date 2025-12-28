import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { openai } from "@/shared/OpenAiModel";
import { searchGuidelines, getCriticalGuidelines } from "@/lib/medicalGuidelines";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log("[Patient Chat API] Starting request");
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, patientId, language = "en" } = await request.json();
    console.log("[Patient Chat API] Request data:", { message: message?.substring(0, 50), patientId, language });

    if (!message || !patientId) {
      return NextResponse.json(
        { error: "Message and patientId are required" },
        { status: 400 }
      );
    }

    // Convert patientId to Int
    const patientIdInt = parseInt(patientId, 10);
    if (isNaN(patientIdInt)) {
      return NextResponse.json(
        { error: "Invalid patientId" },
        { status: 400 }
      );
    }

    // Get patient info including surgery type from User model
    const patient = await prisma.user.findUnique({
      where: { id: patientIdInt },
      include: {
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!patient) {
      console.log("[Patient Chat API] Patient not found:", patientIdInt);
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    console.log("[Patient Chat API] Found patient:", patient.email);

    // Calculate days since surgery (handle null surgeryDate)
    const daysSinceSurgery = patient.surgeryDate 
      ? Math.floor(
          (new Date().getTime() - new Date(patient.surgeryDate).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    // Build context from recent sessions
    const recentHistory = patient.sessions.slice(0, 3).map(s => 
      `Pain: ${s.painScore}/10, Symptoms: ${s.symptoms?.join(', ') || 'none'}, Emotion: ${s.emotion}`
    ).join('\n');

    // RAG: Search for relevant medical guidelines
    const relevantGuidelines = searchGuidelines(message, patient.surgeryType || 'General Surgery', 2);
    const criticalGuidelines = getCriticalGuidelines(patient.surgeryType || 'General Surgery').slice(0, 1);
    
    // Build RAG context - make it feel natural, not quoted
    const guidelinesContext = relevantGuidelines.length > 0
      ? `\n\nMEDICAL KNOWLEDGE BASE (use this to inform your response naturally, don't cite directly):\n${relevantGuidelines.map(g => 
          `From ${g.source}: ${g.content}`
        ).join('\n\n')}`
      : '';

    const criticalWarnings = criticalGuidelines.length > 0
      ? `\n\nIMPORTANT SAFETY INFORMATION TO CONSIDER:\n${criticalGuidelines.map(g => g.content).join('\n')}`
      : '';

    // AI Doctor prompt
    const languageInstruction = language === "fr" 
      ? "IMPORTANT: Respond ONLY in French. Use natural, conversational French." 
      : "IMPORTANT: Respond ONLY in English.";

    const systemPrompt = `You are an AI medical assistant helping patients recover from surgery.

${languageInstruction}

Patient Information:
- Surgery Type: ${patient.surgeryType || 'Not specified'}
- Days Since Surgery: ${daysSinceSurgery}
- Recent History:
${recentHistory || 'No previous sessions'}
${guidelinesContext}
${criticalWarnings}

Your role:
1. Provide compassionate, supportive responses using your medical knowledge
2. Use the medical knowledge base above to inform your advice (speak naturally as a doctor would, don't say "according to" or "based on guidelines")
3. Give post-surgical care advice specific to ${patient.surgeryType || 'General Surgery'}
4. Monitor recovery progress and compare to normal recovery timeline
5. Alert if concerning symptoms (based on the critical safety information)
6. Encourage medication adherence and rest
7. If patient describes critical symptoms, strongly urge them to contact their surgeon or go to ER

RESPONSE FORMAT:
Write your response in a warm, conversational tone WITHOUT using markdown formatting (no asterisks, no bold text).
Structure your advice naturally with clear paragraphs:

1. Start with empathy - acknowledge their concern
2. Provide your assessment - is this normal or concerning?
3. Give specific advice - what they should do right now
4. Mention warning signs - when to seek immediate help
5. Set expectations - what's normal for their recovery timeline

Use simple paragraph breaks instead of headings or bullet points. Speak like a caring doctor would in person.

PAIN SCALE CONTEXT:
- 1-3/10: Mild discomfort (normal post-op)
- 4-6/10: Moderate pain (may need medication adjustment)
- 7-10/10: Severe pain (requires medical evaluation)

Keep responses conversational but comprehensive (5-7 sentences). Prioritize patient safety.
Think critically and use your medical reasoning - the knowledge base is there to support you, not to be quoted.
${language === "fr" ? "Répondez UNIQUEMENT en français naturel." : "Respond ONLY in English."}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 600  // Increased for comprehensive, structured responses
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
          patientId: patientIdInt,
          role: 'patient',
          message: message,
          audioUrl: null, // Text message from patient
        },
        {
          patientId: patientIdInt,
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
