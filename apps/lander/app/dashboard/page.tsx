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
        {/* Rocky Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-800 to-black">
          {/* Boxing ring ropes effect */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 shadow-lg"></div>
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-400 shadow-lg"></div>
            <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-400 shadow-lg"></div>
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 shadow-lg"></div>
          </div>
          
          {/* Corner posts */}
          <div className="absolute top-4 left-4 w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-2xl animate-corner-post-glow"></div>
          <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-2xl animate-corner-post-glow" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-2xl animate-corner-post-glow" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-2xl animate-corner-post-glow" style={{animationDelay: '1.5s'}}></div>
        </div>

        {/* Loading Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 via-red-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-3xl">🥊</span>
              </div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 tracking-wider">
                BALBOA
              </h1>
              <div className="text-xl font-bold text-white mt-2 tracking-widest">
                PREPARING FOR BATTLE...
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
      {/* Rocky Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-800 to-black">
        {/* Boxing ring ropes effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 shadow-lg"></div>
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-400 shadow-lg"></div>
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-400 shadow-lg"></div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 shadow-lg"></div>
        </div>
        
        {/* Corner posts */}
        <div className="absolute top-4 left-4 w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-2xl animate-corner-post-glow"></div>
        <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-2xl animate-corner-post-glow" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-2xl animate-corner-post-glow" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-2xl animate-corner-post-glow" style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 tracking-wider">
              BALBOA
            </h1>
            
            <Button 
              onClick={handleSignOut}
              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-black py-4 px-8 text-lg rounded-none border-4 border-red-400 shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none"
              style={{
                boxShadow: '0 0 20px rgba(220, 38, 38, 0.8), 0 0 40px rgba(220, 38, 38, 0.6), inset 0 0 10px rgba(0, 0, 0, 0.3)'
              }}
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="tracking-wider">EXIT RING</span>
            </Button>
          </div>

          {/* Victory Section */}
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 border-4 border-yellow-400 p-12 text-center">
            <div className="text-8xl mb-6 animate-victory-bounce">🏆</div>
            <h2 className="text-6xl font-black text-black mb-4 tracking-wider">
              VICTORY ACHIEVED!
            </h2>
            <div className="text-2xl font-bold text-black mb-6 tracking-widest">
              🥊 CHAMPION STATUS UNLOCKED 🥊
            </div>
            <div className="bg-black bg-opacity-50 p-8 text-left max-w-3xl mx-auto">
              <div className="text-xl text-yellow-300 space-y-4">
                <p className="font-bold text-yellow-400 text-center mb-4">🎯 MISSION ACCOMPLISHED 🎯</p>
                <p className="text-center">
                  You've successfully entered the ring and proven your worth! 
                  <span className="text-yellow-400 font-bold"> BALBOA</span> is now your voice-powered guardian.
                </p>
                <p className="text-center">
                  Your voice is your weapon. Your security is your victory. 
                  <span className="text-yellow-400 font-bold"> FIGHT ON, CHAMPION!</span>
                </p>
                <p className="text-center text-lg mt-6">
                  Balboa will automatically work with any of our integrated vendors. 
                  <span className="text-yellow-400 font-bold"> Check out the Crimson Shop</span> to see it in action!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
