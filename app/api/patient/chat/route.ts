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

    const { message, patientId, language = "en" } = await request.json();

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
- Surgery Type: ${patient.surgery}
- Days Since Surgery: ${daysSinceSurgery}
- Recent History:
${recentHistory || 'No previous sessions'}
${guidelinesContext}
${criticalWarnings}

Your role:
1. Provide compassionate, supportive responses using your medical knowledge
2. Use the medical knowledge base above to inform your advice (speak naturally as a doctor would, don't say "according to" or "based on guidelines")
3. Give post-surgical care advice specific to ${patient.surgery}
4. Monitor recovery progress and compare to normal recovery timeline
5. Alert if concerning symptoms (based on the critical safety information)
6. Encourage medication adherence and rest
7. If patient describes critical symptoms, strongly urge them to contact their surgeon or go to ER

RESPONSE STRUCTURE - Make your responses more helpful by including:
1. **Acknowledgment** - Show empathy and validate their concern
2. **Assessment** - Based on symptoms and recovery timeline, is this normal or concerning?
3. **Specific Advice** - Clear, actionable steps:
   - Pain management (specific medications, dosages if appropriate)
   - Self-care measures (ice/heat, elevation, rest)
   - Activity modifications
4. **Red Flags** - When to seek immediate medical attention (fever, severe swelling, etc.)
5. **Follow-up** - Timeline expectations and when to contact their surgeon

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
