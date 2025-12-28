// Daily tracking types and utilities
export interface DailyMetrics {
  painScore: number;
  mobilityScore: number; // 0-10: 0=bedridden, 10=normal activity
  sleepHours: number;
  sleepQuality: number; // 0-10
  steps?: number;
  exerciseMinutes?: number;
  notes?: string;
}

export interface TrendData {
  date: string;
  painScore: number;
  mobilityScore: number;
  sleepQuality: number;
}

export function calculateTrend(data: TrendData[]): 'improving' | 'stable' | 'declining' {
  if (data.length < 2) return 'stable';
  
  const recent = data.slice(-3);
  const avgPain = recent.reduce((sum, d) => sum + d.painScore, 0) / recent.length;
  const avgMobility = recent.reduce((sum, d) => sum + d.mobilityScore, 0) / recent.length;
  
  const older = data.slice(-6, -3);
  if (older.length === 0) return 'stable';
  
  const oldAvgPain = older.reduce((sum, d) => sum + d.painScore, 0) / older.length;
  const oldAvgMobility = older.reduce((sum, d) => sum + d.mobilityScore, 0) / older.length;
  
  const painImprovement = oldAvgPain - avgPain;
  const mobilityImprovement = avgMobility - oldAvgMobility;
  
  if (painImprovement > 1 || mobilityImprovement > 1) return 'improving';
  if (painImprovement < -1 || mobilityImprovement < -1) return 'declining';
  return 'stable';
}

export function getRecoveryPhase(daysSinceSurgery: number): string {
  if (daysSinceSurgery <= 7) return 'Acute Recovery (Week 1)';
  if (daysSinceSurgery <= 14) return 'Early Recovery (Week 2)';
  if (daysSinceSurgery <= 30) return 'Active Recovery (Weeks 3-4)';
  if (daysSinceSurgery <= 90) return 'Continued Recovery (Months 2-3)';
  return 'Late Recovery';
}
