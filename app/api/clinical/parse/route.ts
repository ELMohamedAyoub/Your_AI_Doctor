import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/shared/OpenAiModel";
import { PrismaClient } from "@/lib/generated/prisma";
import { detectRedFlags } from "@/lib/redFlagDetector";

const prisma = new PrismaClient();

// Alert detection logic
function detectAlertLevel(painScore: number, symptoms: string[], emotion: string): { level: string; reason: string } {
  const normalizedSymptoms = symptoms.map(s => s.toLowerCase());
  
  // RED alerts
  if (painScore >= 8) {
    return { level: "RED", reason: `Critical pain level: ${painScore}/10` };
  }
  
  if (normalizedSymptoms.some(s => 
    s.includes('bleeding') || 
    s.includes('saignement') || 
    s.includes('blood') || 
    s.includes('sang') ||
    s.includes('hemorrhage') ||
    s.includes('hémorragie')
  )) {
    return { level: "RED", reason: "Bleeding reported" };
  }
  
  // ORANGE alerts
  if (emotion.toLowerCase().includes('distressed') || 
      emotion.toLowerCase().includes('panicked') ||
      emotion.toLowerCase().includes('détresse') ||
      emotion.toLowerCase().includes('panique')) {
    return { level: "ORANGE", reason: `Emotional distress detected: ${emotion}` };
  }
  
  if (painScore >= 6) {
    return { level: "ORANGE", reason: `Elevated pain level: ${painScore}/10` };
  }
  
  return { level: "NORMAL", reason: "No critical symptoms detected" };
}

export async function POST(request: NextRequest) {
  console.log("[Clinical Parse] === NEW REQUEST ===");
  console.log("[Clinical Parse] Request headers:", {
    contentType: request.headers.get('content-type'),
    contentLength: request.headers.get('content-length'),
  });

  try {
    let body;
    try {
      body = await request.json();
      console.log("[Clinical Parse] Successfully parsed JSON body");
    } catch (jsonError) {
      console.error("[Clinical Parse] Invalid JSON in request body:", jsonError);
      console.error("[Clinical Parse] JSON parse error details:", {
        name: jsonError instanceof Error ? jsonError.name : 'Unknown',
        message: jsonError instanceof Error ? jsonError.message : String(jsonError)
      });
      return NextResponse.json(
        { error: "Invalid request body - must be valid JSON" },
        { status: 400 }
      );
    }

    const { transcript, patientId } = body;

    console.log("Clinical parse request:", { 
      transcript: transcript?.substring(0, 100), 
      patientId,
      bodyKeys: Object.keys(body)
    });

    if (!transcript || !patientId) {
      console.error("Missing required fields:", { hasTranscript: !!transcript, hasPatientId: !!patientId });
      return NextResponse.json(
        { error: "Transcript and patientId are required", received: { hasTranscript: !!transcript, hasPatientId: !!patientId } },
        { status: 400 }
      );
    }

    // Clinical extraction prompt - bilingual
    const systemPrompt = `You are a clinical data extraction system. Extract structured medical information from patient transcripts in French or English.

Extract the following information and return ONLY a valid JSON object:
{
  "painScore": <number 0-10>,
  "symptoms": [<array of symptoms mentioned, in English>],
  "emotion": "<patient's emotional state: calm, anxious, distressed, panicked>",
  "language": "<fr or en>"
}

Rules:
- painScore: Patient's self-reported pain level (0=no pain, 10=worst pain). 
  * If patient says a number, use it exactly
  * If patient says "terrible", "awful", "unbearable", "worst pain" → infer 9-10
  * If patient says "severe", "really bad", "intense" → infer 7-8
  * If patient says "moderate", "uncomfortable" → infer 4-6
  * If patient says "mild", "slight", "a little" → infer 2-3
  * If patient says "no pain", "fine", "better" → infer 0-1
- symptoms: List all symptoms mentioned (fever, nausea, bleeding, swelling, redness, discharge, difficulty breathing, etc.). Translate French terms to English.
- emotion: Assess emotional state from language tone and content.
- language: Detect if transcript is in French (fr) or English (en).

French to English symptom mapping:
- fièvre → fever
- nausée → nausea
- saignement → bleeding
- gonflement → swelling
- rougeur → redness
- écoulement → discharge
- difficulté respiratoire → difficulty breathing
- douleur → pain
- vertige → dizziness
- fatigue → fatigue

Return ONLY the JSON object, no additional text.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",  // Cheaper model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Extract clinical data from this transcript:\n\n${transcript}` }
      ],
      temperature: 0.3,
      max_tokens: 500,  // Reduced from default 16384
      response_format: { type: "json_object" }
    });

    const extractedData = JSON.parse(response.choices[0]?.message?.content || "{}");
    
    console.log("[Clinical Parse] Extracted data:", {
      painScore: extractedData.painScore,
      symptoms: extractedData.symptoms,
      emotion: extractedData.emotion,
      language: extractedData.language
    });
    
    // Validate extracted data
    if (typeof extractedData.painScore !== 'number' || 
        !Array.isArray(extractedData.symptoms) ||
        !extractedData.emotion ||
        !extractedData.language) {
      console.error("[Clinical Parse] Invalid extraction format:", extractedData);
      throw new Error("Invalid extraction format");
    }

    // Convert patientId to Int
    const patientIdInt = typeof patientId === 'string' ? parseInt(patientId, 10) : patientId;
    if (isNaN(patientIdInt)) {
      return NextResponse.json(
        { error: "Invalid patient ID" },
        { status: 400 }
      );
    }

    // Get patient email for createdBy field
    const patient = await prisma.user.findUnique({
      where: { id: patientIdInt },
      select: { email: true }
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Use advanced red flag detection
    const redFlagResult = detectRedFlags(transcript, extractedData.painScore);
    
    console.log("[Clinical Parse] Red flag detection result:", {
      hasRedFlags: redFlagResult.hasRedFlags,
      level: redFlagResult.level,
      flagCount: redFlagResult.flags.length,
      flags: redFlagResult.flags.map(f => ({ symptom: f.symptom, level: f.level }))
    });

    // Store session in database (using Session model linked to User)
    const session = await prisma.session.create({
      data: {
        sessionId: `voice-${Date.now()}`,
        notes: `Voice check-in - Pain: ${extractedData.painScore}/10, Emotion: ${extractedData.emotion}`,
        createdBy: patient.email,
        createdOn: new Date().toISOString(),
        patientId: patientIdInt,
        transcription: transcript,
        painScore: extractedData.painScore,
        symptoms: extractedData.symptoms,
        emotion: extractedData.emotion,
        language: extractedData.language || 'en', // Save language
        summary: `Symptoms: ${extractedData.symptoms.join(', ')}`,
        redFlags: redFlagResult.hasRedFlags ? redFlagResult.flags.map(f => f.symptom) : [],
      }
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        painScore: session.painScore,
        symptoms: extractedData.symptoms,
        emotion: session.emotion,
        language: extractedData.language,
        createdAt: session.createdAt
      },
      alert: redFlagResult.hasRedFlags ? {
        level: redFlagResult.level,
        reason: redFlagResult.summary
      } : { level: "NORMAL", reason: "No critical symptoms detected" },
      redFlags: redFlagResult
    });

  } catch (error) {
    console.error("[Clinical Parse] Error:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      console.error("[Clinical Parse] Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      });
    }
    
    return NextResponse.json(
      { 
        error: "Failed to parse clinical data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
