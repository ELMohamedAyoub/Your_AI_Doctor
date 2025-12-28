// Risk stratification calculator
export interface RiskFactors {
  age: number;
  bmi?: number;
  smokingStatus: 'never' | 'former' | 'current';
  diabetes: boolean;
  heartDisease: boolean;
  immunocompromised: boolean;
  surgeryType: string;
  currentPainScore: number;
  hasInfectionSigns: boolean;
  hasDVTSymptoms: boolean;
}

export interface RiskScore {
  overall: number; // 0-100
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  infectionRisk: number;
  dvtRisk: number;
  readmissionRisk: number;
  recommendations: string[];
}

export function calculateRiskScore(factors: RiskFactors): RiskScore {
  let score = 0;
  const recommendations: string[] = [];

  // Age factor (0-20 points)
  if (factors.age > 75) {
    score += 20;
    recommendations.push("Advanced age requires closer monitoring");
  } else if (factors.age > 65) {
    score += 15;
  } else if (factors.age > 50) {
    score += 10;
  } else if (factors.age < 30) {
    score += 5; // Young age can also be a factor in some surgeries
  }

  // BMI factor (0-15 points)
  if (factors.bmi) {
    if (factors.bmi > 40) {
      score += 15;
      recommendations.push("Obesity increases infection and healing complications");
    } else if (factors.bmi > 30) {
      score += 10;
    } else if (factors.bmi < 18.5) {
      score += 8;
      recommendations.push("Low BMI may affect healing");
    }
  }

  // Smoking (0-15 points)
  if (factors.smokingStatus === 'current') {
    score += 15;
    recommendations.push("Smoking significantly impairs wound healing - consider cessation");
  } else if (factors.smokingStatus === 'former') {
    score += 5;
  }

  // Comorbidities (0-30 points)
  if (factors.diabetes) {
    score += 15;
    recommendations.push("Diabetes increases infection risk - monitor glucose levels");
  }
  if (factors.heartDisease) {
    score += 10;
    recommendations.push("Cardiovascular disease requires cardiac monitoring");
  }
  if (factors.immunocompromised) {
    score += 20;
    recommendations.push("Immunocompromised status requires prophylactic measures");
  }

  // Current symptoms (0-30 points)
  if (factors.hasDVTSymptoms) {
    score += 30;
    recommendations.push("DVT symptoms detected - immediate medical evaluation needed");
  }
  if (factors.hasInfectionSigns) {
    score += 25;
    recommendations.push("Infection signs present - surgeon notification required");
  }
  if (factors.currentPainScore >= 8) {
    score += 15;
    recommendations.push("Severe pain requires pain management review");
  } else if (factors.currentPainScore >= 6) {
    score += 10;
  }

  // Calculate specific risks
  const infectionRisk = calculateInfectionRisk(factors);
  const dvtRisk = calculateDVTRisk(factors);
  const readmissionRisk = calculateReadmissionRisk(factors, score);

  // Determine overall level
  let level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  if (score >= 75) {
    level = 'CRITICAL';
    recommendations.push("Critical risk level - daily monitoring required");
  } else if (score >= 50) {
    level = 'HIGH';
    recommendations.push("High risk - enhanced monitoring protocol");
  } else if (score >= 25) {
    level = 'MODERATE';
    recommendations.push("Moderate risk - standard post-op care");
  } else {
    level = 'LOW';
    recommendations.push("Low risk - routine follow-up appropriate");
  }

  return {
    overall: Math.min(score, 100),
    level,
    infectionRisk,
    dvtRisk,
    readmissionRisk,
    recommendations
  };
}

function calculateInfectionRisk(factors: RiskFactors): number {
  let risk = 10; // Baseline
  if (factors.diabetes) risk += 25;
  if (factors.smokingStatus === 'current') risk += 20;
  if (factors.immunocompromised) risk += 30;
  if (factors.bmi && factors.bmi > 30) risk += 15;
  if (factors.hasInfectionSigns) risk += 50;
  return Math.min(risk, 100);
}

function calculateDVTRisk(factors: RiskFactors): number {
  let risk = 5; // Baseline
  if (factors.age > 60) risk += 15;
  if (factors.bmi && factors.bmi > 30) risk += 20;
  if (factors.smokingStatus === 'current') risk += 15;
  if (factors.heartDisease) risk += 20;
  if (factors.hasDVTSymptoms) risk += 60;
  return Math.min(risk, 100);
}

function calculateReadmissionRisk(factors: RiskFactors, overallScore: number): number {
  let risk = overallScore * 0.5; // Base on overall risk
  if (factors.currentPainScore >= 7) risk += 20;
  if (factors.diabetes || factors.heartDisease) risk += 15;
  return Math.min(risk, 100);
}

export function getRiskColor(level: string): string {
  switch (level) {
    case 'CRITICAL': return 'red';
    case 'HIGH': return 'orange';
    case 'MODERATE': return 'yellow';
    case 'LOW': return 'green';
    default: return 'gray';
  }
}
