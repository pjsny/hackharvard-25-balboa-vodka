"use client";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { LogOut } from "lucide-react";
import { useAuth } from "~/lib/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardScreen() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !user.isOnboarded) {
      router.push("/dashboard/onboarding");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    console.log("Signing out...");
    await signOut();
  };

  // Show loading state while checking authentication and onboarding status
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  // Don't render dashboard if user is not onboarded (will redirect)
  if (user && !user.isOnboarded) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Balboa</h1>
          
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Welcome Section */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-slate-900 text-center">
              Welcome to Balboa
            </CardTitle>
            <CardDescription className="text-slate-600 text-lg text-center">
              Voice-powered 2FA protection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-slate-600">
              <p>You're successfully authenticated and ready to use Balboa. Balboa will automatically work with any of our integrated vendors. For example check out the Crimson Shop</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
