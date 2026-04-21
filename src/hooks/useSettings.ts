"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "/api";

// Helper to get admin auth token from localStorage
const getAdminToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
};

export interface ContactInfo {
  address: string;
  phone1: string;
  phone2: string;
  email: string;
  whatsapp: string;
  hours_weekday: string;
  hours_weekend: string;
}

export interface HeroContent {
  badge: string;
  title: string;
  subtitle: string;
  location: string;
  starting_price: string;
  cta_primary: string;
  cta_secondary: string;
  hero_image?: string;
}

export interface AboutContent {
  story: string;
  story2: string;
  story3: string;
  mission: string;
  vision: string;
  about_images?: string[];
}

export interface CompanyStats {
  sqft_developed: string;
  happy_families: string;
  active_projects: string;
  approval: string;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
}

export interface SiteSettings {
  contact_info?: ContactInfo;
  hero_content?: HeroContent;
  about_content?: AboutContent;
  company_stats?: CompanyStats;
  social_links?: SocialLinks;
  footer_tagline?: { text: string };
  logo_url?: string;
  [key: string]: unknown;
}

async function fetchSettings(): Promise<SiteSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

export function useSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSettings,
    staleTime: 60000,
  });
}

export function useUpdateSetting(key: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (value: unknown) => {
      const token = getAdminToken();
      const res = await fetch(`${API_BASE}/settings/${key}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(value),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update setting");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });
}
