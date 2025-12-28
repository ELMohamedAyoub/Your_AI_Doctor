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
        const { sessions } = await response.json();
        const formatted = sessions.map((s: any) => ({
          date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          painScore: s.painScore,
          mobilityScore: s.emotion === 'good' ? 8 : s.emotion === 'okay' ? 5 : 3,
          sleepQuality: 7
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
      const response = await fetch("/api/daily-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          painScore,
          mobilityScore,
          sleepHours,
          sleepQuality,
          steps: steps ? parseInt(steps) : undefined,
          notes
        })
      });

      if (response.ok) {
        setShowForm(false);
        fetchTrendData();
        // Reset form
        setPainScore(5);
        setMobilityScore(5);
        setSleepHours(7);
        setSleepQuality(5);
        setSteps("");
        setNotes("");
      }
    } catch (error) {
      console.error("Error submitting tracking data:", error);
    } finally {
      setLoading(false);
    }
  };

  const trend = calculateTrend(trendData);
  const phase = getRecoveryPhase(daysSinceSurgery);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Daily Recovery Tracking</CardTitle>
            <CardDescription>{phase}</CardDescription>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
            {showForm ? "Cancel" : "+ Log Today"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trend Indicator */}
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
            <div>
              <Label>Steps Today (optional)</Label>
              <Input type="number" value={steps} onChange={(e) => setSteps(e.target.value)} placeholder="e.g., 1500" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any observations or concerns..." rows={3} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save Entry"}
            </Button>
          </form>
        )}

        {/* Trends Chart */}
        {trendData.length > 0 && (
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
