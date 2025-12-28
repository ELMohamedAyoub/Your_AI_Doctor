"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill, Clock, Check, X, AlertTriangle } from "lucide-react";
import { getNextDose, isDueNow, type Medication } from "@/lib/medicationReminders";

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
    // In production, save to database
    console.log(`Medication ${medicationId} marked as ${status}`);
    // Show confirmation
    alert(`Marked as ${status}`);
  };

  const dueMedications = medications.filter(med => isDueNow(med, 30));
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
                    className="flex-1"
                    onClick={() => logMedication(med.id, 'taken')}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Taken
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
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

        {/* Upcoming */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Upcoming</h4>
          {upcomingMedications.map(med => {
            const nextDose = getNextDose(med);
            return (
              <div key={med.id} className="border p-3 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-medium">{med.name}</h5>
                    <p className="text-sm text-muted-foreground">{med.dosage}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {med.frequency.replace('-', ' ')}
                  </Badge>
                </div>
                {nextDose && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Next: {nextDose.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                {med.endDate && (
                  <p className="text-xs text-muted-foreground mt-1">
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
            <span className="font-semibold text-green-600">85%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
