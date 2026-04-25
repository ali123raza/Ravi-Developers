"use client";

import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetNavigationFlat, useCreateNavItem, useUpdateNavItem, useDeleteNavItem, useReorderNavigation, type NavItem } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Navigation, Plus, Trash2, Save, ChevronUp, ChevronDown, GripVertical, ExternalLink, Eye, EyeOff } from "lucide-react";

function Field({ label, value, onChange, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
    </div>
  );
}

function NavItemEditor({ item, parentItems, onSave, onCancel }: {
  item: Partial<NavItem>; parentItems: NavItem[]; onSave: (data: Partial<NavItem>) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({
    label: item.label ?? "",
    href: item.href ?? "",
    parentId: item.parentId ?? "",
    displayOrder: item.displayOrder ?? 0,
    isActive: item.isActive ?? true,
    isExternal: item.isExternal ?? false,
    icon: item.icon ?? "",
  });

  const rootItems = parentItems.filter(p => !p.parentId && p.id !== item.id);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
        <Navigation size={16} className="text-red-600" />
        <h3 className="font-semibold text-gray-900">{item.id ? "Edit Menu Item" : "Add Menu Item"}</h3>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Label" value={form.label} onChange={(v) => setForm(p => ({ ...p, label: v }))} />
          <Field label="Link URL" value={form.href} onChange={(v) => setForm(p => ({ ...p, href: v }))} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Menu (for submenus)</label>
            <select value={form.parentId ?? ""} onChange={(e) => setForm(p => ({ ...p, parentId: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="">None (Top Level)</option>
              {rootItems.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <Field label="Icon Name (optional)" value={form.icon ?? ""} onChange={(v) => setForm(p => ({ ...p, icon: v }))} />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Display Order" value={String(form.displayOrder)} onChange={(v) => setForm(p => ({ ...p, displayOrder: parseInt(v) || 0 }))} type="number" />
          <div className="flex items-center gap-3 pt-6">
            <label className="text-sm font-medium text-gray-700">Active</label>
            <button onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? "bg-green-500" : "bg-gray-300"}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          <div className="flex items-center gap-3 pt-6">
            <label className="text-sm font-medium text-gray-700">External</label>
            <button onClick={() => setForm(p => ({ ...p, isExternal: !p.isExternal }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isExternal ? "bg-blue-500" : "bg-gray-300"}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isExternal ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => onSave(form)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Save size={14} /> Save
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

export default function AdminNavigation() {
  const { data: items, isLoading } = useGetNavigationFlat();
  const createNav = useCreateNavItem();
  const updateNav = useUpdateNavItem();
  const deleteNav = useDeleteNavItem();
  const reorderNav = useReorderNavigation();
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const handleSave = async (data: Partial<NavItem>) => {
    try {
      if (editingId) {
        await updateNav.mutateAsync({ id: editingId, data });
        toast({ title: "Updated!", description: "Menu item updated." });
      } else {
        await createNav.mutateAsync(data);
        toast({ title: "Created!", description: "Menu item added." });
      }
      setEditingId(null);
      setShowCreate(false);
    } catch {
      toast({ title: "Error", description: "Failed to save.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;
    try {
      await deleteNav.mutateAsync({ id });
      toast({ title: "Deleted!", description: "Menu item removed." });
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const handleToggleActive = async (item: NavItem) => {
    try {
      await updateNav.mutateAsync({ id: item.id, data: { ...item, isActive: !item.isActive } });
      toast({ title: "Updated!", description: `Item ${item.isActive ? "hidden" : "shown"}.` });
    } catch {
      toast({ title: "Error", description: "Failed to toggle.", variant: "destructive" });
    }
  };

  const handleMove = async (item: NavItem, direction: "up" | "down") => {
    if (!items) return;
    const sorted = [...items].sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = sorted.findIndex(s => s.id === item.id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === sorted.length - 1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const reordered = sorted.map((s, i) => ({ id: s.id, displayOrder: i }));
    [reordered[idx].displayOrder, reordered[swapIdx].displayOrder] = [reordered[swapIdx].displayOrder, reordered[idx].displayOrder];
    try {
      await reorderNav.mutateAsync(reordered);
    } catch {
      toast({ title: "Error", description: "Failed to reorder.", variant: "destructive" });
    }
  };

  const editingItem = editingId ? items?.find(i => i.id === editingId) : null;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const sortedItems = [...(items ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Navigation Menu</h1>
            <p className="text-gray-500 text-sm mt-1">Manage website navigation links and submenus</p>
          </div>
          <button onClick={() => { setEditingId(null); setShowCreate(true); }}
            className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
            <Plus size={14} /> Add Menu Item
          </button>
        </div>

        {/* Create Form */}
        {showCreate && !editingId && (
          <NavItemEditor item={{}} parentItems={items ?? []} onSave={handleSave} onCancel={() => setShowCreate(false)} />
        )}

        {/* Edit Form */}
        {editingItem && (
          <NavItemEditor item={editingItem} parentItems={items ?? []} onSave={handleSave} onCancel={() => setEditingId(null)} />
        )}

        {/* Items List */}
        <div className="space-y-2">
          {sortedItems.length === 0 && !showCreate && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              No navigation items. Click "Add Menu Item" to create one.
            </div>
          )}
          {sortedItems.map(item => (
            <div key={item.id} className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${!item.isActive ? "opacity-60" : ""} ${item.parentId ? "ml-8" : ""}`}>
              <div className="flex items-center gap-3 px-4 py-3">
                <GripVertical size={16} className="text-gray-400" />
                {item.isExternal && <ExternalLink size={14} className="text-blue-500" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">{item.label}</span>
                    <span className="text-gray-400 text-xs">{item.href}</span>
                    {item.parentId && <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Submenu</span>}
                    {!item.isActive && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Hidden</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleMove(item, "up")}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded" title="Move Up">
                    <ChevronUp size={16} />
                  </button>
                  <button onClick={() => handleMove(item, "down")}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded" title="Move Down">
                    <ChevronDown size={16} />
                  </button>
                  <button onClick={() => handleToggleActive(item)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded" title={item.isActive ? "Hide" : "Show"}>
                    {item.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button onClick={() => { setEditingId(item.id); setShowCreate(false); }}
                    className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded" title="Edit">
                    <Navigation size={16} />
                  </button>
                  <button onClick={() => handleDelete(item.id)}
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
