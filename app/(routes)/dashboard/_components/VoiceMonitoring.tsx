"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Square, Loader2 } from "lucide-react";

interface VoiceMonitoringProps {
  patientId: string;
  onSubmit?: () => void;
}

export default function VoiceMonitoring({ patientId, onSubmit }: VoiceMonitoringProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError("");

    try {
      // Step 1: Transcribe audio
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const transcribeResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!transcribeResponse.ok) {
        throw new Error("Transcription failed");
      }

      const { transcript: text } = await transcribeResponse.json();
      setTranscript(text);

      // Step 2: Extract clinical data
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
      
      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit();
      }

      // Show success message
      setTimeout(() => {
        setTranscript("");
      }, 3000);

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
          Describe how you're feeling in your own words
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          {!isRecording && !isProcessing && (
            <Button
              size="lg"
              onClick={startRecording}
              className="w-full h-20 text-lg"
            >
              <Mic className="mr-2 h-6 w-6" />
              Start Voice Check-In
            </Button>
          )}

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
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Processing your check-in...</p>
            </div>
          )}

          {transcript && !isProcessing && (
            <div className="w-full p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Check-in recorded successfully!
              </p>
            </div>
          )}

          {error && (
            <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 Tips for best results:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Speak clearly about your pain level (0-10)</li>
            <li>Mention any symptoms you're experiencing</li>
            <li>Describe your emotional state</li>
            <li>Speak in French or English</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
