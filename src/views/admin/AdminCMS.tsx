"use client";

import { useState, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetSections, useCreateSection, useUpdateSection, useDeleteSection, useReorderSections, type PageSection } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/useUpload";
import { FileText, Plus, Trash2, Save, ChevronUp, ChevronDown, Eye, EyeOff, Upload, X, GripVertical } from "lucide-react";

const PAGES = [
  { key: "home", label: "Home" },
  { key: "about", label: "About" },
  { key: "contact", label: "Contact" },
  { key: "gallery", label: "Gallery" },
];

function Field({ label, value, onChange, multiline = false, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
      )}
    </div>
  );
}

function ImageUploadField({ label, values, onChange }: {
  label: string; values: string[]; onChange: (v: string[]) => void;
}) {
  const { upload, isUploading } = useUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const result = await upload(file, "gallery");
      if (result?.url) newUrls.push(result.url);
    }
    if (newUrls.length > 0) onChange([...values, ...newUrls]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = (index: number) => onChange(values.filter((_, i) => i !== index));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-2 mb-3">
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
        <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-lg transition-colors">
          <Upload size={14} /> {isUploading ? "Uploading..." : "Add Images"}
        </button>
      </div>
      {values.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {values.map((url, i) => (
            <div key={i} className="relative group">
              <img src={url} alt={`Image ${i + 1}`} className="w-full aspect-square object-cover rounded-lg border" />
              <button onClick={() => handleRemove(i)}
                className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ButtonEditor({ buttons, onChange }: {
  buttons: { text: string; link: string; variant: string }[]; onChange: (v: { text: string; link: string; variant: string }[]) => void;
}) {
  const add = () => onChange([...buttons, { text: "", link: "", variant: "primary" }]);
  const remove = (i: number) => onChange(buttons.filter((_, idx) => idx !== i));
  const update = (i: number, field: string, val: string) => {
    const updated = [...buttons];
    updated[i] = { ...updated[i], [field]: val };
    onChange(updated);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">CTA Buttons</label>
      {buttons.map((btn, i) => (
        <div key={i} className="flex items-start gap-2 mb-3 p-3 bg-gray-50 rounded-lg border">
          <div className="flex-1 grid grid-cols-3 gap-2">
            <input value={btn.text} onChange={(e) => update(i, "text", e.target.value)} placeholder="Button Text"
              className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            <input value={btn.link} onChange={(e) => update(i, "link", e.target.value)} placeholder="Link URL"
              className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            <select value={btn.variant} onChange={(e) => update(i, "variant", e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="outline">Outline</option>
            </select>
          </div>
          <button onClick={() => remove(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium">
        <Plus size={14} /> Add Button
      </button>
    </div>
  );
}

function ContentEditor({ content, onChange }: {
  content: Record<string, unknown>; onChange: (v: Record<string, unknown>) => void;
}) {
  const updateField = (key: string, val: unknown) => onChange({ ...content, [key]: val });

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Content (JSON Fields)</label>
      {Object.entries(content).map(([key, val]) => {
        if (typeof val === "string") {
          return (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-500 mb-1">{key}</label>
              <textarea value={val} onChange={(e) => updateField(key, e.target.value)} rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
            </div>
          );
        }
        if (Array.isArray(val)) {
          return (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-500 mb-1">{key} (JSON Array)</label>
              <textarea value={JSON.stringify(val, null, 2)} onChange={(e) => {
                try { updateField(key, JSON.parse(e.target.value)); } catch { /* ignore parse errors while typing */ }
              }} rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
            </div>
          );
        }
        if (typeof val === "object" && val !== null) {
          return (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-500 mb-1">{key} (JSON Object)</label>
              <textarea value={JSON.stringify(val, null, 2)} onChange={(e) => {
                try { updateField(key, JSON.parse(e.target.value)); } catch { /* ignore */ }
              }} rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function SectionEditor({ section, onSave, onCancel }: {
  section: PageSection; onSave: (data: Partial<PageSection>) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({
    page: section.page,
    sectionKey: section.sectionKey,
    title: section.title ?? "",
    subtitle: section.subtitle ?? "",
    content: section.content ?? {},
    images: section.images ?? [],
    buttons: section.buttons ?? [],
    displayOrder: section.displayOrder,
    isActive: section.isActive,
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
        <FileText size={16} className="text-red-600" />
        <h3 className="font-semibold text-gray-900">Edit Section: {form.sectionKey}</h3>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Page" value={form.page} onChange={(v) => setForm(p => ({ ...p, page: v }))} />
          <Field label="Section Key" value={form.sectionKey} onChange={(v) => setForm(p => ({ ...p, sectionKey: v }))} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Title" value={form.title} onChange={(v) => setForm(p => ({ ...p, title: v }))} />
          <Field label="Subtitle" value={form.subtitle} onChange={(v) => setForm(p => ({ ...p, subtitle: v }))} />
        </div>
        <ContentEditor content={form.content} onChange={(v) => setForm(p => ({ ...p, content: v }))} />
        <ImageUploadField label="Section Images" values={form.images} onChange={(v) => setForm(p => ({ ...p, images: v }))} />
        <ButtonEditor buttons={form.buttons} onChange={(v) => setForm(p => ({ ...p, buttons: v }))} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Display Order" value={String(form.displayOrder)} onChange={(v) => setForm(p => ({ ...p, displayOrder: parseInt(v) || 0 }))} type="number" />
          <div className="flex items-center gap-3 pt-6">
            <label className="text-sm font-medium text-gray-700">Active</label>
            <button onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? "bg-green-500" : "bg-gray-300"}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => onSave(form)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Save size={14} /> Save Section
          </button>
          <button onClick={onCancel}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCMS() {
  const [activePage, setActivePage] = useState("home");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const { data: sections, isLoading } = useGetSections(activePage);
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();
  const reorderSections = useReorderSections();
  const { toast } = useToast();

  const handleSave = async (data: Partial<PageSection>) => {
    try {
      if (editingId) {
        await updateSection.mutateAsync({ id: editingId, data });
        toast({ title: "Updated!", description: "Section updated successfully." });
      } else {
        await createSection.mutateAsync(data);
        toast({ title: "Created!", description: "Section created successfully." });
      }
      setEditingId(null);
      setShowCreate(false);
    } catch {
      toast({ title: "Error", description: "Failed to save section.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this section?")) return;
    try {
      await deleteSection.mutateAsync({ id });
      toast({ title: "Deleted!", description: "Section removed." });
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const handleToggleActive = async (section: PageSection) => {
    try {
      await updateSection.mutateAsync({
        id: section.id,
        data: { ...section, isActive: !section.isActive },
      });
      toast({ title: "Updated!", description: `Section ${section.isActive ? "hidden" : "shown"}.` });
    } catch {
      toast({ title: "Error", description: "Failed to toggle.", variant: "destructive" });
    }
  };

  const handleMove = async (section: PageSection, direction: "up" | "down") => {
    if (!sections) return;
    const sorted = [...sections].sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = sorted.findIndex(s => s.id === section.id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === sorted.length - 1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const reordered = sorted.map((s, i) => ({ id: s.id, displayOrder: i }));
    // Swap
    [reordered[idx].displayOrder, reordered[swapIdx].displayOrder] = [reordered[swapIdx].displayOrder, reordered[idx].displayOrder];
    try {
      await reorderSections.mutateAsync(reordered);
    } catch {
      toast({ title: "Error", description: "Failed to reorder.", variant: "destructive" });
    }
  };

  const editingSection = editingId ? sections?.find(s => s.id === editingId) : null;

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CMS Page Sections</h1>
            <p className="text-gray-500 text-sm mt-1">Edit content sections for each page</p>
          </div>
          <button onClick={() => { setEditingId(null); setShowCreate(true); }}
            className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
            <Plus size={14} /> Add Section
          </button>
        </div>

        {/* Page Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {PAGES.map(p => (
            <button key={p.key} onClick={() => { setActivePage(p.key); setEditingId(null); setShowCreate(false); }}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activePage === p.key ? "bg-white text-red-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Create New Section Form */}
        {showCreate && !editingId && (
          <SectionEditor
            section={{
              id: "", page: activePage, sectionKey: "", title: "", subtitle: "",
              content: {}, images: [], buttons: [], displayOrder: sections?.length ?? 0,
              isActive: true, createdAt: "", updatedAt: "",
            }}
            onSave={handleSave}
            onCancel={() => setShowCreate(false)}
          />
        )}

        {/* Edit Existing Section */}
        {editingSection && (
          <SectionEditor
            section={editingSection}
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
          />
        )}

        {/* Sections List */}
        <div className="space-y-3">
          {(!sections || sections.length === 0) && !showCreate && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              No sections found for this page. Click "Add Section" to create one.
            </div>
          )}
          {(sections ?? [])
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map(section => (
              <div key={section.id} className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${!section.isActive ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <GripVertical size={16} className="text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 text-sm">{section.sectionKey}</span>
                      {section.title && <span className="text-gray-500 text-sm">— {section.title}</span>}
                      {!section.isActive && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Hidden</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">Order: {section.displayOrder}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleMove(section, "up")}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded" title="Move Up">
                      <ChevronUp size={16} />
                    </button>
                    <button onClick={() => handleMove(section, "down")}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded" title="Move Down">
                      <ChevronDown size={16} />
                    </button>
                    <button onClick={() => handleToggleActive(section)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded" title={section.isActive ? "Hide" : "Show"}>
                      {section.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button onClick={() => { setEditingId(section.id); setShowCreate(false); }}
                      className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded" title="Edit">
                      <FileText size={16} />
                    </button>
                    <button onClick={() => handleDelete(section.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </AdminLayout>
  );
}
