"use client";

import { SignUp, useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function PatientSignUp() {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      // Set role to patient in publicMetadata
      user.update({
        unsafeMetadata: {
          role: "patient"
        }
      });
    }
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Patient Registration
        </h1>
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-2xl"
            }
          }}
          afterSignUpUrl="/onboarding"
          signInUrl="/patient/sign-in"
        />
      </div>
    </div>
  );
}
