"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Square, Loader2, CheckCircle, AlertCircle, MessageCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import RedFlagAlert from "./RedFlagAlert";
import type { RedFlagResult } from "@/lib/redFlagDetector";

interface VoiceMonitoringProps {
  patientId: string;
  onSubmit?: () => void;
}

type CheckInStep = "pain" | "symptoms" | "mood" | "complete";

interface CheckInData {
  pain?: string;
  symptoms?: string;
  mood?: string;
  fullTranscript: string;
}

const QUESTIONS = {
  pain: "On a scale of 0 to 10, how would you rate your pain level right now?",
  symptoms: "Are you experiencing any new symptoms? Please describe them.",
  mood: "How are you feeling emotionally today?"
};

export default function VoiceMonitoring({ patientId, onSubmit }: VoiceMonitoringProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<CheckInStep | null>(null);
  const [checkInData, setCheckInData] = useState<CheckInData>({ fullTranscript: "" });
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [error, setError] = useState("");
  const [isInteractive, setIsInteractive] = useState(false);
  const [redFlags, setRedFlags] = useState<RedFlagResult | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "fr" | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const QUESTIONS_EN = {
    pain: "On a scale of 0 to 10, how would you rate your pain level right now?",
    symptoms: "Are you experiencing any new symptoms? Please describe them.",
    mood: "How are you feeling emotionally today?"
  };

  const QUESTIONS_FR = {
    pain: "Sur une échelle de 0 à 10, comment évalueriez-vous votre niveau de douleur en ce moment?",
    symptoms: "Ressentez-vous de nouveaux symptômes? Veuillez les décrire.",
    mood: "Comment vous sentez-vous émotionnellement aujourd'hui?"
  };

  const QUESTIONS = selectedLanguage === "fr" ? QUESTIONS_FR : QUESTIONS_EN;

  const speakQuestion = (question: string) => {
    const utterance = new SpeechSynthesisUtterance(question);
    utterance.lang = selectedLanguage === "fr" ? "fr-FR" : "en-US";
    utterance.rate = 0.9;
    utterance.onend = () => {
      // Auto-start recording after question
      setTimeout(() => {
        startRecording();
      }, 500);
    };
    window.speechSynthesis.speak(utterance);
  };

  const getProgress = () => {
    if (!currentStep) return 0;
    const steps: CheckInStep[] = ["pain", "symptoms", "mood", "complete"];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const startInteractiveCheckIn = () => {
    setIsInteractive(true);
    setCurrentStep("pain");
    setCheckInData({ fullTranscript: "" });
    setError("");
    
    const greeting = "Hello! Let's do your daily check-in. " + QUESTIONS.pain;
    speakQuestion(greeting);
  };

  const moveToNextStep = (transcript: string) => {
    console.log("moveToNextStep called with:", transcript, "currentStep:", currentStep);
    const updatedData = { ...checkInData };
    updatedData.fullTranscript += transcript + " ";

    if (currentStep === "pain") {
      console.log("Moving from pain to symptoms");
      updatedData.pain = transcript;
      setCheckInData(updatedData);
      setCurrentStep("symptoms");
      speakQuestion(QUESTIONS.symptoms);
    } else if (currentStep === "symptoms") {
      console.log("Moving from symptoms to mood");
      updatedData.symptoms = transcript;
      setCheckInData(updatedData);
      setCurrentStep("mood");
      speakQuestion(QUESTIONS.mood);
    } else if (currentStep === "mood") {
      console.log("Completing check-in");
      updatedData.mood = transcript;
      setCheckInData(updatedData);
      setCurrentStep("complete");
      // Process the complete check-in
      processCompleteCheckIn(updatedData);
    }
  };

  const processCompleteCheckIn = async (data: CheckInData) => {
    setIsProcessing(true);
    setError("");

    try {
      // Extract clinical data from the complete transcript
      const clinicalResponse = await fetch("/api/clinical/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          transcript: data.fullTranscript,
        }),
      });

      if (!clinicalResponse.ok) {
        throw new Error("Clinical data extraction failed");
      }

      const result = await clinicalResponse.json();

      // Store red flags if detected
      if (result.redFlags && result.redFlags.hasRedFlags) {
        setRedFlags(result.redFlags);
      }

      // Speak completion message
      const completionMessage = `Thank you for completing your check-in. Your responses have been recorded. ${
        result.alert?.level === "RED" 
          ? "I notice some concerning symptoms. Please contact your healthcare provider immediately."
          : result.alert?.level === "ORANGE"
          ? "I've noted your symptoms. Please monitor them closely."
          : "Everything looks good. Continue following your recovery plan."
      }`;
      
      speakQuestion(completionMessage);
      
      // Call onSubmit callback if provided
      if (onSubmit) {
        setTimeout(() => {
          onSubmit();
        }, 3000);
      }

      // Reset after completion
      setTimeout(() => {
        setIsInteractive(false);
        setCurrentStep(null);
        setCheckInData({ fullTranscript: "" });
      }, 5000);

    } catch (err) {
      console.error("Error processing check-in:", err);
      setError("Failed to process your check-in. Please try again.");
      speakQuestion("Sorry, I had trouble processing that. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Auto-stop recording after 10 seconds
      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 10000);
      
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError("");

    try {
      console.log("Processing audio blob, size:", audioBlob.size);
      
      // Transcribe audio
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("language", selectedLanguage || "en"); // Pass language

      console.log("Sending to /api/transcribe...");
      const transcribeResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      console.log("Transcribe response status:", transcribeResponse.status);
      
      if (!transcribeResponse.ok) {
        const errorText = await transcribeResponse.text();
        console.error("Transcription error:", errorText);
        throw new Error(`Transcription failed: ${errorText}`);
      }

      const { transcript: text } = await transcribeResponse.json();
      console.log("Transcription result:", text);
      setCurrentTranscript(text);

      if (isInteractive && currentStep && currentStep !== "complete") {
        // Move to next step in interactive mode
        console.log("Moving to next step with transcript:", text);
        moveToNextStep(text);
      } else {
        // Process as single voice check-in
        const clinicalResponse = await fetch("/api/clinical/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId,
            transcript: text,
          }),
        });

        if (!clinicalResponse.ok) {
          throw new Error("Clinical data extraction failed");
        }

        const result = await clinicalResponse.json();
        
        // Store red flags if detected
        if (result.redFlags && result.redFlags.hasRedFlags) {
          setRedFlags(result.redFlags);
        }
        
        // Call onSubmit callback if provided
        if (onSubmit) {
          onSubmit();
        }

        // Show success message
        setTimeout(() => {
          setCurrentTranscript("");
        }, 3000);
      }

    } catch (err) {
      console.error("Error processing audio:", err);
      setError("Failed to process your voice check-in. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice Check-In</CardTitle>
        <CardDescription>
          {isInteractive 
            ? "Interactive guided check-in in progress" 
            : "Quick voice check-in or guided conversation"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Red Flag Alert */}
        {redFlags && redFlags.hasRedFlags && (
          <RedFlagAlert 
            result={redFlags} 
            onDismiss={() => setRedFlags(null)} 
          />
        )}

        {/* Language Selection - Show if not selected yet and not recording */}
        {!selectedLanguage && !isRecording && !isProcessing && (
          <div className="space-y-3">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Choose Language</h3>
              <p className="text-sm text-gray-600 mb-4">Choisissez la langue</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setSelectedLanguage("en")}
                size="lg"
                variant="outline"
                className="h-20"
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🇬🇧</div>
                  <div className="font-semibold">English</div>
                </div>
              </Button>
              <Button
                onClick={() => setSelectedLanguage("fr")}
                size="lg"
                variant="outline"
                className="h-20"
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🇫🇷</div>
                  <div className="font-semibold">Français</div>
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Interactive Mode Controls */}
        {selectedLanguage && !isInteractive && !isRecording && !isProcessing && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="lg"
                onClick={startRecording}
                variant="outline"
                className="h-20"
              >
                <Mic className="mr-2 h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Quick Check-In</div>
                  <div className="text-xs text-gray-500">Single recording</div>
                </div>
              </Button>
              <Button
                size="lg"
                onClick={startInteractiveCheckIn}
                className="h-20"
              >
                <MessageCircle className="mr-2 h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Guided Check-In</div>
                  <div className="text-xs">Step-by-step</div>
                </div>
              </Button>
            </div>
            <Button
              onClick={() => setSelectedLanguage(null)}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              Change Language
            </Button>
          </div>
        )}

        {/* Interactive Mode Progress */}
        {isInteractive && currentStep !== "complete" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {currentStep === "pain" && "Step 1: Pain Level"}
                {currentStep === "symptoms" && "Step 2: Symptoms"}
                {currentStep === "mood" && "Step 3: Emotional State"}
              </span>
              <span className="text-gray-500">{Math.round(getProgress())}%</span>
            </div>
            <Progress value={getProgress()} />
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">
                {currentStep === "pain" && QUESTIONS.pain}
                {currentStep === "symptoms" && QUESTIONS.symptoms}
                {currentStep === "mood" && QUESTIONS.mood}
              </p>
              {isRecording && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-700">
                      <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs">Listening... (Speak now, auto-stops in 10s)</span>
                    </div>
                  </div>
                  <Button
                    onClick={stopRecording}
                    size="sm"
                    variant="destructive"
                    className="w-full"
                  >
                    <Square className="mr-2 h-4 w-4" />
                    Stop & Continue
                  </Button>
                </div>
              )}
              {isProcessing && (
                <div className="flex items-center gap-2 text-blue-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs">Processing your response...</span>
                </div>
              )}
            </div>

            {checkInData.pain && currentStep !== "pain" && (
              <div className="text-xs text-gray-600">
                <CheckCircle className="inline h-3 w-3 text-green-500 mr-1" />
                Pain level recorded
              </div>
            )}
            {checkInData.symptoms && currentStep !== "symptoms" && (
              <div className="text-xs text-gray-600">
                <CheckCircle className="inline h-3 w-3 text-green-500 mr-1" />
                Symptoms recorded
              </div>
            )}
          </div>
        )}

        {/* Regular Mode Recording */}
        {!isInteractive && (
          <>
            {isRecording && (
              <Button
                size="lg"
                onClick={stopRecording}
                variant="destructive"
                className="w-full h-20 text-lg animate-pulse"
              >
                <Square className="mr-2 h-6 w-6" />
                Stop Recording
              </Button>
            )}

            {isProcessing && (
              <div className="flex flex-col items-center space-y-2 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-600">Processing your check-in...</p>
              </div>
            )}

            {currentTranscript && !isProcessing && (
              <div className="w-full p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-green-800 font-medium">
                    Check-in recorded successfully!
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Completion State */}
        {currentStep === "complete" && (
          <div className="space-y-3">
            <Progress value={100} />
            <div className="w-full p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-800">
                Check-in complete! Thank you.
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Tips */}
        {!isInteractive && !isRecording && !isProcessing && (
          <div className="text-xs text-gray-500 space-y-1 pt-2">
            <p className="font-medium">💡 Tips:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Quick Check-In: Record all at once</li>
              <li>Guided Check-In: Answer step-by-step questions</li>
              <li>Speak clearly in French or English</li>
            </ul>
          </div>
        )}

        {/* Hidden audio element */}
        <audio ref={audioRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
