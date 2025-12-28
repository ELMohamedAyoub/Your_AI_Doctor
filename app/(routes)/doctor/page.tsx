"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface PatientListItem {
  id: string;
  name: string;
  surgery: string;
  surgeryDate: string;
  lastPainScore: number | null;
  lastSymptoms: string[];
  alertLevel: string;
  daysSinceSurgery: number;
}

export default function DoctorDashboard() {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/doctor/patients");
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertBadge = (level: string) => {
    const colors = {
      RED: "bg-red-500 hover:bg-red-600",
      ORANGE: "bg-orange-500 hover:bg-orange-600",
      NORMAL: "bg-green-500 hover:bg-green-600"
    };
    return (
      <Badge className={colors[level as keyof typeof colors] || "bg-gray-500"}>
        {level}
      </Badge>
    );
  };

  if (loading) {
    return <div className="p-8">Loading patients...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Post-surgery patient monitoring and alerts
        </p>
      </div>

      <div className="grid gap-4">
        {patients.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No patients found</p>
            </CardContent>
          </Card>
        ) : (
          patients.map((patient) => (
            <Link key={patient.id} href={`/doctor/patient/${patient.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{patient.name}</CardTitle>
                      <CardDescription>
                        {patient.surgery} • {patient.daysSinceSurgery} days post-op
                      </CardDescription>
                    </div>
                    {getAlertBadge(patient.alertLevel)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Last Pain Score:</span>{" "}
                      <span className={patient.lastPainScore && patient.lastPainScore >= 7 ? "text-red-500 font-bold" : ""}>
                        {patient.lastPainScore !== null ? `${patient.lastPainScore}/10` : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Surgery Date:</span>{" "}
                      {new Date(patient.surgeryDate).toLocaleDateString()}
                    </div>
                    {patient.lastSymptoms.length > 0 && (
                      <div className="col-span-2">
                        <span className="font-medium">Recent Symptoms:</span>{" "}
                        {patient.lastSymptoms.join(", ")}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
