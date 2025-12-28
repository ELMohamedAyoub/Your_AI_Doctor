"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import VoiceMonitoring from "../dashboard/_components/VoiceMonitoring";
import AIDoctorChat from "../dashboard/_components/AIDoctorChat";
import ChatHistory from "../dashboard/_components/ChatHistory";
import DailyTracker from "../dashboard/_components/DailyTracker";
import MedicationReminders from "../dashboard/_components/MedicationReminders";
import RiskScore from "../dashboard/_components/RiskScore";
import { useRouter } from "next/navigation";
import { getSurgeryBaseline } from "@/lib/surgeryBaselines";

interface PatientStatus {
  patient: {
    id: string;
    name: string;
    surgery: string;
    surgeryDate: string;
  };
  lastSession: {
    painScore: number;
    symptoms: string[];
    emotion: string;
    createdAt: string;
  } | null;
  lastAlert: {
    level: string;
    reason: string;
    createdAt: string;
  } | null;
  daysSinceSurgery: number;
}

export default function PatientDashboard() {
  const router = useRouter();
  const [status, setStatus] = useState<PatientStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [patientExists, setPatientExists] = useState(true);

  useEffect(() => {
    fetchPatientStatus();
  }, []);

  const fetchPatientStatus = async () => {
    try {
      const response = await fetch("/api/patient/status");
      
      if (response.status === 404) {
        setPatientExists(false);
        router.push("/onboarding");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Error fetching patient status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionComplete = () => {
    // Refresh status after completing a voice check-in
    fetchPatientStatus();
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!patientExists || !status) {
    return null; // Will redirect to onboarding
  }

  const baseline = getSurgeryBaseline(status.patient.surgery);

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {status.patient.name}</h1>
        <p className="text-muted-foreground mt-2">
          {status.patient.surgery} • {status.daysSinceSurgery} days post-surgery
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle>Recovery Status</CardTitle>
            <CardDescription>Your latest check-in data</CardDescription>
          </CardHeader>
          <CardContent>
            {status.lastSession ? (
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">Last Pain Score</span>
                  <p className={`text-3xl font-bold ${status.lastSession.painScore >= 7 ? "text-red-500" : ""}`}>
                    {status.lastSession.painScore}/10
                  </p>
                  {baseline && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Normal range: {baseline.normalPainMin}-{baseline.normalPainMax}/10
                    </p>
                  )}
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">Emotional State</span>
                  <p className="text-lg font-medium capitalize">{status.lastSession.emotion}</p>
                </div>

                {status.lastSession.symptoms.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">Recent Symptoms</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {status.lastSession.symptoms.map((symptom, index) => (
                        <Badge key={index} variant="outline">{symptom}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(status.lastSession.createdAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No check-ins yet. Start your first voice check-in!</p>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Status</CardTitle>
            <CardDescription>Current health alerts</CardDescription>
          </CardHeader>
          <CardContent>
            {status.lastAlert ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge className={
                    status.lastAlert.level === "RED" 
                      ? "bg-red-500 hover:bg-red-600" 
                      : status.lastAlert.level === "ORANGE"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-green-500 hover:bg-green-600"
                  }>
                    {status.lastAlert.level}
                  </Badge>
                  <span className="text-sm font-medium">{status.lastAlert.reason}</span>
                </div>

                {status.lastAlert.level === "RED" && (
                  <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-950">
                    <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                      ⚠️ Critical Alert
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                      Please contact your healthcare provider immediately.
                    </p>
                  </div>
                )}

                {status.lastAlert.level === "ORANGE" && (
                  <div className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50 dark:bg-orange-950">
                    <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                      ⚠️ Warning
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                      Please monitor your symptoms and contact your doctor if they worsen.
                    </p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  {new Date(status.lastAlert.createdAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Badge className="bg-green-500 hover:bg-green-600">NORMAL</Badge>
                <span className="text-sm">No alerts at this time</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Voice Monitoring */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">📊 Clinical Monitoring</h3>
            <p className="text-xs text-muted-foreground">Quick daily health check - we track your pain and symptoms</p>
          </div>
          <VoiceMonitoring 
            patientId={status.patient.id} 
            onSubmit={handleSessionComplete}
          />
        </div>

        {/* AI Doctor Chat */}
        <div>
          <div className="mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">💬 AI Doctor Assistant</h3>
            <p className="text-xs text-muted-foreground">Ask questions, get advice, and receive support for your recovery</p>
          </div>
          <AIDoctorChat 
            patientId={status.patient.id}
            onSessionUpdate={handleSessionComplete}
          />
        </div>
      </div>

      {/* Daily Tracking & Medication - NEW */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <DailyTracker 
          patientId={status.patient.id}
          daysSinceSurgery={status.daysSinceSurgery}
        />
        <MedicationReminders patientId={status.patient.id} />
      </div>

      {/* Risk Score - NEW */}
      <div className="mb-6">
        <RiskScore 
          patientId={status.patient.id}
          surgeryType={status.patient.surgery}
          currentPainScore={status.lastSession?.painScore || 0}
        />
      </div>

      {/* Chat History */}
      <div className="mt-6">
        <ChatHistory patientId={status.patient.id} />
      </div>

      {/* Recovery Guidelines */}
      {baseline && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recovery Guidelines for {status.patient.surgery}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Expected Recovery Time:</strong> {baseline.recoveryDays} days</p>
              <p><strong>Normal Pain Range:</strong> {baseline.normalPainMin}-{baseline.normalPainMax}/10</p>
              <div>
                <strong>Expected Symptoms:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  {baseline.expectedSymptoms.map((symptom, index) => (
                    <li key={index}>{symptom}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Contact Your Doctor If You Experience:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 text-red-600 dark:text-red-400">
                  {baseline.criticalSymptoms.map((symptom, index) => (
                    <li key={index}>{symptom}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
