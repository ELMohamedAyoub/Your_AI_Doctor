"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { getSurgeryBaseline } from "@/lib/surgeryBaselines";
import { MessageCircle } from "lucide-react";

interface Session {
  id: string;
  painScore: number;
  symptoms: string[];
  emotion: string;
  language: string;
  transcript: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  role: string;
  message: string;
  audioUrl: string | null;
  createdAt: string;
}

interface Alert {
  id: string;
  level: string;
  reason: string;
  createdAt: string;
}

interface PatientDetail {
  id: string;
  name: string;
  surgery: string;
  surgeryDate: string;
  sessions: Session[];
  alerts: Alert[];
  chatMessages?: ChatMessage[];
}

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "chat">("overview");

  useEffect(() => {
    fetchPatientDetail();
  }, [patientId]);

  const fetchPatientDetail = async () => {
    try {
      const response = await fetch(`/api/doctor/patient/${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setPatient(data.patient);
      }
    } catch (error) {
      console.error("Error fetching patient detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  if (loading) {
    return <div className="p-8">Loading patient data...</div>;
  }

  if (!patient) {
    return <div className="p-8">Patient not found</div>;
  }

  const baseline = getSurgeryBaseline(patient.surgery);
  
  // Prepare chart data
  const chartData = patient.sessions.map((session, index) => ({
    name: `Session ${patient.sessions.length - index}`,
    painScore: session.painScore,
    date: new Date(session.createdAt).toLocaleDateString(),
    normalMin: baseline?.normalPainMin || 0,
    normalMax: baseline?.normalPainMax || 10
  })).reverse();

  const getAlertColor = (level: string) => {
    const colors = {
      RED: "text-red-500",
      ORANGE: "text-orange-500",
      NORMAL: "text-green-500"
    };
    return colors[level as keyof typeof colors] || "text-gray-500";
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{patient.name}</h1>
        <p className="text-muted-foreground mt-2">
          {patient.surgery} • Surgery Date: {new Date(patient.surgeryDate).toLocaleDateString()}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "overview" ? "default" : "outline"}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </Button>
        <Button
          variant={activeTab === "chat" ? "default" : "outline"}
          onClick={() => setActiveTab("chat")}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Chat History ({patient.chatMessages?.length || 0})
        </Button>
      </div>

      {/* Chat History Tab */}
      {activeTab === "chat" && (
        <Card>
          <CardHeader>
            <CardTitle>AI Doctor Chat History</CardTitle>
            <CardDescription>
              Complete conversation between patient and AI doctor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!patient.chatMessages || patient.chatMessages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No chat messages yet</p>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {patient.chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "patient" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          msg.role === "patient"
                            ? "bg-blue-100 dark:bg-blue-900"
                            : "bg-green-100 dark:bg-green-900"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {msg.role === "patient" ? "Patient" : "AI Doctor"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        {msg.audioUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => playAudio(msg.audioUrl!)}
                            className="mt-2"
                          >
                            🔊 Play Audio
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      {/* Overview Tab (existing content) */}
      {activeTab === "overview" && (
        <>
          {/* Pain Trend Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pain Score Trend</CardTitle>
              <CardDescription>
                Normal range for {patient.surgery}: {baseline?.normalPainMin}-{baseline?.normalPainMax}/10
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  {baseline && (
                    <>
                      <ReferenceLine y={baseline.normalPainMax} stroke="orange" strokeDasharray="3 3" label="Max Normal" />
                      <ReferenceLine y={baseline.normalPainMin} stroke="green" strokeDasharray="3 3" label="Min Normal" />
                    </>
                  )}
                  <Line type="monotone" dataKey="painScore" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.alerts.length === 0 ? (
                <p className="text-muted-foreground">No alerts</p>
              ) : (
                <div className="space-y-3">
                  {patient.alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex justify-between items-start border-b pb-2">
                      <div>
                        <span className={`font-semibold ${getAlertColor(alert.level)}`}>
                          {alert.level}
                        </span>
                        <p className="text-sm text-muted-foreground">{alert.reason}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session History */}
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.sessions.length === 0 ? (
                <p className="text-muted-foreground">No sessions recorded</p>
              ) : (
                <div className="space-y-4">
                  {patient.sessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-4 items-center">
                          <span className="font-semibold">
                            Pain: <span className={session.painScore >= 7 ? "text-red-500" : ""}>{session.painScore}/10</span>
                          </span>
                          <Badge variant="outline">{session.emotion}</Badge>
                          <Badge variant="outline">{session.language.toUpperCase()}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(session.createdAt).toLocaleString()}
                        </span>
                      </div>
                      
                      {session.symptoms.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm font-medium">Symptoms:</span>{" "}
                          <span className="text-sm">{session.symptoms.join(", ")}</span>
                        </div>
                      )}
                      
                      <details className="text-sm">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View transcript
                        </summary>
                        <p className="mt-2 p-3 bg-muted rounded">{session.transcript}</p>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
