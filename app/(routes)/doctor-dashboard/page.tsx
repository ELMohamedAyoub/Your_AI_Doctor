"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  AlertTriangle, 
  Calendar,
  Activity,
  TrendingUp,
  Clock,
  MessageSquare,
  Mic,
  ChevronRight,
  ArrowUpDown,
  Pill
} from "lucide-react";
import { toast } from "sonner";

interface Patient {
  id: string;
  fullName: string;
  email: string;
  surgeryType: string | null;
  surgeryDate: Date | null;
  riskScore: number;
  daysSinceSurgery: number | null;
  _count: {
    sessions: number;
  };
}

interface DailyEntry {
  id: string;
  painScore: number;
  mobilityScore: number;
  sleepHours: number;
  sleepQuality: number;
  steps: number | null;
  exerciseMinutes: number | null;
  notes: string | null;
  createdAt: Date;
}

interface Session {
  id: string;
  emotion: string | null;
  painScore: number | null;
  mobility: string | null;
  transcription: string | null;
  summary: string | null;
  redFlags: string[] | null;
  createdAt: Date;
}

interface MedicationLog {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  status: string; // "taken", "skipped", "missed"
  scheduledTime: string;
  takenAt: Date | null;
  createdAt: Date;
}

interface DayHistory {
  date: string;
  timestamp: Date;
  dailyTracking: DailyEntry[];
  medicationLogs: MedicationLog[];
  chatSessions: Session[];
  voiceCheckIns: Session[];
}

interface PatientStats {
  totalCheckIns: number;
  voiceCheckIns: number;
  dailyEntries: number;
  medicationLogs: number;
  medicationAdherence: number | null;
  avgPainScore: string | null;
  avgMobilityScore: string | null;
  latestPainScore: number | null;
  latestMobilityScore: number | null;
  daysSinceSurgery: number | null;
}

export default function DoctorDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientHistory, setPatientHistory] = useState<DayHistory[]>([]);
  const [patientStats, setPatientStats] = useState<PatientStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'risk' | 'date' | 'name'>('risk');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/doctor/patients');
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients);
      } else {
        toast.error('Failed to load patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Network error loading patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientHistory = async (patientId: string) => {
    try {
      const response = await fetch(`/api/doctor/patient/${patientId}/history`);
      if (response.ok) {
        const data = await response.json();
        setPatientHistory(data.history);
        setPatientStats(data.stats);
      } else {
        toast.error('Failed to load patient history');
      }
    } catch (error) {
      console.error('Error fetching patient history:', error);
      toast.error('Network error loading history');
    }
  };

  const handlePatientSelect = async (patient: Patient) => {
    setSelectedPatient(patient);
    await fetchPatientHistory(patient.id);
  };

  const getRiskBadge = (score: number) => {
    if (score >= 7) return <Badge className="bg-red-100 text-red-800 border-red-200">High Risk</Badge>;
    if (score >= 4) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium Risk</Badge>;
    return <Badge className="bg-green-100 text-green-800 border-green-200">Low Risk</Badge>;
  };

  const sortedPatients = [...patients].sort((a, b) => {
    if (sortBy === 'risk') return b.riskScore - a.riskScore;
    if (sortBy === 'date') {
      const dateA = a.surgeryDate ? new Date(a.surgeryDate).getTime() : 0;
      const dateB = b.surgeryDate ? new Date(b.surgeryDate).getTime() : 0;
      return dateB - dateA;
    }
    return a.fullName.localeCompare(b.fullName);
  });

  const filteredPatients = sortedPatients.filter(p => 
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.surgeryType && p.surgeryType.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Doctor Dashboard</h1>
          <p className="text-green-100">Monitor all patients and their recovery progress</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Patients ({filteredPatients.length})
              </CardTitle>
              <CardDescription>Select a patient to view details</CardDescription>
              
              {/* Search */}
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Sort */}
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant={sortBy === 'risk' ? 'default' : 'outline'}
                  onClick={() => setSortBy('risk')}
                  className={sortBy === 'risk' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Risk
                </Button>
                <Button
                  size="sm"
                  variant={sortBy === 'date' ? 'default' : 'outline'}
                  onClick={() => setSortBy('date')}
                  className={sortBy === 'date' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Date
                </Button>
                <Button
                  size="sm"
                  variant={sortBy === 'name' ? 'default' : 'outline'}
                  onClick={() => setSortBy('name')}
                  className={sortBy === 'name' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <ArrowUpDown className="h-3 w-3 mr-1" />
                  Name
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-muted-foreground py-8">Loading patients...</div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No patients found</div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredPatients.map(patient => (
                    <button
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedPatient?.id === patient.id
                          ? 'bg-green-50 border-green-300 shadow-sm'
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="font-medium">{patient.fullName}</div>
                        {getRiskBadge(patient.riskScore)}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>{patient.surgeryType || 'No surgery type'}</div>
                        {patient.daysSinceSurgery !== null && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Day {patient.daysSinceSurgery} post-op
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {patient._count.sessions} check-ins
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Details & History */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedPatient ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 text-green-300" />
                  <p className="text-lg">Select a patient to view their history</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Patient Stats */}
                {patientStats && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Activity className="h-8 w-8 mx-auto mb-2 text-red-500" />
                          <div className="text-2xl font-bold">
                            {patientStats.latestPainScore || '-'}
                          </div>
                          <div className="text-xs text-muted-foreground">Current Pain</div>
                          {patientStats.avgPainScore && (
                            <div className="text-xs text-green-600 mt-1">
                              Avg: {patientStats.avgPainScore}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                          <div className="text-2xl font-bold">
                            {patientStats.latestMobilityScore || '-'}
                          </div>
                          <div className="text-xs text-muted-foreground">Mobility</div>
                          {patientStats.avgMobilityScore && (
                            <div className="text-xs text-green-600 mt-1">
                              Avg: {patientStats.avgMobilityScore}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                          <div className="text-2xl font-bold">{patientStats.totalCheckIns}</div>
                          <div className="text-xs text-muted-foreground">Total Check-ins</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Mic className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <div className="text-2xl font-bold">{patientStats.voiceCheckIns}</div>
                          <div className="text-xs text-muted-foreground">Voice Check-ins</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Pill className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                          <div className="text-2xl font-bold">
                            {patientStats.medicationAdherence !== null 
                              ? `${patientStats.medicationAdherence}%` 
                              : '-'}
                          </div>
                          <div className="text-xs text-muted-foreground">Medication Adherence</div>
                          {patientStats.medicationLogs > 0 && (
                            <div className="text-xs text-green-600 mt-1">
                              {patientStats.medicationLogs} logs
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Daily Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Patient History Timeline</CardTitle>
                    <CardDescription>
                      Showing all activity for {selectedPatient.fullName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {patientHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No activity recorded yet
                      </div>
                    ) : (
                      <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2">
                        {patientHistory.map((day, index) => (
                          <div key={index} className="border-l-2 border-green-200 pl-4 pb-4">
                            {/* Date Header */}
                            <div className="flex items-center gap-2 mb-3 -ml-[25px]">
                              <div className="w-4 h-4 rounded-full bg-green-500 border-4 border-white"></div>
                              <div className="font-semibold text-lg">{day.date}</div>
                            </div>

                            {/* Daily Tracking Entries */}
                            {day.dailyTracking.map((entry) => (
                              <Card key={entry.id} className="mb-3 bg-blue-50 border-blue-200">
                                <CardContent className="pt-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Activity className="h-4 w-4 text-blue-600" />
                                      <span className="font-medium text-sm">Daily Health Log</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(entry.createdAt).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-3 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Pain:</span>
                                      <span className="ml-2 font-semibold text-red-600">{entry.painScore}/10</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Mobility:</span>
                                      <span className="ml-2 font-semibold text-blue-600">{entry.mobilityScore}/10</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Sleep:</span>
                                      <span className="ml-2 font-semibold text-purple-600">
                                        {entry.sleepHours}h ({entry.sleepQuality}/10)
                                      </span>
                                    </div>
                                  </div>
                                  {entry.steps && (
                                    <div className="text-sm mt-2">
                                      <span className="text-muted-foreground">Steps:</span>
                                      <span className="ml-2 font-medium">{entry.steps.toLocaleString()}</span>
                                    </div>
                                  )}
                                  {entry.exerciseMinutes && (
                                    <div className="text-sm mt-1">
                                      <span className="text-muted-foreground">Exercise:</span>
                                      <span className="ml-2 font-medium">{entry.exerciseMinutes} min</span>
                                    </div>
                                  )}
                                  {entry.notes && (
                                    <div className="text-sm mt-2 p-2 bg-white rounded border">
                                      <span className="text-muted-foreground">Notes:</span>
                                      <p className="mt-1">{entry.notes}</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}

                            {/* Voice Check-ins */}
                            {day.voiceCheckIns.map((session) => (
                              <Card key={session.id} className="mb-3 bg-green-50 border-green-200">
                                <CardContent className="pt-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Mic className="h-4 w-4 text-green-600" />
                                      <span className="font-medium text-sm">Voice Check-in</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(session.createdAt).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  {/* Language indicator */}
                                  {session.language && (
                                    <div className="flex items-center gap-1 mb-2">
                                      <span className="text-lg">
                                        {session.language === 'fr' ? '🇫🇷' : session.language === 'en' ? '🇬🇧' : '🌐'}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {session.language === 'fr' ? 'French' : session.language === 'en' ? 'English' : session.language}
                                      </span>
                                    </div>
                                  )}
                                  {session.emotion && (
                                    <div className="text-sm mb-2">
                                      <span className="text-muted-foreground">Mood:</span>
                                      <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                                        {session.emotion}
                                      </Badge>
                                    </div>
                                  )}
                                  {session.painScore !== null && (
                                    <div className="text-sm mb-2">
                                      <span className="text-muted-foreground">Pain:</span>
                                      <span className="ml-2 font-semibold text-red-600">{session.painScore}/10</span>
                                    </div>
                                  )}
                                  {session.transcription && (
                                    <div className="text-sm p-2 bg-white rounded border">
                                      <span className="text-muted-foreground font-medium">Transcription:</span>
                                      <p className="mt-1 text-gray-700">{session.transcription}</p>
                                    </div>
                                  )}
                                  {session.summary && (
                                    <div className="text-sm p-2 bg-green-100 rounded border border-green-200 mt-2">
                                      <span className="text-muted-foreground font-medium">AI Summary:</span>
                                      <p className="mt-1">{session.summary}</p>
                                    </div>
                                  )}
                                  {session.redFlags && session.redFlags.length > 0 && (
                                    <div className="mt-2">
                                      <div className="flex items-center gap-1 text-red-600 text-sm font-medium mb-1">
                                        <AlertTriangle className="h-4 w-4" />
                                        Red Flags
                                      </div>
                                      <ul className="text-sm space-y-1">
                                        {session.redFlags.map((flag, i) => (
                                          <li key={i} className="text-red-700">• {flag}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}

                            {/* Medication Logs */}
                            {day.medicationLogs && day.medicationLogs.length > 0 && (
                              <Card className="mb-3 bg-amber-50 border-amber-200">
                                <CardContent className="pt-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <Pill className="h-4 w-4 text-amber-600" />
                                      <span className="font-medium text-sm">Medication Log ({day.medicationLogs.length} entries)</span>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    {day.medicationLogs.map((log: MedicationLog) => (
                                      <div key={log.id} className="flex items-center justify-between p-2 bg-white rounded border text-sm">
                                        <div className="flex items-center gap-2">
                                          <Badge className={
                                            log.status === 'taken' 
                                              ? 'bg-green-100 text-green-800 border-green-200'
                                              : log.status === 'skipped'
                                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                              : 'bg-red-100 text-red-800 border-red-200'
                                          }>
                                            {log.status.toUpperCase()}
                                          </Badge>
                                          <span className="font-medium">{log.medicationName}</span>
                                          <span className="text-muted-foreground">({log.dosage})</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {log.takenAt 
                                            ? new Date(log.takenAt).toLocaleTimeString()
                                            : log.scheduledTime}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Chat Sessions */}
                            {day.chatSessions.map((session) => (
                              <Card key={session.id} className="mb-3 bg-purple-50 border-purple-200">
                                <CardContent className="pt-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <MessageSquare className="h-4 w-4 text-purple-600" />
                                      <span className="font-medium text-sm">Chat Session</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(session.createdAt).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  {session.summary && (
                                    <div className="text-sm p-2 bg-white rounded border">
                                      <p>{session.summary}</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
