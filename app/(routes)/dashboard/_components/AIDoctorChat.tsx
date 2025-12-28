"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Square, Loader2, Send, Volume2, Phone, PhoneOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  const [isConversationMode, setIsConversationMode] = useState(false);
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle audio playback with auto-start next recording
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onplay = () => setIsSpeaking(true);
      audioRef.current.onended = () => {
        setIsSpeaking(false);
        // Auto-start recording after doctor finishes speaking in conversation mode
        if (isConversationMode && autoPlayVoice) {
          setTimeout(() => {
            startVoiceRecording();
          }, 500);
        }
      };
    }
  }, [isConversationMode, autoPlayVoice]);

  const playAudio = async (url: string) => {
    if (audioRef.current) {
      audioRef.current.src = url;
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error("Error playing audio:", error);
        setIsSpeaking(false);
      }
    }
  };

  const speakText = async (text: string) => {
    setIsSpeaking(true);
    try {
      // Use browser's text-to-speech as fallback
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.onend = () => {
        setIsSpeaking(false);
        // Auto-start recording after speech in conversation mode
        if (isConversationMode && autoPlayVoice) {
          setTimeout(() => {
            startVoiceRecording();
          }, 500);
        }
      };
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Error with text-to-speech:", error);
      setIsSpeaking(false);
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

      // Play audio response automatically if enabled
      if (autoPlayVoice) {
        if (data.audioUrl) {
          await playAudio(data.audioUrl);
        } else {
          // Fallback to text-to-speech
          await speakText(data.response);
        }
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
    if (isSpeaking) return; // Don't start recording while doctor is speaking
    
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

      // Auto-stop after 10 seconds of silence in conversation mode
      if (isConversationMode) {
        silenceTimeoutRef.current = setTimeout(() => {
          stopVoiceRecording();
        }, 10000);
      }
    } catch (err) {
      console.error("Error starting recording:", err);
      alert("Could not access microphone");
    }
  };

  const stopVoiceRecording = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const startConversation = async () => {
    setIsConversationMode(true);
    
    // Send initial greeting
    const greeting: ChatMessage = {
      id: Date.now().toString(),
      role: "doctor",
      message: "Hello! I'm your AI doctor assistant. How are you feeling today? Please tell me about your symptoms or any concerns you have.",
      createdAt: new Date().toISOString()
    };
    setMessages([greeting]);
    
    // Speak the greeting
    if (autoPlayVoice) {
      await speakText(greeting.message);
    }
  };

  const endConversation = () => {
    setIsConversationMode(false);
    stopVoiceRecording();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
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

      // Play audio response automatically
      if (autoPlayVoice) {
        if (data.audioUrl) {
          await playAudio(data.audioUrl);
        } else {
          await speakText(data.response);
        }
      }

      // Trigger session update
      if (onSessionUpdate) {
        onSessionUpdate();
      }

    } catch (error) {
      console.error("Error processing voice:", error);
      alert("Failed to process your message. Please try again.");
      // Resume recording in conversation mode on error
      if (isConversationMode && autoPlayVoice) {
        setTimeout(() => {
          startVoiceRecording();
        }, 1000);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI Doctor Assistant</CardTitle>
            <CardDescription>
              {isConversationMode 
                ? "Continuous voice conversation active" 
                : "Ask questions about your recovery or describe your symptoms"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="auto-voice"
              checked={autoPlayVoice}
              onCheckedChange={setAutoPlayVoice}
            />
            <Label htmlFor="auto-voice" className="text-xs">Auto Voice</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Conversation Mode Controls */}
        {!isConversationMode ? (
          <div className="flex gap-2">
            <Button
              onClick={startConversation}
              size="lg"
              className="w-full"
              disabled={isProcessing || isSendingMessage}
            >
              <Phone className="mr-2 h-5 w-5" />
              Start Voice Conversation
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-800">
                  {isSpeaking ? "Doctor is speaking..." : 
                   isRecording ? "Listening to you..." : 
                   isProcessing ? "Processing..." : "Ready"}
                </span>
              </div>
              <Button
                onClick={endConversation}
                variant="destructive"
                size="sm"
              >
                <PhoneOff className="mr-2 h-4 w-4" />
                End Conversation
              </Button>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <ScrollArea 
          ref={scrollRef}
          className="h-[400px] w-full rounded-md border p-4"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center space-y-2">
                <p>Start a voice conversation for a natural back-and-forth chat</p>
                <p className="text-xs">Or use the text/voice buttons below for manual control</p>
              </div>
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
                    <div className="flex items-start gap-2">
                      <p className="text-sm flex-1">{msg.message}</p>
                      {msg.audioUrl && msg.role === "doctor" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto shrink-0"
                          onClick={() => playAudio(msg.audioUrl!)}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Manual Input Area */}
        {!isConversationMode && (
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
        )}

        {/* Hidden audio element for playing responses */}
        <audio ref={audioRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
