"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Square, Loader2, Send, Volume2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessage {
  id: string;
  role: "patient" | "doctor";
  message: string;
  audioUrl?: string;
  createdAt: string;
}

interface AIDoctorChatProps {
  patientId: string;
  onSessionUpdate?: () => void;
}

export default function AIDoctorChat({ patientId, onSessionUpdate }: AIDoctorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const playAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
    }
  };

  const sendTextMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage("");
    setIsSendingMessage(true);

    // Add user message to chat
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "patient",
      message: userMessage,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Get AI doctor response
      const response = await fetch("/api/patient/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          patientId
        })
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      // Add doctor response to chat
      const doctorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "doctor",
        message: data.response,
        audioUrl: data.audioUrl,
        createdAt: data.timestamp
      };
      setMessages(prev => [...prev, doctorMessage]);

      // Play audio response if available
      if (data.audioUrl) {
        playAudio(data.audioUrl);
      }

      // Trigger session update
      if (onSessionUpdate) {
        onSessionUpdate();
      }

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "doctor",
        message: "I'm sorry, I'm having trouble responding right now. Please try again.",
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const startVoiceRecording = async () => {
    try {
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
        await processVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      alert("Could not access microphone");
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceMessage = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      // Step 1: Transcribe audio
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const transcribeResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!transcribeResponse.ok) throw new Error("Transcription failed");

      const { transcript } = await transcribeResponse.json();

      // Add patient voice message to chat
      const patientMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "patient",
        message: transcript,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, patientMessage]);

      // Step 2: Get AI doctor response
      const chatResponse = await fetch("/api/patient/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: transcript,
          patientId
        })
      });

      if (!chatResponse.ok) throw new Error("Failed to get response");

      const data = await chatResponse.json();

      // Add doctor response to chat
      const doctorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "doctor",
        message: data.response,
        audioUrl: data.audioUrl,
        createdAt: data.timestamp
      };
      setMessages(prev => [...prev, doctorMessage]);

      // Play audio response
      if (data.audioUrl) {
        playAudio(data.audioUrl);
      }

      // Trigger session update
      if (onSessionUpdate) {
        onSessionUpdate();
      }

    } catch (error) {
      console.error("Error processing voice:", error);
      alert("Failed to process your message. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Doctor Assistant</CardTitle>
        <CardDescription>
          Ask questions about your recovery or describe your symptoms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <ScrollArea 
          ref={scrollRef}
          className="h-[400px] w-full rounded-md border p-4"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Start a conversation with your AI doctor</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "patient" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === "patient"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    {msg.audioUrl && msg.role === "doctor" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 p-1 h-auto"
                        onClick={() => playAudio(msg.audioUrl!)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    )}
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendTextMessage()}
            placeholder="Type your message..."
            disabled={isRecording || isProcessing || isSendingMessage}
          />
          <Button
            onClick={sendTextMessage}
            disabled={!inputMessage.trim() || isRecording || isProcessing || isSendingMessage}
          >
            {isSendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
          <Button
            variant={isRecording ? "destructive" : "default"}
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            disabled={isProcessing || isSendingMessage}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isRecording ? (
              <Square className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Hidden audio element for playing responses */}
        <audio ref={audioRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
