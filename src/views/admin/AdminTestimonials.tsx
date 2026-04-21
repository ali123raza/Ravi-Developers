"use client";

import { useState } from "react";
import { Plus, Trash2, Star } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useGetTestimonials, useGetProjects, useCreateTestimonial, useDeleteTestimonial, getGetTestimonialsQueryKey } from "@/lib/api";

export default function AdminTestimonials() {
  const { data: testimonials, isLoading } = useGetTestimonials();
  const { data: projects } = useGetProjects();
  const createTestimonial = useCreateTestimonial();
  const deleteTestimonial = useDeleteTestimonial();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customerName: "", testimonial: "", rating: 5, projectId: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createTestimonial.mutate(
      { data: { ...form, rating: Number(form.rating), projectId: form.projectId || null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetTestimonialsQueryKey() });
          toast({ title: "Testimonial added" });
          setForm({ customerName: "", testimonial: "", rating: 5, projectId: "" });
          setShowForm(false);
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    deleteTestimonial.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTestimonialsQueryKey() });
        toast({ title: "Deleted" });
      },
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700">
            <Plus size={14} /> Add Testimonial
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">New Testimonial</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <input value={form.customerName} onChange={(e) => setForm(p => ({ ...p, customerName: e.target.value }))} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project (optional)</label>
                <select value={form.projectId} onChange={(e) => setForm(p => ({ ...p, projectId: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">No Project</option>
                  {(projects ?? []).map((p: { id: string; name: string }) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating: {form.rating}/5</label>
              <input type="range" min={1} max={5} value={form.rating} onChange={(e) => setForm(p => ({ ...p, rating: Number(e.target.value) }))} className="w-full accent-red-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Testimonial *</label>
              <textarea value={form.testimonial} onChange={(e) => setForm(p => ({ ...p, testimonial: e.target.value }))} required rows={3} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={createTestimonial.isPending} className="bg-red-600 text-white px-5 py-2 rounded text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
                {createTestimonial.isPending ? "Saving..." : "Add Testimonial"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-gray-300 text-gray-700 px-5 py-2 rounded text-sm font-semibold hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8"><div className="animate-spin w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full mx-auto" /></div>
          ) : (testimonials ?? []).length === 0 ? (
            <p className="text-center py-8 text-gray-500">No testimonials yet.</p>
          ) : (
            (testimonials ?? []).map((t: { id: string; customerName: string; testimonial: string; rating: number; createdAt: string }) => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{t.customerName}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} className={i < t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{t.testimonial}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(t.createdAt).toLocaleDateString("en-PK")}</p>
                  </div>
                  <button onClick={() => handleDelete(t.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

