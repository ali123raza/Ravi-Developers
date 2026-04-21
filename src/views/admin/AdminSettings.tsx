"use client";

import { useState, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useSettings, useUpdateSetting } from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/useUpload";
import { Save, Phone, MapPin, Mail, Clock, Globe, FileText, BarChart3, Info, Image, Upload, X } from "lucide-react";

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
        {icon}
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, multiline = false, type = "text" }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      )}
    </div>
  );
}

// Image Upload Component
function ImageUploadField({ 
  label, 
  value, 
  onChange, 
  uploadType,
  accept = "image/*"
}: { 
  label: string;
  value: string;
  onChange: (v: string) => void;
  uploadType: "logo" | "hero" | "about" | "gallery";
  accept?: string;
}) {
  const { upload, isUploading } = useUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await upload(file, uploadType);
    if (result?.url) {
      onChange(result.url);
    }
  };

  const handleClear = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      
      {/* Upload Button / Change Button */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-lg transition-colors"
        >
          <Upload size={14} />
          {isUploading ? "Uploading..." : (value ? "Change Image" : "Upload Image")}
        </button>
        {value && (
          <button
            onClick={handleClear}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors text-sm"
            title="Remove"
          >
            <X size={14} />
          </button>
        )}
        <span className="text-xs text-gray-500">Max 5MB (JPEG, PNG, WebP)</span>
      </div>

      {/* Preview */}
      {value && (
        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-1">Preview:</div>
          <div className="relative inline-block">
            <img 
              src={value} 
              alt="Preview" 
              className="max-h-32 max-w-full object-contain border rounded-lg p-1" 
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Multiple Images Upload Component
function MultiImageUploadField({ 
  label, 
  values, 
  onChange, 
  uploadType 
}: { 
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  uploadType: "about" | "gallery" | "projects";
}) {
  const { upload, isUploading } = useUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const result = await upload(file, uploadType);
      if (result?.url) {
        newUrls.push(result.url);
      }
    }
    
    if (newUrls.length > 0) {
      onChange([...values, ...newUrls]);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      {/* Upload Button */}
      <div className="flex items-center gap-2 mb-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-lg transition-colors"
        >
          <Upload size={14} />
          {isUploading ? "Uploading..." : "Add Images"}
        </button>
        <span className="text-xs text-gray-500">Max 5MB each (JPEG, PNG, WebP)</span>
      </div>

      {/* Image Gallery */}
      {values.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {values.map((url, index) => (
            <div key={index} className="relative group">
              <img 
                src={url} 
                alt={`Image ${index + 1}`}
                className="w-full aspect-square object-cover rounded-lg border" 
              />
              <button
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminSettings() {
  const { data: settings, isLoading } = useSettings();
  const { toast } = useToast();

  const updateContact = useUpdateSetting("contact_info");
  const updateHero = useUpdateSetting("hero_content");
  const updateAbout = useUpdateSetting("about_content");
  const updateStats = useUpdateSetting("company_stats");
  const updateSocial = useUpdateSetting("social_links");
  const updateLogo = useUpdateSetting("logo_url");

  const [contact, setContact] = useState({
    address: "", phone1: "", phone2: "", email: "", whatsapp: "",
    hours_weekday: "", hours_weekend: "",
  });
  const [hero, setHero] = useState({
    badge: "", title: "", subtitle: "", location: "", starting_price: "", hero_image: "",
  });
  const [about, setAbout] = useState({
    story: "", story2: "", story3: "", mission: "", vision: "", about_images: [] as string[],
  });
  const [stats, setStats] = useState({
    sqft_developed: "", happy_families: "", active_projects: "", approval: "",
  });
  const [social, setSocial] = useState({ facebook: "", instagram: "" });
  const [logo, setLogo] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (settings && !initialized) {
    setContact({ ...contact, ...(settings.contact_info as object || {}) });
    setHero({ ...hero, ...(settings.hero_content as object || {}), hero_image: (settings.hero_content as any)?.hero_image ?? "" });
    setAbout({ ...about, ...(settings.about_content as object || {}), about_images: (settings.about_content as any)?.about_images ?? [] });
    setStats({ ...stats, ...(settings.company_stats as object || {}) });
    setSocial({ ...social, ...(settings.social_links as object || {}) });
    setLogo(settings.logo_url ?? "");
    setInitialized(true);
  }

  const save = async (type: string) => {
    try {
      if (type === "contact") await updateContact.mutateAsync(contact);
      if (type === "hero") await updateHero.mutateAsync(hero);
      if (type === "about") await updateAbout.mutateAsync(about);
      if (type === "stats") await updateStats.mutateAsync(stats);
      if (type === "social") await updateSocial.mutateAsync(social);
      if (type === "logo") await updateLogo.mutateAsync(logo);
      toast({ title: "Saved!", description: "Settings updated successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
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
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all website content from here</p>
        </div>

        {/* Logo Upload */}
        <Section title="Logo" icon={<Image size={16} className="text-red-600" />}>
          <ImageUploadField
            label="Logo"
            value={logo}
            onChange={(v) => setLogo(v)}
            uploadType="logo"
          />
          <button
            onClick={() => save("logo")}
            disabled={updateLogo.isPending}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Save size={14} /> {updateLogo.isPending ? "Saving..." : "Save Logo"}
          </button>
        </Section>

        {/* Contact Info */}
        <Section title="Contact Information" icon={<Phone size={16} className="text-red-600" />}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Booking Office Address" value={contact.address} onChange={(v) => setContact(p => ({ ...p, address: v }))} />
            <Field label="WhatsApp Number (without +)" value={contact.whatsapp} onChange={(v) => setContact(p => ({ ...p, whatsapp: v }))} />
            <Field label="Phone 1" value={contact.phone1} onChange={(v) => setContact(p => ({ ...p, phone1: v }))} />
            <Field label="Phone 2" value={contact.phone2} onChange={(v) => setContact(p => ({ ...p, phone2: v }))} />
            <Field label="Email" value={contact.email} type="email" onChange={(v) => setContact(p => ({ ...p, email: v }))} />
            <div />
            <Field label="Office Hours (Weekdays)" value={contact.hours_weekday} onChange={(v) => setContact(p => ({ ...p, hours_weekday: v }))} />
            <Field label="Office Hours (Weekend)" value={contact.hours_weekend} onChange={(v) => setContact(p => ({ ...p, hours_weekend: v }))} />
          </div>
          <button
            onClick={() => save("contact")}
            disabled={updateContact.isPending}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Save size={14} /> {updateContact.isPending ? "Saving..." : "Save Contact Info"}
          </button>
        </Section>

        {/* Hero Section */}
        <Section title="Homepage Hero Section" icon={<FileText size={16} className="text-blue-600" />}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Badge Text (top of hero)" value={hero.badge} onChange={(v) => setHero(p => ({ ...p, badge: v }))} />
            <Field label="Location Text" value={hero.location} onChange={(v) => setHero(p => ({ ...p, location: v }))} />
            <div className="sm:col-span-2">
              <Field label="Main Heading" value={hero.title} onChange={(v) => setHero(p => ({ ...p, title: v }))} />
            </div>
            <div className="sm:col-span-2">
              <Field label="Subtitle / Description" value={hero.subtitle} onChange={(v) => setHero(p => ({ ...p, subtitle: v }))} multiline />
            </div>
            <div className="sm:col-span-2">
              <Field label="Starting Price Banner Text" value={hero.starting_price} onChange={(v) => setHero(p => ({ ...p, starting_price: v }))} />
            </div>
            <div className="sm:col-span-2">
              <ImageUploadField
                label="Hero Background Image"
                value={hero.hero_image}
                onChange={(v) => setHero(p => ({ ...p, hero_image: v }))}
                uploadType="hero"
              />
            </div>
          </div>
          <button
            onClick={() => save("hero")}
            disabled={updateHero.isPending}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Save size={14} /> {updateHero.isPending ? "Saving..." : "Save Hero Section"}
          </button>
        </Section>

        {/* About Content */}
        <Section title="About Page Content" icon={<Info size={16} className="text-purple-600" />}>
          <Field label="Our Story (Paragraph 1)" value={about.story} onChange={(v) => setAbout(p => ({ ...p, story: v }))} multiline />
          <Field label="Our Story (Paragraph 2)" value={about.story2} onChange={(v) => setAbout(p => ({ ...p, story2: v }))} multiline />
          <Field label="Our Story (Paragraph 3)" value={about.story3} onChange={(v) => setAbout(p => ({ ...p, story3: v }))} multiline />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Our Mission" value={about.mission} onChange={(v) => setAbout(p => ({ ...p, mission: v }))} multiline />
            <Field label="Our Vision" value={about.vision} onChange={(v) => setAbout(p => ({ ...p, vision: v }))} multiline />
          </div>
          <MultiImageUploadField
            label="About Page Images"
            values={about.about_images}
            onChange={(v) => setAbout(p => ({ ...p, about_images: v }))}
            uploadType="about"
          />
          <button
            onClick={() => save("about")}
            disabled={updateAbout.isPending}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Save size={14} /> {updateAbout.isPending ? "Saving..." : "Save About Content"}
          </button>
        </Section>

        {/* Stats */}
        <Section title="Company Statistics" icon={<BarChart3 size={16} className="text-green-600" />}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Sqft Developed (display text)" value={stats.sqft_developed} onChange={(v) => setStats(p => ({ ...p, sqft_developed: v }))} />
            <Field label="Happy Families (display text)" value={stats.happy_families} onChange={(v) => setStats(p => ({ ...p, happy_families: v }))} />
            <Field label="Active Projects Count" value={stats.active_projects} onChange={(v) => setStats(p => ({ ...p, active_projects: v }))} />
            <Field label="Approval Label" value={stats.approval} onChange={(v) => setStats(p => ({ ...p, approval: v }))} />
          </div>
          <button
            onClick={() => save("stats")}
            disabled={updateStats.isPending}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Save size={14} /> {updateStats.isPending ? "Saving..." : "Save Statistics"}
          </button>
        </Section>

        {/* Social Links */}
        <Section title="Social Media Links" icon={<Globe size={16} className="text-blue-500" />}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Facebook URL" value={social.facebook} type="url" onChange={(v) => setSocial(p => ({ ...p, facebook: v }))} />
            <Field label="Instagram URL" value={social.instagram} type="url" onChange={(v) => setSocial(p => ({ ...p, instagram: v }))} />
          </div>
          <button
            onClick={() => save("social")}
            disabled={updateSocial.isPending}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Save size={14} /> {updateSocial.isPending ? "Saving..." : "Save Social Links"}
          </button>
        </Section>
      </div>
    </AdminLayout>
  );
}

