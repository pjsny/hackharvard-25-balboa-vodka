"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/lib/use-auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  // Show loading while checking authentication status
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

  // Don't render anything if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return <></>;
  }

  return <>{children}</>;
}
