"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import VoiceMonitoring from "../dashboard/_components/VoiceMonitoring";
import AIDoctorChat from "../dashboard/_components/AIDoctorChat";
import ChatHistory from "../dashboard/_components/ChatHistory";
import DailyTracker from "../dashboard/_components/DailyTracker";
import DailyCheckInHistory from "../dashboard/_components/DailyCheckInHistory";
import MedicationReminders from "../dashboard/_components/MedicationReminders";
import RiskScore from "../dashboard/_components/RiskScore";
import PatientNav from "../dashboard/_components/PatientNav";
import { useRouter } from "next/navigation";
import { getSurgeryBaseline } from "@/lib/surgeryBaselines";
import { Sparkles } from "lucide-react";

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50" suppressHydrationWarning>
        <PatientNav />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-green-700 font-medium">Loading your health dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patientExists || !status) {
    return null; // Will redirect to onboarding
  }

  const baseline = getSurgeryBaseline(status.patient.surgery);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50" suppressHydrationWarning>
      <PatientNav />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl" suppressHydrationWarning>
        {/* Welcome Header - Enhanced */}
        <div className="mb-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl shadow-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold flex items-center gap-3 mb-3">
                <Sparkles className="h-10 w-10 animate-pulse" />
                Welcome back, {status.patient.name}!
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/30">
                  {status.patient.surgery}
                </span>
                <span className="text-green-50 text-base">
                  Day <span className="font-bold text-xl">{status.daysSinceSurgery}</span> of Recovery
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
                <div className="text-6xl font-black text-white drop-shadow-lg">
                  {status.daysSinceSurgery}
                </div>
                <div className="text-sm text-green-100 font-medium mt-1">days strong</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Current Status */}
        <Card className="bg-white shadow-xl border-2 border-green-100 hover:shadow-2xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <CardTitle className="text-green-900 text-xl font-bold">Recovery Status</CardTitle>
            <CardDescription className="text-green-700">Your latest check-in data</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {status.lastSession ? (
              <div className="space-y-5">
                <div className="text-center p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl border-2 border-green-200">
                  <span className="text-sm text-green-800 font-semibold uppercase tracking-wide">Current Pain Level</span>
                  <p className={`text-7xl font-black mt-3 mb-2 drop-shadow-sm ${
                    status.lastSession.painScore >= 7 
                      ? "text-red-600" 
                      : status.lastSession.painScore >= 4
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}>
                    {status.lastSession.painScore}<span className="text-3xl text-gray-400">/10</span>
                  </p>
                  {baseline && (
                    <p className="text-xs text-green-700 font-medium bg-white/50 inline-block px-3 py-1 rounded-full">
                      Normal range: {baseline.normalPainMin}-{baseline.normalPainMax}/10
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <span className="text-sm text-blue-900 font-semibold">Emotional State</span>
                  <p className="text-xl font-bold capitalize text-blue-700">{status.lastSession.emotion}</p>
                </div>

                {status.lastSession.symptoms && status.lastSession.symptoms.length > 0 && (
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    <span className="text-sm text-orange-900 font-semibold mb-2 block">Recent Symptoms</span>
                    <div className="flex flex-wrap gap-2">
                      {status.lastSession.symptoms.map((symptom, index) => (
                        <Badge key={index} className="bg-orange-100 text-orange-800 border-orange-300 px-3 py-1">{symptom}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 pt-3 border-t text-center">
                  Last updated: {new Date(status.lastSession.createdAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 font-medium mb-2">No check-ins yet</p>
                <p className="text-sm text-green-600">Start your first voice check-in below!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="bg-white shadow-xl border-2 border-green-100 hover:shadow-2xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <CardTitle className="text-green-900 text-xl font-bold">Alert Status</CardTitle>
            <CardDescription className="text-green-700">Current health alerts</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {status.lastAlert ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Badge className={
                    status.lastAlert.level === "RED" 
                      ? "bg-red-500 hover:bg-red-600 text-lg px-4 py-2" 
                      : status.lastAlert.level === "ORANGE"
                      ? "bg-orange-500 hover:bg-orange-600 text-lg px-4 py-2"
                      : "bg-green-500 hover:bg-green-600 text-lg px-4 py-2"
                  }>
                    {status.lastAlert.level}
                  </Badge>
                  <span className="text-sm font-medium text-gray-700">{status.lastAlert.reason}</span>
                </div>

                {status.lastAlert.level === "RED" && (
                  <div className="border-l-4 border-red-500 pl-4 py-3 bg-red-50 rounded-r-lg">
                    <p className="text-sm font-semibold text-red-900 flex items-center gap-2">
                      Critical Alert
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Please contact your healthcare provider immediately.
                    </p>
                  </div>
                )}

                {status.lastAlert.level === "ORANGE" && (
                  <div className="border-l-4 border-orange-500 pl-4 py-3 bg-orange-50 rounded-r-lg">
                    <p className="text-sm font-semibold text-orange-900">
                      Warning
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      Please monitor your symptoms and contact your doctor if they worsen.
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-500 pt-2 border-t">
                  {new Date(status.lastAlert.createdAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-3 bg-green-50 px-6 py-4 rounded-full">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <Badge className="bg-green-500 hover:bg-green-600 text-lg px-4 py-2">ALL CLEAR</Badge>
                </div>
                <p className="text-sm text-green-700 mt-4 font-medium">No alerts at this time</p>
                <p className="text-xs text-gray-500 mt-1">Keep up the good recovery!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Voice Monitoring & AI Chat */}
      <div id="monitoring" className="scroll-mt-20 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-1 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
          <h2 className="text-3xl font-bold text-green-900">Health Monitoring</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <VoiceMonitoring 
            patientId={status.patient.id} 
            onSubmit={handleSessionComplete}
          />
          <div id="chat">
            <AIDoctorChat 
              patientId={status.patient.id}
              onSessionUpdate={handleSessionComplete}
            />
          </div>
        </div>
      </div>

      {/* Daily Tracking & Medication - NEW */}
      <div id="trends" className="scroll-mt-20 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-1 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
          <h2 className="text-3xl font-bold text-green-900">Recovery Tracking</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <DailyTracker 
            patientId={status.patient.id}
            daysSinceSurgery={status.daysSinceSurgery}
          />
          <div id="medications">
            <MedicationReminders patientId={status.patient.id} />
          </div>
        </div>
      </div>

      {/* Risk Score */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-1 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
          <h2 className="text-3xl font-bold text-green-900">Risk Assessment</h2>
        </div>
        <RiskScore 
          patientId={status.patient.id}
          surgeryType={status.patient.surgery}
          currentPainScore={status.lastSession?.painScore || 0}
        />
      </div>

      {/* Chat History */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-1 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
          <h2 className="text-3xl font-bold text-green-900">Conversation History</h2>
        </div>
        <ChatHistory patientId={status.patient.id} />
      </div>

      {/* Daily Check-In History */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-1 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
          <h2 className="text-3xl font-bold text-green-900">Daily Check-In History</h2>
        </div>
        <DailyCheckInHistory patientId={status.patient.id} />
      </div>

      {/* Recovery Guidelines */}
      {baseline && (
        <Card className="mt-6 mb-8 bg-white shadow-xl border-2 border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-b">
            <CardTitle className="text-2xl font-bold">Recovery Guidelines for {status.patient.surgery}</CardTitle>
            <CardDescription className="text-green-50">Important information for your recovery journey</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-l-4 border-green-600">
                <strong className="text-green-900 text-lg">Expected Recovery Time:</strong>
                <span className="text-green-700 font-bold text-2xl">{baseline.recoveryDays} days</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-l-4 border-green-600">
                <strong className="text-green-900 text-lg">Normal Pain Range:</strong>
                <span className="text-green-700 font-bold text-2xl">{baseline.normalPainMin}-{baseline.normalPainMax}/10</span>
              </div>
              <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                <strong className="text-blue-900 text-lg mb-3 block">Expected Symptoms:</strong>
                <ul className="space-y-2 ml-2">
                  {baseline.expectedSymptoms.map((symptom, index) => (
                    <li key={index} className="flex items-start gap-2 text-blue-800">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-5 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-300">
                <strong className="text-red-900 text-lg mb-3 block flex items-center gap-2">
                  Contact Your Doctor If You Experience:
                </strong>
                <ul className="space-y-2 ml-2">
                  {baseline.criticalSymptoms.map((symptom, index) => (
                    <li key={index} className="flex items-start gap-2 text-red-800 font-medium">
                      <span className="text-red-500 mt-1 font-bold">!</span>
                      <span>{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
