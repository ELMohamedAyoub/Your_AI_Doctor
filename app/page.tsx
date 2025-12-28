"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Stethoscope, UserCircle, LogOut } from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";

export default function Home() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const handleRoleSelection = async (role: 'patient' | 'doctor') => {
    if (isSignedIn) {
      // User is signed in but might not have a role, set it
      try {
        const response = await fetch('/api/set-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role })
        });
        
        if (response.ok) {
          // Wait a moment for Clerk to update the session
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Force a hard reload to refresh Clerk session with new metadata
          window.location.href = role === 'patient' ? '/patient-dashboard' : '/doctor';
        }
      } catch (error) {
        console.error('Error setting role:', error);
        // If error, still try to redirect - the role might be set
        window.location.href = role === 'patient' ? '/patient-dashboard' : '/doctor';
      }
    } else {
      // User not signed in, go to sign-in page
      router.push(role === 'patient' ? '/patient/sign-in' : '/doctor/sign-in');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          {isSignedIn && (
            <div className="mb-4">
              <Button 
                variant="outline" 
                onClick={() => signOut()}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          )}
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Post-Surgery Recovery Monitoring
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose your role to continue
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Patient Card */}
          <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-500">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <UserCircle className="w-12 h-12 text-blue-600 dark:text-blue-300" />
              </div>
              <CardTitle className="text-3xl">I am a Patient</CardTitle>
              <CardDescription className="text-base mt-2">
                Monitor your recovery, track symptoms, and stay connected with your healthcare team
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <ul className="text-left space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-300">
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
                Continue as Patient
              </Button>
            </CardContent>
          </Card>

          {/* Doctor Card */}
          <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-green-500">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Stethoscope className="w-12 h-12 text-green-600 dark:text-green-300" />
              </div>
              <CardTitle className="text-3xl">I am a Doctor</CardTitle>
              <CardDescription className="text-base mt-2">
                Monitor all your patients, track recovery progress, and manage alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <ul className="text-left space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-300">
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
                Continue as Doctor
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            Secure • HIPAA Compliant • AI-Powered Monitoring
          </p>
        </div>
      </div>
    </main>
  );
}
