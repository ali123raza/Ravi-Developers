"use client";

import { useEffect } from "react";
import { useGetTheme } from "@/lib/api";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: theme } = useGetTheme();

  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    const c = theme.colors;
    const t = theme.typography;
    const a = theme.assets;

    // Set CSS custom properties
    const vars: Record<string, string> = {
      "--color-primary": c.primary,
      "--color-primary-hover": c.primaryHover,
      "--color-primary-light": c.primaryLight,
      "--color-secondary": c.secondary,
      "--color-secondary-hover": c.secondaryHover,
      "--color-bg-main": c.background.main,
      "--color-bg-alt": c.background.alt,
      "--color-bg-dark": c.background.dark,
      "--color-text-primary": c.text.primary,
      "--color-text-secondary": c.text.secondary,
      "--color-text-light": c.text.light,
      "--color-text-white": c.text.white,
      "--color-border-light": c.border.light,
      "--color-border-medium": c.border.medium,
      "--color-accent-success": c.accent.success,
      "--color-accent-warning": c.accent.warning,
      "--color-accent-error": c.accent.error,
      "--font-body": t.fontFamily,
      "--font-heading": t.fontHeading,
    };

    Object.entries(vars).forEach(([key, val]) => {
      if (val) root.style.setProperty(key, val);
    });

    // Apply font family to body
    if (t.fontFamily) {
      document.body.style.fontFamily = `'${t.fontFamily}', sans-serif`;
    }

    // Update favicon
    if (a.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = a.faviconUrl;
    }
  }, [theme]);

  return <>{children}</>;
}
