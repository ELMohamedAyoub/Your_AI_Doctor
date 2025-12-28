"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Activity, Moon, Footprints, TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";
import { Loader2 } from "lucide-react";

interface DailyEntry {
  id: number;
  painScore: number;
  mobilityScore: number;
  sleepHours: number;
  sleepQuality: number;
  steps: number | null;
  exerciseMinutes: number | null;
  notes: string | null;
  createdAt: string;
}

interface GroupedEntries {
  [date: string]: DailyEntry[];
}

interface DailyCheckInHistoryProps {
  patientId: string;
}

export default function DailyCheckInHistory({ patientId }: DailyCheckInHistoryProps) {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [groupedEntries, setGroupedEntries] = useState<GroupedEntries>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [patientId]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/daily-tracking?patientId=${patientId}&days=30`);
      if (response.ok) {
        const { entries: fetchedEntries } = await response.json();
        setEntries(fetchedEntries || []);
        groupEntriesByDate(fetchedEntries || []);
      }
    } catch (error) {
      console.error("Error fetching daily check-in history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupEntriesByDate = (entries: DailyEntry[]) => {
    const grouped: GroupedEntries = {};
    
    entries.forEach((entry) => {
      const date = new Date(entry.createdAt);
      const dateKey = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });
    
    setGroupedEntries(grouped);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number, type: 'pain' | 'mobility' | 'sleep') => {
    if (type === 'pain') {
      if (score <= 3) return 'text-green-600 bg-green-50';
      if (score <= 6) return 'text-yellow-600 bg-yellow-50';
      return 'text-red-600 bg-red-50';
    } else {
      if (score >= 7) return 'text-green-600 bg-green-50';
      if (score >= 4) return 'text-yellow-600 bg-yellow-50';
      return 'text-red-600 bg-red-50';
    }
  };

  const getScoreLabel = (score: number, type: 'pain' | 'mobility' | 'sleep') => {
    if (type === 'pain') {
      if (score <= 3) return 'Low';
      if (score <= 6) return 'Moderate';
      return 'High';
    } else {
      if (score >= 7) return 'Good';
      if (score >= 4) return 'Fair';
      return 'Poor';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Check-In History
          </CardTitle>
          <CardDescription>Loading your recovery tracking history...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Check-In History
          </CardTitle>
          <CardDescription>Your daily recovery tracking entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No check-ins recorded yet</p>
            <p className="text-sm mt-1">Start logging your daily recovery progress</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Daily Check-In History
        </CardTitle>
        <CardDescription>
          {entries.length} entries across {Object.keys(groupedEntries).length} days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedEntries).reverse().map(([date, dayEntries]) => (
              <div key={date} className="border-l-2 border-green-200 pl-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <h3 className="font-semibold text-sm">{date}</h3>
                  <span className="text-xs text-gray-500">({dayEntries.length} {dayEntries.length === 1 ? 'entry' : 'entries'})</span>
                </div>
                
                <div className="space-y-3">
                  {dayEntries.map((entry) => (
                    <div key={entry.id} className="bg-white border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{formatTime(entry.createdAt)}</span>
                        </div>
                      </div>

                      {/* Health Metrics */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className={`p-2 rounded-md ${getScoreColor(entry.painScore, 'pain')}`}>
                          <div className="flex items-center gap-1 mb-1">
                            <Activity className="h-3 w-3" />
                            <span className="text-xs font-medium">Pain</span>
                          </div>
                          <div className="text-lg font-bold">{entry.painScore}/10</div>
                          <div className="text-xs">{getScoreLabel(entry.painScore, 'pain')}</div>
                        </div>

                        <div className={`p-2 rounded-md ${getScoreColor(entry.mobilityScore, 'mobility')}`}>
                          <div className="flex items-center gap-1 mb-1">
                            <Footprints className="h-3 w-3" />
                            <span className="text-xs font-medium">Mobility</span>
                          </div>
                          <div className="text-lg font-bold">{entry.mobilityScore}/10</div>
                          <div className="text-xs">{getScoreLabel(entry.mobilityScore, 'mobility')}</div>
                        </div>

                        <div className={`p-2 rounded-md ${getScoreColor(entry.sleepQuality, 'sleep')}`}>
                          <div className="flex items-center gap-1 mb-1">
                            <Moon className="h-3 w-3" />
                            <span className="text-xs font-medium">Sleep</span>
                          </div>
                          <div className="text-lg font-bold">{entry.sleepQuality}/10</div>
                          <div className="text-xs">{entry.sleepHours}h slept</div>
                        </div>
                      </div>

                      {/* Activity Data */}
                      {(entry.steps || entry.exerciseMinutes) && (
                        <div className="flex gap-4 text-xs text-gray-600 pt-2 border-t">
                          {entry.steps && (
                            <div className="flex items-center gap-1">
                              <Footprints className="h-3 w-3" />
                              <span>{entry.steps.toLocaleString()} steps</span>
                            </div>
                          )}
                          {entry.exerciseMinutes && (
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              <span>{entry.exerciseMinutes} min exercise</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notes */}
                      {entry.notes && (
                        <div className="text-xs bg-gray-50 p-2 rounded border-l-2 border-gray-300">
                          <span className="font-medium text-gray-700">Notes: </span>
                          <span className="text-gray-600">{entry.notes}</span>
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
