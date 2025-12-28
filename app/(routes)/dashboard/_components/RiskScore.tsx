"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Activity, Heart, TrendingUp } from "lucide-react";
import { calculateRiskScore, getRiskColor, type RiskFactors } from "@/lib/riskCalculator";

interface RiskScoreProps {
  patientId: string;
  surgeryType: string;
  currentPainScore: number;
}

export default function RiskScore({ patientId, surgeryType, currentPainScore }: RiskScoreProps) {
  const [riskData, setRiskData] = useState<ReturnType<typeof calculateRiskScore> | null>(null);

  useEffect(() => {
    // In production, fetch patient data from API
    const mockFactors: RiskFactors = {
      age: 58,
      bmi: 28,
      smokingStatus: 'never',
      diabetes: false,
      heartDisease: false,
      immunocompromised: false,
      surgeryType,
      currentPainScore,
      hasInfectionSigns: false,
      hasDVTSymptoms: false
    };

    const score = calculateRiskScore(mockFactors);
    setRiskData(score);
  }, [surgeryType, currentPainScore]);

  if (!riskData) return null;

  const riskColor = getRiskColor(riskData.level);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Risk Assessment
        </CardTitle>
        <CardDescription>Current recovery risk stratification</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Risk Score */}
        <div className="text-center p-6 bg-muted rounded-lg">
          <div className="relative inline-flex items-center justify-center w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={riskColor === 'red' ? '#ef4444' : riskColor === 'orange' ? '#f97316' : riskColor === 'yellow' ? '#eab308' : '#22c55e'}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(riskData.overall / 100) * 352} 352`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{riskData.overall}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
          <Badge 
            className="mt-4"
            style={{
              backgroundColor: riskColor === 'red' ? '#ef4444' : riskColor === 'orange' ? '#f97316' : riskColor === 'yellow' ? '#eab308' : '#22c55e'
            }}
          >
            {riskData.level} RISK
          </Badge>
        </div>

        {/* Specific Risk Breakdown */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Infection Risk</span>
              <span className="text-sm font-medium">{riskData.infectionRisk}%</span>
            </div>
            <Progress value={riskData.infectionRisk} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">DVT Risk</span>
              <span className="text-sm font-medium">{riskData.dvtRisk}%</span>
            </div>
            <Progress value={riskData.dvtRisk} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Readmission Risk</span>
              <span className="text-sm font-medium">{riskData.readmissionRisk}%</span>
            </div>
            <Progress value={riskData.readmissionRisk} className="h-2" />
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-2 pt-2 border-t">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Recommendations
          </h4>
          <ul className="space-y-1">
            {riskData.recommendations.slice(0, 3).map((rec, idx) => (
              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Critical Alert */}
        {riskData.level === 'CRITICAL' && (
          <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-semibold">Critical Risk Detected</span>
            </div>
            <p className="text-xs text-red-700 mt-1">
              Immediate medical review recommended. Contact your surgeon's office.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
