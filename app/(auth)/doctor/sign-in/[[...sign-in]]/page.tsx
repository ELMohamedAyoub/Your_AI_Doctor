"use client";

import { SignIn } from "@clerk/nextjs";

export default function DoctorSignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Doctor Portal
        </h1>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-2xl"
            }
          }}
          afterSignInUrl="/doctor"
          signUpUrl="/doctor/sign-up"
        />
      </div>
    </div>
  );
}
