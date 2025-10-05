"use client";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { LogOut } from "lucide-react";
import { useAuth } from "~/lib/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardScreen(): JSX.Element {
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
      <div className="min-h-screen relative overflow-hidden">
        {/* Professional Background */}
        <div className="absolute inset-0 balboa-gradient">
          {/* Subtle accent lines */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-balboa-accent to-transparent"></div>
            <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-balboa-accent to-transparent"></div>
            <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-balboa-accent to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-balboa-accent to-transparent"></div>
          </div>
          
          {/* Subtle corner accents */}
          <div className="absolute top-4 left-4 w-2 h-2 balboa-accent rounded-full opacity-60 animate-subtle-glow"></div>
          <div className="absolute top-4 right-4 w-2 h-2 balboa-accent rounded-full opacity-60 animate-subtle-glow" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-4 left-4 w-2 h-2 balboa-accent rounded-full opacity-60 animate-subtle-glow" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-4 right-4 w-2 h-2 balboa-accent rounded-full opacity-60 animate-subtle-glow" style={{animationDelay: '1.5s'}}></div>
        </div>

        {/* Loading Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-16 h-16 balboa-surface-elevated border balboa-border rounded-full flex items-center justify-center mx-auto mb-4 animate-professional-pulse">
                <div className="w-8 h-8 border-2 border-balboa-accent border-t-transparent rounded-full animate-loading-spinner"></div>
              </div>
              <h1 className="text-4xl font-bold balboa-text-primary tracking-wide mb-2">
                BALBOA
              </h1>
              <div className="text-lg font-medium balboa-text-secondary">
                Initializing Security Protocol...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render dashboard if user is not onboarded (will redirect)
  if (user && !user.isOnboarded) {
    return <></>;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Professional Background */}
      <div className="absolute inset-0 balboa-gradient">
        {/* Subtle accent lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-balboa-accent to-transparent"></div>
          <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-balboa-accent to-transparent"></div>
          <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-balboa-accent to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-balboa-accent to-transparent"></div>
        </div>
        
        {/* Subtle corner accents */}
        <div className="absolute top-4 left-4 w-2 h-2 balboa-accent rounded-full opacity-60 animate-subtle-glow"></div>
        <div className="absolute top-4 right-4 w-2 h-2 balboa-accent rounded-full opacity-60 animate-subtle-glow" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-4 left-4 w-2 h-2 balboa-accent rounded-full opacity-60 animate-subtle-glow" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-4 right-4 w-2 h-2 balboa-accent rounded-full opacity-60 animate-subtle-glow" style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-6xl font-bold balboa-text-primary tracking-wide">
              BALBOA
            </h1>
            
            <Button 
              onClick={handleSignOut}
              className="balboa-surface-elevated border balboa-border balboa-text-primary hover:balboa-text-primary font-semibold py-3 px-6 text-sm rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-balboa-accent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="tracking-wide">SIGN OUT</span>
            </Button>
          </div>

          {/* Success Section */}
          <div className="balboa-surface-elevated border balboa-border p-12 text-center shadow-xl">
            <div className="text-6xl mb-6 animate-success-glow">✓</div>
            <h2 className="text-4xl font-bold balboa-text-primary mb-4 tracking-wide">
              VERIFICATION COMPLETE
            </h2>
            <div className="text-xl font-semibold balboa-accent mb-6 tracking-wide">
              SECURITY PROTOCOL ACTIVATED
            </div>
            <div className="balboa-surface p-8 text-left max-w-3xl mx-auto border balboa-border">
              <div className="text-lg balboa-text-secondary space-y-4">
                <p className="font-semibold balboa-text-primary text-center mb-4">✓ MISSION ACCOMPLISHED</p>
                <p className="text-center">
                  Your voice verification has been successfully completed. 
                  <span className="balboa-accent font-semibold"> BALBOA</span> is now your voice-powered security guardian.
                </p>
                <p className="text-center">
                  Your voice is your authentication key. Your security is protected. 
                  <span className="balboa-accent font-semibold"> SYSTEM SECURED.</span>
                </p>
                <p className="text-center text-base mt-6">
                  Balboa will automatically work with integrated vendors. 
                  <span className="balboa-accent font-semibold"> Check out the example checkout</span> to see it in action!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}