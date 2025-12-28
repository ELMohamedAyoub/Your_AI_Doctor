// Medication reminder types and utilities
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: 'daily' | 'twice-daily' | 'three-times-daily' | 'as-needed';
  times: string[]; // e.g., ["08:00", "20:00"]
  startDate: Date;
  endDate?: Date;
  instructions?: string;
  withFood?: boolean;
}

export interface MedicationLog {
  medicationId: string;
  takenAt: Date;
  status: 'taken' | 'missed' | 'skipped';
}

export function getNextDose(medication: Medication): Date | null {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  for (const time of medication.times) {
    const [hours, minutes] = time.split(':').map(Number);
    const doseTime = new Date(today + 'T' + time);
    
    if (doseTime > now) {
      return doseTime;
    }
  }
  
  // If all doses for today are passed, return first dose of tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split('T')[0];
  const [hours, minutes] = medication.times[0].split(':').map(Number);
  return new Date(tomorrowDate + 'T' + medication.times[0]);
}

export function isDueNow(medication: Medication, toleranceMinutes: number = 30): boolean {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  for (const time of medication.times) {
    const doseTime = new Date(today + 'T' + time);
    const diffMinutes = Math.abs((now.getTime() - doseTime.getTime()) / 1000 / 60);
    
    if (diffMinutes <= toleranceMinutes) {
      return true;
    }
  }
  
  return false;
}

export function calculateAdherence(logs: MedicationLog[], totalExpectedDoses: number): number {
  const takenCount = logs.filter(l => l.status === 'taken').length;
  return Math.round((takenCount / totalExpectedDoses) * 100);
}

export const COMMON_MEDICATIONS = [
  { name: "Acetaminophen (Tylenol)", dosage: "500mg", warning: "Max 3000mg/day" },
  { name: "Ibuprofen (Advil)", dosage: "400mg", warning: "Take with food" },
  { name: "Oxycodone", dosage: "5mg", warning: "Narcotic - may cause drowsiness" },
  { name: "Aspirin", dosage: "81mg", warning: "Blood thinner" },
  { name: "Antibiotic (Cephalexin)", dosage: "500mg", warning: "Complete full course" }
];
