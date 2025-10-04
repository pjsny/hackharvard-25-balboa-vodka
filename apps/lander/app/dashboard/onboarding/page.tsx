"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Balboa</h1>
        </div>

        {/* Onboarding Section */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-slate-900 text-center">
              Start Onboarding
            </CardTitle>
            <CardDescription className="text-slate-600 text-lg text-center">
              Complete your setup to get started with Balboa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-slate-600">
              <p>Welcome! Let's get you set up with Balboa's voice-powered 2FA protection.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
