"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextValue {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AuthContextValue | null>(null);

const API_BASE = "/api";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const hasCheckedStorage = useRef(false);

  // isLoading is derived: true until we've checked storage and validated token if present
  const isLoading = !hasCheckedStorage.current || (!validationAttempted && !!token);

  // Load token from localStorage on mount (client-only)
  useEffect(() => {
    if (hasCheckedStorage.current) return; // Prevent re-running in Strict Mode
    hasCheckedStorage.current = true;

    const stored = localStorage.getItem("admin_token");
    console.log("[Auth] Token from localStorage:", stored ? "found" : "not found");
    if (stored) {
      setToken(stored);
    } else {
      setValidationAttempted(true);
    }
  }, []);

  useEffect(() => {
    if (!token || validationAttempted) return;

    console.log("[Auth] Validating token...");
    let isMounted = true;

    const validateToken = async () => {
      try {
        const r = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!r.ok) {
          const err = await r.json().catch(() => ({ error: "Unknown error" }));
          console.error("[Auth] Token validation failed:", r.status, err);
          throw new Error(err.error || `HTTP ${r.status}`);
        }

        const data = await r.json();
        console.log("[Auth] User validated:", data.email);

        if (isMounted) {
          setUser(data);
        }
      } catch (err: any) {
        console.error("[Auth] Clearing invalid token:", err.message);
        if (isMounted) {
          localStorage.removeItem("admin_token");
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setValidationAttempted(true);
        }
      }
    };

    validateToken();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }
    const data = await res.json();
    localStorage.setItem("admin_token", data.token);
    setValidationAttempted(true); // Skip validation since we just got fresh data
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setUser(null);
    setValidationAttempted(true);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
