"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, TrendingDown, Minus, Activity, Moon, Footprints } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { calculateTrend, getRecoveryPhase, type TrendData } from "@/lib/dailyTracker";
import { toast } from "sonner";

interface DailyTrackerProps {
  patientId: string;
  daysSinceSurgery: number;
}

export default function DailyTracker({ patientId, daysSinceSurgery }: DailyTrackerProps) {
  const [painScore, setPainScore] = useState(5);
  const [mobilityScore, setMobilityScore] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [steps, setSteps] = useState("");
  const [exerciseMinutes, setExerciseMinutes] = useState("");
  const [notes, setNotes] = useState("");
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTrendData();
  }, [patientId]);

  const fetchTrendData = async () => {
    try {
      const response = await fetch(`/api/daily-tracking?patientId=${patientId}&days=14`);
      if (response.ok) {
        const { entries } = await response.json();
        if (!entries || entries.length === 0) {
          setTrendData([]);
          return;
        }
        const formatted = entries.map((entry: any) => ({
          date: new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          painScore: entry.painScore,
          mobilityScore: entry.mobilityScore,
          sleepQuality: entry.sleepQuality
        }));
        setTrendData(formatted);
      }
    } catch (error) {
      console.error("Error fetching trend data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        patientId,
        painScore,
        mobilityScore,
        sleepHours,
        sleepQuality,
        steps: steps ? parseInt(steps) : 0,
        exerciseMinutes: exerciseMinutes ? parseInt(exerciseMinutes) : 0,
        notes
      };
      
      console.log('Submitting daily tracking:', payload);

      const response = await fetch("/api/daily-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Response:', response.status, data);

      if (response.ok) {
        toast.success('Entry saved successfully!');
        setShowForm(false);
        await fetchTrendData();
        // Reset form
        setPainScore(5);
        setMobilityScore(5);
        setSleepHours(7);
        setSleepQuality(5);
        setSteps("");
        setExerciseMinutes("");
        setNotes("");
      } else {
        toast.error(data.error || 'Failed to save entry');
      }
    } catch (error) {
      console.error("Error submitting tracking data:", error);
      toast.error('Network error - please try again');
    } finally {
      setLoading(false);
    }
  };

  const trend = calculateTrend(trendData);
  const phase = getRecoveryPhase(daysSinceSurgery);

  // Calculate detailed recovery status
  const getDetailedStatus = () => {
    if (trendData.length === 0) return null;
    
    const latest = trendData[trendData.length - 1];
    const painLevel = latest.painScore;
    const mobilityLevel = latest.mobilityScore;
    const sleepLevel = latest.sleepQuality;
    
    // Calculate average scores
    const avgPain = trendData.reduce((sum, d) => sum + d.painScore, 0) / trendData.length;
    const avgMobility = trendData.reduce((sum, d) => sum + d.mobilityScore, 0) / trendData.length;
    const avgSleep = trendData.reduce((sum, d) => sum + d.sleepQuality, 0) / trendData.length;
    
    return {
      painLevel,
      mobilityLevel,
      sleepLevel,
      avgPain: avgPain.toFixed(1),
      avgMobility: avgMobility.toFixed(1),
      avgSleep: avgSleep.toFixed(1),
      message: getStatusMessage(painLevel, mobilityLevel, sleepLevel, trend)
    };
  };

  const getStatusMessage = (pain: number, mobility: number, sleep: number, trend: string) => {
    if (trend === 'improving') {
      return "Great progress! Your recovery metrics are improving steadily.";
    } else if (trend === 'declining') {
      return "Some metrics need attention. Consider discussing with your doctor.";
    } else {
      if (pain <= 3 && mobility >= 7 && sleep >= 7) {
        return "Excellent recovery! You're doing very well.";
      } else if (pain <= 5 && mobility >= 5 && sleep >= 5) {
        return "Recovery is progressing normally. Keep up the good work!";
      } else {
        return "Continue monitoring your progress closely.";
      }
    }
  };

  const detailedStatus = getDetailedStatus();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Daily Recovery Tracking</CardTitle>
            <CardDescription>{phase}</CardDescription>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"} className={showForm ? "border-green-300 text-green-700 hover:bg-green-50" : "bg-green-600 hover:bg-green-700 text-white"}>
            {showForm ? "Cancel" : "+ Log Today"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trend Indicator with detailed message */}
        {trendData.length > 0 && detailedStatus && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              {trend === 'improving' && (
                <>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Recovery Improving</span>
                </>
              )}
              {trend === 'stable' && (
                <>
                  <Minus className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Recovery Stable</span>
                </>
              )}
              {trend === 'declining' && (
                <>
                  <TrendingDown className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-600">Needs Attention</span>
                </>
              )}
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">{detailedStatus.message}</p>
            </div>
          </div>
        )}

        {/* Entry Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pain Level (0-10)</Label>
                <Input type="number" min="0" max="10" value={painScore} onChange={(e) => setPainScore(parseInt(e.target.value))} required />
              </div>
              <div>
                <Label>Mobility (0-10)</Label>
                <Input type="number" min="0" max="10" value={mobilityScore} onChange={(e) => setMobilityScore(parseInt(e.target.value))} required />
              </div>
              <div>
                <Label>Sleep Hours</Label>
                <Input type="number" min="0" max="24" step="0.5" value={sleepHours} onChange={(e) => setSleepHours(parseFloat(e.target.value))} required />
              </div>
              <div>
                <Label>Sleep Quality (0-10)</Label>
                <Input type="number" min="0" max="10" value={sleepQuality} onChange={(e) => setSleepQuality(parseInt(e.target.value))} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Steps Today (optional)</Label>
                <Input type="number" value={steps} onChange={(e) => setSteps(e.target.value)} placeholder="e.g., 1500" />
              </div>
              <div>
                <Label>Exercise Minutes (optional)</Label>
                <Input type="number" value={exerciseMinutes} onChange={(e) => setExerciseMinutes(e.target.value)} placeholder="e.g., 30" />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any observations or concerns..." rows={3} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white">
              {loading ? "Saving..." : "Save Entry"}
            </Button>
          </form>
        )}

        {/* Trends Chart */}
        {trendData.length > 0 ? (
          <div>
            <h4 className="text-sm font-medium mb-3">14-Day Trends</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="painScore" stroke="#ef4444" name="Pain" strokeWidth={2} />
                <Line type="monotone" dataKey="mobilityScore" stroke="#3b82f6" name="Mobility" strokeWidth={2} />
                <Line type="monotone" dataKey="sleepQuality" stroke="#8b5cf6" name="Sleep" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : !showForm && (
          <div className="text-center py-8 border-2 border-dashed border-green-200 rounded-lg bg-green-50">
            <Activity className="h-12 w-12 mx-auto mb-3 text-green-400" />
            <h4 className="text-lg font-medium text-green-900 mb-1">Start Tracking Your Recovery</h4>
            <p className="text-sm text-green-600 mb-4">Log your first daily entry to see trends and progress</p>
            <Button 
              onClick={() => setShowForm(true)} 
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Create First Entry
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 border rounded-lg text-center">
            <Activity className="h-5 w-5 mx-auto mb-1 text-red-500" />
            <div className="text-xl font-bold">{trendData[trendData.length - 1]?.painScore || '-'}</div>
            <div className="text-xs text-muted-foreground">Pain</div>
          </div>
          <div className="p-3 border rounded-lg text-center">
            <Footprints className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <div className="text-xl font-bold">{trendData[trendData.length - 1]?.mobilityScore || '-'}</div>
            <div className="text-xs text-muted-foreground">Mobility</div>
          </div>
          <div className="p-3 border rounded-lg text-center">
            <Moon className="h-5 w-5 mx-auto mb-1 text-purple-500" />
            <div className="text-xl font-bold">{trendData[trendData.length - 1]?.sleepQuality || '-'}</div>
            <div className="text-xs text-muted-foreground">Sleep</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
