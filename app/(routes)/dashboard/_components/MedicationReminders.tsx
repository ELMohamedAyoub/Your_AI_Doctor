"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill, Clock, Check, X, AlertTriangle } from "lucide-react";
import { getNextDose, isDueNow, type Medication } from "@/lib/medicationReminders";
import { toast } from "sonner";

interface MedicationRemindersProps {
  patientId: string;
}

// Mock medications - in production, fetch from database
const MOCK_MEDICATIONS: Medication[] = [
  {
    id: "1",
    name: "Acetaminophen",
    dosage: "500mg",
    frequency: "three-times-daily",
    times: ["08:00", "14:00", "20:00"],
    startDate: new Date(),
    instructions: "Take with or without food",
    withFood: false
  },
  {
    id: "2",
    name: "Ibuprofen",
    dosage: "400mg",
    frequency: "twice-daily",
    times: ["09:00", "21:00"],
    startDate: new Date(),
    instructions: "Take with food to avoid stomach upset",
    withFood: true
  },
  {
    id: "3",
    name: "Antibiotic",
    dosage: "500mg",
    frequency: "twice-daily",
    times: ["08:00", "20:00"],
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    instructions: "Complete full course",
    withFood: false
  }
];

export default function MedicationReminders({ patientId }: MedicationRemindersProps) {
  const [medications, setMedications] = useState<Medication[]>(MOCK_MEDICATIONS);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [takenMeds, setTakenMeds] = useState<Set<string>>(new Set());
  const [skippedMeds, setSkippedMeds] = useState<Set<string>>(new Set());

  // Load saved state from localStorage on mount
  useEffect(() => {
    const today = new Date().toDateString();
    const savedData = localStorage.getItem(`medications-${patientId}-${today}`);
    if (savedData) {
      try {
        const { taken, skipped } = JSON.parse(savedData);
        setTakenMeds(new Set(taken));
        setSkippedMeds(new Set(skipped));
      } catch (error) {
        console.error('Error loading medication state:', error);
      }
    }
  }, [patientId]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const today = new Date().toDateString();
    const data = {
      taken: Array.from(takenMeds),
      skipped: Array.from(skippedMeds),
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(`medications-${patientId}-${today}`, JSON.stringify(data));
  }, [takenMeds, skippedMeds, patientId]);

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check for due medications and send notifications
    medications.forEach(med => {
      if (isDueNow(med, 5)) {
        sendNotification(med);
      }
    });
  }, [currentTime, medications]);

  const sendNotification = (medication: Medication) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Medication Reminder', {
        body: `Time to take ${medication.name} (${medication.dosage})`,
        icon: '/pill-icon.png',
        tag: medication.id
      });
    }
  };

  const logMedication = async (medicationId: string, status: 'taken' | 'skipped') => {
    const medication = medications.find(m => m.id === medicationId);
    
    // Update local state
    if (status === 'taken') {
      setTakenMeds(prev => new Set([...prev, medicationId]));
      setSkippedMeds(prev => {
        const newSet = new Set(prev);
        newSet.delete(medicationId);
        return newSet;
      });
      toast.success(`${medication?.name} marked as taken`, {
        description: 'Great job staying on track!'
      });
    } else {
      setSkippedMeds(prev => new Set([...prev, medicationId]));
      setTakenMeds(prev => {
        const newSet = new Set(prev);
        newSet.delete(medicationId);
        return newSet;
      });
      toast.info(`${medication?.name} marked as skipped`);
    }
    
    // Save to database
    try {
      const currentTime = new Date();
      const currentHour = currentTime.getHours().toString().padStart(2, '0');
      const currentMinute = currentTime.getMinutes().toString().padStart(2, '0');
      const scheduledTime = `${currentHour}:${currentMinute}`;

      await fetch('/api/medications/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          patientId,
          medicationId, 
          medicationName: medication?.name || 'Unknown',
          dosage: medication?.dosage || 'N/A',
          status,
          scheduledTime,
        })
      });
    } catch (error) {
      console.error('Error saving medication log:', error);
      // Still show success to user even if DB save fails (localStorage worked)
    }
  };

  const dueMedications = medications.filter(med => isDueNow(med, 30) && !takenMeds.has(med.id));
  const upcomingMedications = medications.filter(med => !isDueNow(med, 30));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill className="h-5 w-5" />
          Medication Schedule
        </CardTitle>
        <CardDescription>
          {dueMedications.length > 0 
            ? `${dueMedications.length} medication(s) due now`
            : "No medications due at this time"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Taken Today */}
        {takenMeds.size > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-green-600 flex items-center gap-2">
              <Check className="h-4 w-4" />
              Taken Today
            </h4>
            {medications.filter(med => takenMeds.has(med.id)).map(med => (
              <div key={med.id} className="border-2 border-green-200 bg-green-50 p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-semibold text-green-900">{med.name}</h5>
                    <p className="text-sm text-green-700">{med.dosage}</p>
                  </div>
                  <Badge className="bg-green-600">TAKEN</Badge>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="mt-3 border-green-300 text-green-700 hover:bg-green-100"
                  onClick={() => {
                    setTakenMeds(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(med.id);
                      return newSet;
                    });
                  }}
                >
                  Undo
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Due Now */}
        {dueMedications.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-orange-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Due Now
            </h4>
            {dueMedications.map(med => (
              <div key={med.id} className="border-2 border-orange-200 bg-orange-50 p-4 rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-semibold">{med.name}</h5>
                    <p className="text-sm text-muted-foreground">{med.dosage}</p>
                    {med.instructions && (
                      <p className="text-xs text-muted-foreground mt-1">{med.instructions}</p>
                    )}
                    {med.withFood && (
                      <Badge variant="outline" className="mt-2 text-xs">Take with food</Badge>
                    )}
                  </div>
                  <Badge className="bg-orange-500">DUE</Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => logMedication(med.id, 'taken')}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Taken
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-100"
                    onClick={() => logMedication(med.id, 'skipped')}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Skip
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skipped */}
        {skippedMeds.size > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <X className="h-4 w-4" />
              Skipped
            </h4>
            {medications.filter(med => skippedMeds.has(med.id)).map(med => (
              <div key={med.id} className="border-2 border-gray-200 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-semibold text-gray-900">{med.name}</h5>
                    <p className="text-sm text-gray-700">{med.dosage}</p>
                  </div>
                  <Badge variant="outline" className="border-gray-400 text-gray-700">SKIPPED</Badge>
                </div>
                <Button 
                  size="sm" 
                  className="mt-3 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    setSkippedMeds(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(med.id);
                      return newSet;
                    });
                    logMedication(med.id, 'taken');
                  }}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark as Taken
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-green-800">Upcoming</h4>
          {upcomingMedications.map(med => {
            const nextDose = getNextDose(med);
            const isTaken = takenMeds.has(med.id);
            const isSkipped = skippedMeds.has(med.id);
            
            if (isTaken || isSkipped) return null;
            
            return (
              <div key={med.id} className="border-2 border-green-100 bg-green-50/30 p-3 rounded-lg hover:border-green-200 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-medium text-green-900">{med.name}</h5>
                    <p className="text-sm text-green-700">{med.dosage}</p>
                  </div>
                  <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                    {med.frequency.replace('-', ' ')}
                  </Badge>
                </div>
                {nextDose && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-green-700">
                    <Clock className="h-3 w-3" />
                    Next: {nextDose.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                {med.endDate && (
                  <p className="text-xs text-green-600 mt-1">
                    Ends: {med.endDate.toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Today's Adherence</span>
            <span className="font-semibold text-green-600">
              {medications.length > 0 
                ? Math.round((takenMeds.size / medications.length) * 100)
                : 0}%
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>Taken: {takenMeds.size} / {medications.length}</span>
            {skippedMeds.size > 0 && <span className="text-orange-600">Skipped: {skippedMeds.size}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
