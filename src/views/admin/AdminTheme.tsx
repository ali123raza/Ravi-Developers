"use client";

import { useState, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetTheme, useUpdateTheme, type ThemeSettings } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/useUpload";
import { Palette, Save, Upload, X } from "lucide-react";

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5" />
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-500">{label}</label>
        <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
      </div>
    </div>
  );
}

function ImageUploadField({ label, value, onChange, uploadType }: {
  label: string; value: string; onChange: (v: string) => void; uploadType: "logo" | "hero" | "about" | "gallery";
}) {
  const { upload, isUploading } = useUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload(file, uploadType);
    if (result?.url) onChange(result.url);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-lg transition-colors">
          <Upload size={14} /> {isUploading ? "Uploading..." : (value ? "Change" : "Upload")}
        </button>
        {value && (
          <button onClick={() => onChange("")} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><X size={14} /></button>
        )}
      </div>
      {value && <img src={value} alt="Preview" className="mt-2 max-h-20 object-contain border rounded-lg p-1" />}
    </div>
  );
}

function ThemePreview({ form }: { form: Record<string, string> }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-900 text-sm">Live Preview</h3>
      </div>
      <div className="p-4 space-y-3" style={{ backgroundColor: form.background_main || "#ffffff" }}>
        {/* Navbar preview */}
        <div className="rounded-lg p-3 flex items-center justify-between" style={{ backgroundColor: form.secondary_color || "#111827" }}>
          <span className="font-bold text-sm" style={{ color: form.text_white || "#ffffff" }}>Ravi Developers</span>
          <div className="flex gap-2">
            <span className="text-xs" style={{ color: form.text_light || "#9ca3af" }}>Home</span>
            <span className="text-xs" style={{ color: form.text_light || "#9ca3af" }}>Projects</span>
            <span className="text-xs" style={{ color: form.text_light || "#9ca3af" }}>Contact</span>
          </div>
        </div>
        {/* Hero preview */}
        <div className="rounded-lg p-4 text-center" style={{ backgroundColor: form.primary_color || "#dc2626" }}>
          <span className="text-xs font-medium" style={{ color: form.text_white || "#ffffff" }}>Badge Text</span>
          <h2 className="text-lg font-bold mt-1" style={{ color: form.text_white || "#ffffff" }}>Main Heading</h2>
          <p className="text-xs mt-1" style={{ color: form.primary_light || "#fef2f2" }}>Subtitle description text</p>
        </div>
        {/* Buttons preview */}
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded text-xs font-medium text-white" style={{ backgroundColor: form.primary_color || "#dc2626" }}>
            Primary Button
          </button>
          <button className="px-3 py-1.5 rounded text-xs font-medium text-white" style={{ backgroundColor: form.secondary_color || "#111827" }}>
            Secondary Button
          </button>
          <button className="px-3 py-1.5 rounded text-xs font-medium border" style={{ borderColor: form.primary_color || "#dc2626", color: form.primary_color || "#dc2626" }}>
            Outline Button
          </button>
        </div>
        {/* Card preview */}
        <div className="rounded-lg p-3 border" style={{ backgroundColor: form.background_alt || "#f9fafb", borderColor: form.border_light || "#e5e7eb" }}>
          <h4 className="text-sm font-semibold" style={{ color: form.text_primary || "#111827" }}>Card Title</h4>
          <p className="text-xs mt-1" style={{ color: form.text_secondary || "#6b7280" }}>Card description text goes here</p>
        </div>
        {/* Footer preview */}
        <div className="rounded-lg p-3" style={{ backgroundColor: form.background_dark || "#111827" }}>
          <span className="text-xs" style={{ color: form.text_light || "#9ca3af" }}>Footer text</span>
        </div>
      </div>
    </div>
  );
}

const FONT_OPTIONS = [
  "Inter", "Poppins", "Roboto", "Open Sans", "Lato", "Montserrat", "Playfair Display", "Merriweather", "Nunito", "Raleway",
];

export default function AdminTheme() {
  const { data: theme, isLoading } = useGetTheme();
  const updateTheme = useUpdateTheme();
  const { toast } = useToast();

  const [form, setForm] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  if (theme && !initialized) {
    const flat: Record<string, string> = {};
    // Flatten theme settings for form
    flat.primary_color = theme.colors.primary ?? "";
    flat.primary_hover = theme.colors.primaryHover ?? "";
    flat.primary_light = theme.colors.primaryLight ?? "";
    flat.secondary_color = theme.colors.secondary ?? "";
    flat.secondary_hover = theme.colors.secondaryHover ?? "";
    flat.background_main = theme.colors.background.main ?? "";
    flat.background_alt = theme.colors.background.alt ?? "";
    flat.background_dark = theme.colors.background.dark ?? "";
    flat.text_primary = theme.colors.text.primary ?? "";
    flat.text_secondary = theme.colors.text.secondary ?? "";
    flat.text_light = theme.colors.text.light ?? "";
    flat.text_white = theme.colors.text.white ?? "";
    flat.border_light = theme.colors.border.light ?? "";
    flat.border_medium = theme.colors.border.medium ?? "";
    flat.accent_success = theme.colors.accent.success ?? "";
    flat.accent_warning = theme.colors.accent.warning ?? "";
    flat.accent_error = theme.colors.accent.error ?? "";
    flat.font_family = theme.typography.fontFamily ?? "Inter";
    flat.font_heading = theme.typography.fontHeading ?? "Inter";
    flat.logo_url = theme.assets.logoUrl ?? "";
    flat.logo_dark_url = theme.assets.logoDarkUrl ?? "";
    flat.favicon_url = theme.assets.faviconUrl ?? "";
    setForm(flat);
    setInitialized(true);
  }

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      await updateTheme.mutateAsync(form);
      toast({ title: "Saved!", description: "Theme settings updated." });
    } catch {
      toast({ title: "Error", description: "Failed to save theme.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Theme Manager</h1>
          <p className="text-gray-500 text-sm mt-1">Customize colors, typography, and assets</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Colors */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
                <Palette size={16} className="text-red-600" />
                <h3 className="font-semibold text-gray-900">Primary Colors</h3>
              </div>
              <div className="p-5 grid sm:grid-cols-3 gap-4">
                <ColorField label="Primary" value={form.primary_color ?? ""} onChange={(v) => update("primary_color", v)} />
                <ColorField label="Primary Hover" value={form.primary_hover ?? ""} onChange={(v) => update("primary_hover", v)} />
                <ColorField label="Primary Light" value={form.primary_light ?? ""} onChange={(v) => update("primary_light", v)} />
              </div>
            </div>

            {/* Secondary Colors */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
                <Palette size={16} className="text-gray-600" />
                <h3 className="font-semibold text-gray-900">Secondary Colors</h3>
              </div>
              <div className="p-5 grid sm:grid-cols-2 gap-4">
                <ColorField label="Secondary" value={form.secondary_color ?? ""} onChange={(v) => update("secondary_color", v)} />
                <ColorField label="Secondary Hover" value={form.secondary_hover ?? ""} onChange={(v) => update("secondary_hover", v)} />
              </div>
            </div>

            {/* Background Colors */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
                <Palette size={16} className="text-blue-600" />
                <h3 className="font-semibold text-gray-900">Background Colors</h3>
              </div>
              <div className="p-5 grid sm:grid-cols-3 gap-4">
                <ColorField label="Main Background" value={form.background_main ?? ""} onChange={(v) => update("background_main", v)} />
                <ColorField label="Alt Background" value={form.background_alt ?? ""} onChange={(v) => update("background_alt", v)} />
                <ColorField label="Dark Background" value={form.background_dark ?? ""} onChange={(v) => update("background_dark", v)} />
              </div>
            </div>

            {/* Text Colors */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
                <Palette size={16} className="text-purple-600" />
                <h3 className="font-semibold text-gray-900">Text Colors</h3>
              </div>
              <div className="p-5 grid sm:grid-cols-4 gap-4">
                <ColorField label="Primary Text" value={form.text_primary ?? ""} onChange={(v) => update("text_primary", v)} />
                <ColorField label="Secondary Text" value={form.text_secondary ?? ""} onChange={(v) => update("text_secondary", v)} />
                <ColorField label="Light Text" value={form.text_light ?? ""} onChange={(v) => update("text_light", v)} />
                <ColorField label="White Text" value={form.text_white ?? ""} onChange={(v) => update("text_white", v)} />
              </div>
            </div>

            {/* Border & Accent Colors */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
                <Palette size={16} className="text-green-600" />
                <h3 className="font-semibold text-gray-900">Border & Accent Colors</h3>
              </div>
              <div className="p-5 grid sm:grid-cols-5 gap-4">
                <ColorField label="Border Light" value={form.border_light ?? ""} onChange={(v) => update("border_light", v)} />
                <ColorField label="Border Medium" value={form.border_medium ?? ""} onChange={(v) => update("border_medium", v)} />
                <ColorField label="Success" value={form.accent_success ?? ""} onChange={(v) => update("accent_success", v)} />
                <ColorField label="Warning" value={form.accent_warning ?? ""} onChange={(v) => update("accent_warning", v)} />
                <ColorField label="Error" value={form.accent_error ?? ""} onChange={(v) => update("accent_error", v)} />
              </div>
            </div>

            {/* Typography */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
                <Palette size={16} className="text-orange-600" />
                <h3 className="font-semibold text-gray-900">Typography</h3>
              </div>
              <div className="p-5 grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body Font</label>
                  <select value={form.font_family ?? "Inter"} onChange={(e) => update("font_family", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                    {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heading Font</label>
                  <select value={form.font_heading ?? "Inter"} onChange={(e) => update("font_heading", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                    {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Assets */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
                <Palette size={16} className="text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Assets</h3>
              </div>
              <div className="p-5 space-y-4">
                <ImageUploadField label="Logo (Light)" value={form.logo_url ?? ""} onChange={(v) => update("logo_url", v)} uploadType="logo" />
                <ImageUploadField label="Logo (Dark)" value={form.logo_dark_url ?? ""} onChange={(v) => update("logo_dark_url", v)} uploadType="logo" />
                <ImageUploadField label="Favicon" value={form.favicon_url ?? ""} onChange={(v) => update("favicon_url", v)} uploadType="logo" />
              </div>
            </div>

            {/* Save Button */}
            <button onClick={handleSave} disabled={updateTheme.isPending}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 w-full justify-center">
              <Save size={16} /> {updateTheme.isPending ? "Saving..." : "Save All Theme Settings"}
            </button>
          </div>

          {/* Right: Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ThemePreview form={form} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
