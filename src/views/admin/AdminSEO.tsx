"use client";

import { useState, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetSEOSettings, useCreateSEO, useUpdateSEO, useDeleteSEO, type SEOSettings } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/useUpload";
import { Search, Plus, Trash2, Save, Upload, X, ChevronDown, ChevronUp } from "lucide-react";

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

function SEOEditor({ item, onSave, onCancel }: {
  item: Partial<SEOSettings>; onSave: (data: Partial<SEOSettings>) => void; onCancel: () => void;
}) {
  const { upload, isUploading } = useUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    page: item.page ?? "",
    metaTitle: item.metaTitle ?? "",
    metaDescription: item.metaDescription ?? "",
    metaKeywords: item.metaKeywords ?? "",
    ogTitle: item.ogTitle ?? "",
    ogDescription: item.ogDescription ?? "",
    ogImage: item.ogImage ?? "",
    canonicalUrl: item.canonicalUrl ?? "",
    robotsMeta: item.robotsMeta ?? "index, follow",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload(file, "gallery");
    if (result?.url) setForm(p => ({ ...p, ogImage: result.url }));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
        <Search size={16} className="text-red-600" />
        <h3 className="font-semibold text-gray-900">{item.id ? `Edit SEO: ${form.page}` : "Add SEO Settings"}</h3>
      </div>
      <div className="p-5 space-y-4">
        <Field label="Page (slug)" value={form.page} onChange={(v) => setForm(p => ({ ...p, page: v }))} />

        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Basic Meta</h4>
          <div className="space-y-4">
            <Field label="Meta Title" value={form.metaTitle} onChange={(v) => setForm(p => ({ ...p, metaTitle: v }))} />
            <Field label="Meta Description" value={form.metaDescription} onChange={(v) => setForm(p => ({ ...p, metaDescription: v }))} multiline />
            <Field label="Meta Keywords (comma separated)" value={form.metaKeywords} onChange={(v) => setForm(p => ({ ...p, metaKeywords: v }))} />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Open Graph (Social Sharing)</h4>
          <div className="space-y-4">
            <Field label="OG Title" value={form.ogTitle} onChange={(v) => setForm(p => ({ ...p, ogTitle: v }))} />
            <Field label="OG Description" value={form.ogDescription} onChange={(v) => setForm(p => ({ ...p, ogDescription: v }))} multiline />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OG Image</label>
              <div className="flex items-center gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-lg transition-colors">
                  <Upload size={14} /> {isUploading ? "Uploading..." : (form.ogImage ? "Change" : "Upload")}
                </button>
                {form.ogImage && (
                  <button onClick={() => setForm(p => ({ ...p, ogImage: "" }))} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><X size={14} /></button>
                )}
              </div>
              {form.ogImage && <img src={form.ogImage} alt="OG Preview" className="mt-2 max-h-20 object-contain border rounded-lg p-1" />}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Advanced</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Canonical URL" value={form.canonicalUrl} onChange={(v) => setForm(p => ({ ...p, canonicalUrl: v }))} type="url" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Robots Meta</label>
              <select value={form.robotsMeta} onChange={(e) => setForm(p => ({ ...p, robotsMeta: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="index, follow">Index, Follow</option>
                <option value="noindex, follow">No Index, Follow</option>
                <option value="index, nofollow">Index, No Follow</option>
                <option value="noindex, nofollow">No Index, No Follow</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => onSave(form)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Save size={14} /> Save SEO
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

export default function AdminSEO() {
  const { data: settings, isLoading } = useGetSEOSettings();
  const createSEO = useCreateSEO();
  const updateSEO = useUpdateSEO();
  const deleteSEO = useDeleteSEO();
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSave = async (data: Partial<SEOSettings>) => {
    try {
      if (editingId) {
        await updateSEO.mutateAsync({ id: editingId, data });
        toast({ title: "Updated!", description: "SEO settings updated." });
      } else {
        await createSEO.mutateAsync(data);
        toast({ title: "Created!", description: "SEO settings added." });
      }
      setEditingId(null);
      setShowCreate(false);
    } catch {
      toast({ title: "Error", description: "Failed to save.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete SEO settings for this page?")) return;
    try {
      await deleteSEO.mutateAsync({ id });
      toast({ title: "Deleted!", description: "SEO settings removed." });
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const editingItem = editingId ? settings?.find(s => s.id === editingId) : null;

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
            <h1 className="text-2xl font-bold text-gray-900">SEO Settings</h1>
            <p className="text-gray-500 text-sm mt-1">Manage meta tags and social sharing for each page</p>
          </div>
          <button onClick={() => { setEditingId(null); setShowCreate(true); }}
            className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
            <Plus size={14} /> Add Page SEO
          </button>
        </div>

        {/* Create Form */}
        {showCreate && !editingId && (
          <SEOEditor item={{}} onSave={handleSave} onCancel={() => setShowCreate(false)} />
        )}

        {/* Edit Form */}
        {editingItem && (
          <SEOEditor item={editingItem} onSave={handleSave} onCancel={() => setEditingId(null)} />
        )}

        {/* SEO List */}
        <div className="space-y-3">
          {(!settings || settings.length === 0) && !showCreate && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              No SEO settings found. Click "Add Page SEO" to create one.
            </div>
          )}
          {(settings ?? []).map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                <Search size={16} className="text-red-500" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900 text-sm capitalize">{item.page}</span>
                  {item.metaTitle && <span className="text-gray-500 text-sm ml-2">— {item.metaTitle}</span>}
                </div>
                <button onClick={(e) => { e.stopPropagation(); setEditingId(item.id); setShowCreate(false); }}
                  className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded" title="Edit">
                  <Search size={16} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded" title="Delete">
                  <Trash2 size={16} />
                </button>
                {expandedId === item.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
              {expandedId === item.id && (
                <div className="px-5 pb-4 border-t border-gray-100 pt-3 space-y-2">
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Meta Title:</span> <span className="text-gray-900">{item.metaTitle || "—"}</span></div>
                    <div><span className="text-gray-500">Canonical:</span> <span className="text-gray-900">{item.canonicalUrl || "—"}</span></div>
                    <div className="sm:col-span-2"><span className="text-gray-500">Description:</span> <span className="text-gray-900">{item.metaDescription || "—"}</span></div>
                    <div><span className="text-gray-500">Keywords:</span> <span className="text-gray-900">{item.metaKeywords || "—"}</span></div>
                    <div><span className="text-gray-500">Robots:</span> <span className="text-gray-900">{item.robotsMeta}</span></div>
                    <div><span className="text-gray-500">OG Title:</span> <span className="text-gray-900">{item.ogTitle || "—"}</span></div>
                    <div><span className="text-gray-500">OG Image:</span> {item.ogImage ? <img src={item.ogImage} alt="OG" className="inline-block max-h-10 ml-2 rounded border" /> : <span className="text-gray-900">—</span>}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
