"use client";

import { useEffect, useState } from "react";
import { useLocation } from 'wouter';
import { useAdminAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [, setLocation] = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    console.log("[ProtectedRoute] Check - isLoading:", isLoading, "isAuthenticated:", isAuthenticated);
    // Only redirect if loading is complete and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      console.log("[ProtectedRoute] Not authenticated, redirecting to login");
      setShouldRedirect(true);
      setLocation("/admin/login");
    } else if (!isLoading && isAuthenticated) {
      setShouldRedirect(false);
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth or when about to redirect
  if (isLoading || shouldRedirect) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
