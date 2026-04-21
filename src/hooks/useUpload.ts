"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const getAdminToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
};

export type UploadType = "projects" | "hero" | "about" | "testimonials" | "logo" | "gallery";

export interface UploadResult {
  success: boolean;
  url: string;
  filename: string;
  size: number;
  type: string;
}

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const upload = async (file: File, type: UploadType = "gallery"): Promise<UploadResult | null> => {
    setIsUploading(true);
    setProgress(0);

    try {
      const token = getAdminToken();
      if (!token) {
        throw new Error("Not authenticated. Please login first.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 401) {
          localStorage.removeItem("admin_token");
          window.location.href = "/admin/login";
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(err.error || "Upload failed");
      }

      const result: UploadResult = await res.json();
      
      toast({
        title: "Upload successful",
        description: `${file.name} uploaded successfully`,
      });

      return result;
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return { upload, isUploading, progress };
}
