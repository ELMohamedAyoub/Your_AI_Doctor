"use client";

import { SignUp, useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function DoctorSignUp() {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      // Set role to doctor in publicMetadata
      user.update({
        unsafeMetadata: {
          role: "doctor"
        }
      });
    }
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Doctor Registration
        </h1>
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-2xl"
            }
          }}
          afterSignUpUrl="/doctor"
          signInUrl="/doctor/sign-in"
        />
      </div>
    </div>
  );
}
