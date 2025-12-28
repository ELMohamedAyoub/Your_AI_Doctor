"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SUPPORTED_SURGERIES } from "@/lib/surgeryBaselines";
import { Stethoscope, User, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Onboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<"PATIENT" | "DOCTOR" | null>(null);
  
  // Patient form data
  const [patientData, setPatientData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    surgery: "",
    surgeryDate: ""
  });

  // Doctor form data
  const [doctorData, setDoctorData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    specialization: "",
    licenseNumber: ""
  });

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/patient/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          phone: patientData.phone,
          surgeryType: patientData.surgery,
          surgeryDate: patientData.surgeryDate,
          role: "PATIENT"
        })
      });

      if (response.ok) {
        toast.success("Patient profile created successfully!");
        router.push("/patient-dashboard");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create patient profile");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("An error occurred during onboarding");
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/doctor/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          phone: doctorData.phone,
          specialization: doctorData.specialization,
          licenseNumber: doctorData.licenseNumber,
          role: "DOCTOR"
        })
      });

      if (response.ok) {
        toast.success("Doctor profile created successfully!");
        router.push("/doctor-dashboard");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create doctor profile");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("An error occurred during onboarding");
    } finally {
      setLoading(false);
    }
  };

  if (!userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">Welcome to AI Doctor Assistant</CardTitle>
            <CardDescription className="text-base">
              Please select your role to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Patient Option */}
              <button
                onClick={() => setUserRole("PATIENT")}
                className="group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-green-500 transition-all p-8 text-center bg-white hover:shadow-lg"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                    <User className="h-12 w-12 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">I'm a Patient</h3>
                    <p className="text-sm text-muted-foreground">
                      Track your post-surgery recovery, communicate with your doctor, and monitor your health
                    </p>
                  </div>
                  <div className="pt-4">
                    <div className="inline-flex items-center text-sm text-green-600 font-medium">
                      Continue as Patient
                      <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>

              {/* Doctor Option */}
              <button
                onClick={() => setUserRole("DOCTOR")}
                className="group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-green-500 transition-all p-8 text-center bg-white hover:shadow-lg"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                    <Stethoscope className="h-12 w-12 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">I'm a Doctor</h3>
                    <p className="text-sm text-muted-foreground">
                      Monitor your patients' recovery, review daily reports, and provide remote care
                    </p>
                  </div>
                  <div className="pt-4">
                    <div className="inline-flex items-center text-sm text-green-600 font-medium">
                      Continue as Doctor
                      <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => setUserRole(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            {userRole === "DOCTOR" ? (
              <div className="p-3 bg-green-100 rounded-full">
                <Stethoscope className="h-6 w-6 text-green-600" />
              </div>
            ) : (
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            )}
            <div>
              <CardTitle>
                {userRole === "DOCTOR" ? "Doctor Registration" : "Patient Registration"}
              </CardTitle>
              <CardDescription>
                {userRole === "DOCTOR" 
                  ? "Complete your professional profile" 
                  : "Tell us about your surgery"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {userRole === "PATIENT" ? (
            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    required
                    value={patientData.firstName}
                    onChange={(e) => setPatientData({ ...patientData, firstName: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    required
                    value={patientData.lastName}
                    onChange={(e) => setPatientData({ ...patientData, lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={patientData.phone}
                  onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                  placeholder="+1-555-0123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="surgery">Type of Surgery</Label>
                <select
                  id="surgery"
                  required
                  value={patientData.surgery}
                  onChange={(e) => setPatientData({ ...patientData, surgery: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">Select your surgery</option>
                  {SUPPORTED_SURGERIES.map((surgery) => (
                    <option key={surgery} value={surgery}>
                      {surgery}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="surgeryDate">Surgery Date</Label>
                <Input
                  id="surgeryDate"
                  type="date"
                  required
                  value={patientData.surgeryDate}
                  onChange={(e) => setPatientData({ ...patientData, surgeryDate: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? "Setting up..." : "Complete Patient Setup"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleDoctorSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="docFirstName">First Name</Label>
                  <Input
                    id="docFirstName"
                    type="text"
                    required
                    value={doctorData.firstName}
                    onChange={(e) => setDoctorData({ ...doctorData, firstName: e.target.value })}
                    placeholder="Sarah"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docLastName">Last Name</Label>
                  <Input
                    id="docLastName"
                    type="text"
                    required
                    value={doctorData.lastName}
                    onChange={(e) => setDoctorData({ ...doctorData, lastName: e.target.value })}
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="docPhone">Phone Number</Label>
                <Input
                  id="docPhone"
                  type="tel"
                  required
                  value={doctorData.phone}
                  onChange={(e) => setDoctorData({ ...doctorData, phone: e.target.value })}
                  placeholder="+1-555-0123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Medical Specialization</Label>
                <select
                  id="specialization"
                  required
                  value={doctorData.specialization}
                  onChange={(e) => setDoctorData({ ...doctorData, specialization: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">Select your specialization</option>
                  <option value="Orthopedic Surgery">Orthopedic Surgery</option>
                  <option value="General Surgery">General Surgery</option>
                  <option value="OB/GYN">OB/GYN</option>
                  <option value="Cardiothoracic Surgery">Cardiothoracic Surgery</option>
                  <option value="Neurosurgery">Neurosurgery</option>
                  <option value="Plastic Surgery">Plastic Surgery</option>
                  <option value="Vascular Surgery">Vascular Surgery</option>
                  <option value="Emergency Medicine">Emergency Medicine</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="Family Medicine">Family Medicine</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Medical License Number (Optional)</Label>
                <Input
                  id="licenseNumber"
                  type="text"
                  value={doctorData.licenseNumber}
                  onChange={(e) => setDoctorData({ ...doctorData, licenseNumber: e.target.value })}
                  placeholder="e.g., MD123456"
                />
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? "Setting up..." : "Complete Doctor Setup"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
