import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/shared/OpenAiModel";
import { PrismaClient } from "@/lib/generated/prisma";

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
  try {
    const body = await request.json();
    const { transcript, patientId } = body;

    console.log("Clinical parse request:", { transcript: transcript?.substring(0, 100), patientId });

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
- painScore: Patient's self-reported pain level (0=no pain, 10=worst pain). If not explicitly stated, infer from description.
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
    
    // Validate extracted data
    if (typeof extractedData.painScore !== 'number' || 
        !Array.isArray(extractedData.symptoms) ||
        !extractedData.emotion ||
        !extractedData.language) {
      throw new Error("Invalid extraction format");
    }

    // Store session in database
    const session = await prisma.patientSession.create({
      data: {
        patientId,
        transcript,
        painScore: extractedData.painScore,
        symptoms: extractedData.symptoms,
        emotion: extractedData.emotion,
        language: extractedData.language
      }
    });

    // Detect and create alert if needed
    const alertInfo = detectAlertLevel(
      extractedData.painScore,
      extractedData.symptoms,
      extractedData.emotion
    );

    if (alertInfo.level !== "NORMAL") {
      await prisma.alert.create({
        data: {
          patientId,
          level: alertInfo.level,
          reason: alertInfo.reason
        }
      });
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        painScore: session.painScore,
        symptoms: session.symptoms,
        emotion: session.emotion,
        language: session.language,
        createdAt: session.createdAt
      },
      alert: alertInfo
    });

  } catch (error) {
    console.error("Error in clinical parsing:", error);
    return NextResponse.json(
      { error: "Failed to parse clinical data" },
      { status: 500 }
    );
  }
}
