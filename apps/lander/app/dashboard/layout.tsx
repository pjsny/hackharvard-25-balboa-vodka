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

  // Don't render anything if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return <></>;
  }

  return <>{children}</>;
}