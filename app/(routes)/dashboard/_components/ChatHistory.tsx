"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Calendar, User, Bot, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: string;
  role: "patient" | "doctor";
  message: string;
  audioUrl: string | null;
  createdAt: string;
}

interface GroupedMessages {
  [date: string]: ChatMessage[];
}

interface ChatHistoryProps {
  patientId: string;
}

export default function ChatHistory({ patientId }: ChatHistoryProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [groupedMessages, setGroupedMessages] = useState<GroupedMessages>({});
  const [isLoading, setIsLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    fetchChatHistory();
  }, [patientId]);

  const fetchChatHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chat-history?patientId=${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        groupMessagesByDate(data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupMessagesByDate = (msgs: ChatMessage[]) => {
    const grouped: GroupedMessages = {};
    
    msgs.forEach((msg) => {
      const date = new Date(msg.createdAt);
      const dateKey = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(msg);
    });
    
    setGroupedMessages(grouped);
  };

  const playAudio = async (audioUrl: string, messageId: string) => {
    if (playingAudio === messageId) {
      // Stop playing
      const audio = document.getElementById(`audio-${messageId}`) as HTMLAudioElement;
      audio?.pause();
      setPlayingAudio(null);
      return;
    }

    // Stop any currently playing audio
    if (playingAudio) {
      const currentAudio = document.getElementById(`audio-${playingAudio}`) as HTMLAudioElement;
      currentAudio?.pause();
    }

    // Play new audio
    const audio = document.getElementById(`audio-${messageId}`) as HTMLAudioElement;
    if (audio) {
      setPlayingAudio(messageId);
      audio.play();
      audio.onended = () => setPlayingAudio(null);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat History
          </CardTitle>
          <CardDescription>Loading your conversation history...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat History
          </CardTitle>
          <CardDescription>Your past conversations with the AI Doctor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No conversation history yet</p>
            <p className="text-sm mt-1">Start chatting with the AI Doctor to see your history here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Chat History
        </CardTitle>
        <CardDescription>
          {messages.length} messages across {Object.keys(groupedMessages).length} days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedMessages).reverse().map(([date, msgs]) => (
              <div key={date} className="space-y-3">
                {/* Date Header */}
                <div className="flex items-center gap-2 sticky top-0 bg-white py-2 z-10">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <h3 className="font-semibold text-sm text-gray-700">{date}</h3>
                  <div className="flex-1 h-px bg-gray-200 ml-2"></div>
                </div>

                {/* Messages for this date */}
                <div className="space-y-3">
                  {msgs.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        msg.role === "patient" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "doctor" && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                      )}

                      <div
                        className={`flex flex-col max-w-[80%] ${
                          msg.role === "patient" ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            msg.role === "patient"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        </div>

                        <div className="flex items-center gap-2 mt-1 px-1">
                          <span className="text-xs text-gray-500">
                            {formatTime(msg.createdAt)}
                          </span>

                          {/* Audio playback button */}
                          {msg.audioUrl && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2"
                                onClick={() => playAudio(msg.audioUrl!, msg.id)}
                              >
                                <Volume2
                                  className={`h-3 w-3 ${
                                    playingAudio === msg.id ? "text-blue-600" : "text-gray-400"
                                  }`}
                                />
                              </Button>
                              <audio
                                id={`audio-${msg.id}`}
                                src={msg.audioUrl}
                                className="hidden"
                              />
                            </>
                          )}
                        </div>
                      </div>

                      {msg.role === "patient" && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
