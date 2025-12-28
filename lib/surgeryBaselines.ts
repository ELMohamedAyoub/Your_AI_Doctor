export interface SurgeryBaseline {
  name: string;
  normalPainMin: number;
  normalPainMax: number;
  expectedSymptoms: string[];
  criticalSymptoms: string[];
  recoveryDays: number;
}

export const SURGERY_BASELINES: Record<string, SurgeryBaseline> = {
  "Appendectomy": {
    name: "Appendectomy",
    normalPainMin: 1,
    normalPainMax: 4,
    expectedSymptoms: ["mild pain", "fatigue", "nausea"],
    criticalSymptoms: ["fever", "severe pain", "vomiting", "bleeding"],
    recoveryDays: 7
  },
  "Knee Replacement": {
    name: "Knee Replacement",
    normalPainMin: 3,
    normalPainMax: 6,
    expectedSymptoms: ["swelling", "stiffness", "bruising", "pain"],
    criticalSymptoms: ["severe swelling", "fever", "bleeding", "inability to move"],
    recoveryDays: 90
  },
  "Cesarean Section": {
    name: "Cesarean Section",
    normalPainMin: 2,
    normalPainMax: 5,
    expectedSymptoms: ["cramping", "bleeding", "fatigue", "incision pain"],
    criticalSymptoms: ["heavy bleeding", "fever", "foul discharge", "severe pain"],
    recoveryDays: 42
  }
};

export function isPainAbnormal(surgery: string, painScore: number): boolean {
  const baseline = SURGERY_BASELINES[surgery];
  if (!baseline) return false;
  
  return painScore < baseline.normalPainMin || painScore > baseline.normalPainMax;
}

export function getSurgeryBaseline(surgery: string): SurgeryBaseline | null {
  return SURGERY_BASELINES[surgery] || null;
}

export const SUPPORTED_SURGERIES = Object.keys(SURGERY_BASELINES);
