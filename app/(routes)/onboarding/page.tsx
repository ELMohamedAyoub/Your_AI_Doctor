"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SUPPORTED_SURGERIES } from "@/lib/surgeryBaselines";

export default function PatientOnboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    surgery: "",
    surgeryDate: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/patient/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push("/patient-dashboard");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to create patient profile");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("An error occurred during onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Post-Surgery Monitoring</CardTitle>
          <CardDescription>
            Please provide your surgery details to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surgery">Type of Surgery</Label>
              <select
                id="surgery"
                required
                value={formData.surgery}
                onChange={(e) => setFormData({ ...formData, surgery: e.target.value })}
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
                value={formData.surgeryDate}
                onChange={(e) => setFormData({ ...formData, surgeryDate: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Setting up..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
