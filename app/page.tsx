"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Stethoscope, UserCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  // If user is signed in, redirect to onboarding
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/onboarding');
    }
  }, [isSignedIn, isLoaded, router]);

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  // If signed in, don't show this page (will redirect)
  if (isSignedIn) {
    return null;
  }

  const handleRoleSelection = (role: 'patient' | 'doctor') => {
    // User not signed in, go to sign-in page
    router.push('/sign-in');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI Doctor Assistant
          </h1>
          <p className="text-xl text-gray-600">
            Post-Surgery Recovery Monitoring Platform
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Please sign in to continue
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Patient Card */}
          <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-500">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCircle className="w-12 h-12 text-blue-600" />
              </div>
              <CardTitle className="text-3xl">I am a Patient</CardTitle>
              <CardDescription className="text-base mt-2">
                Monitor your recovery, track symptoms, and stay connected with your healthcare team
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <ul className="text-left space-y-2 mb-6 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span>
                  Daily voice check-ins
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span>
                  Pain and symptom tracking
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span>
                  Personalized recovery guidance
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span>
                  Automatic alert detection
                </li>
              </ul>
              <Button 
                size="lg" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => handleRoleSelection('patient')}
              >
                Sign In as Patient
              </Button>
            </CardContent>
          </Card>

          {/* Doctor Card */}
          <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-green-500">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <Stethoscope className="w-12 h-12 text-green-600" />
              </div>
              <CardTitle className="text-3xl">I am a Doctor</CardTitle>
              <CardDescription className="text-base mt-2">
                Monitor all your patients, track recovery progress, and manage alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <ul className="text-left space-y-2 mb-6 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span>
                  Multi-patient dashboard
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span>
                  Real-time alert system
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span>
                  Pain trend visualization
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span>
                  Complete patient history
                </li>
              </ul>
              <Button 
                size="lg" 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => handleRoleSelection('doctor')}
              >
                Sign In as Doctor
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            Secure • HIPAA Compliant • AI-Powered Monitoring
          </p>
        </div>
      </div>
    </main>
  );
}
