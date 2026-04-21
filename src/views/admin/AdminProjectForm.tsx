"use client";

import { useEffect, useState } from "react";
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, X } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useGetProject, useCreateProject, useUpdateProject, getGetProjectsQueryKey } from "@/lib/api";

interface AdminProjectFormProps {
  projectId?: string | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminProjectForm({ projectId, isOpen, onClose }: AdminProjectFormProps = {}) {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Support both standalone page and modal usage
  const isModal = !!onClose;
  const effectiveId = projectId ?? params?.id;
  const isEdit = !!effectiveId && effectiveId !== "new";

  const { data: project } = useGetProject(effectiveId ?? "");
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const [form, setForm] = useState({
    name: "", slug: "", description: "", location: "", totalArea: "", status: "Active",
    images: "", features: "", launchDate: "", completionDate: "", startingPrice: "",
  });

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name,
        slug: project.slug,
        description: project.description,
        location: project.location,
        totalArea: project.totalArea,
        status: project.status,
        images: (project.images ?? []).join("\n"),
        features: (project.features ?? []).join("\n"),
        launchDate: project.launchDate ?? "",
        completionDate: project.completionDate ?? "",
        startingPrice: project.startingPrice?.toString() ?? "",
      });
    }
  }, [project]);

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setForm((p) => ({ ...p, name, slug }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      location: form.location,
      totalArea: form.totalArea,
      status: form.status,
      images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
      features: form.features.split("\n").map((s) => s.trim()).filter(Boolean),
      launchDate: form.launchDate || null,
      completionDate: form.completionDate || null,
      startingPrice: form.startingPrice ? parseFloat(form.startingPrice) : null,
    };

    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getGetProjectsQueryKey() });
      toast({ title: isEdit ? "Project Updated" : "Project Created" });
      if (isModal && onClose) {
        onClose();
      } else {
        setLocation("/admin/projects");
      }
    };
    const onError = () => toast({ title: "Error", description: "Failed to save project.", variant: "destructive" });

    if (isEdit && effectiveId) {
      updateProject.mutate({ id: effectiveId, data }, { onSuccess, onError });
    } else {
      createProject.mutate({ data }, { onSuccess, onError });
    }
  };

  const isPending = createProject.isPending || updateProject.isPending;

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-900">{isEdit ? "Edit Project" : "Add New Project"}</h2>
        {isModal && onClose && (
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        )}
      </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
            <input value={form.name} onChange={(e) => handleNameChange(e.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Punjnad Housing Society" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
            <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="Active">Active</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Shahbaz Pur Road, Rahim Yar Khan" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Area *</label>
              <input value={form.totalArea} onChange={(e) => setForm((p) => ({ ...p, totalArea: e.target.value }))} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="500 Acres" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Starting Price (PKR/Marla)</label>
              <input type="number" value={form.startingPrice} onChange={(e) => setForm((p) => ({ ...p, startingPrice: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="37500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Launch Date</label>
              <input type="date" value={form.launchDate} onChange={(e) => setForm((p) => ({ ...p, launchDate: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
              <input type="date" value={form.completionDate} onChange={(e) => setForm((p) => ({ ...p, completionDate: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required rows={3} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs (one per line)</label>
            <textarea value={form.images} onChange={(e) => setForm((p) => ({ ...p, images: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" placeholder="https://example.com/image1.jpg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
            <textarea value={form.features} onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))} rows={4} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" placeholder="TMA Approved&#10;Wide Roads&#10;Underground Electricity" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isPending} className="flex-1 bg-red-600 text-white py-2.5 rounded font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50">
              {isPending ? "Saving..." : isEdit ? "Update Project" : "Create Project"}
            </button>
            <button type="button" onClick={isModal ? onClose! : () => setLocation("/admin/projects")} className="px-6 border border-gray-300 text-gray-700 py-2.5 rounded font-semibold text-sm hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
  );

  // If used as modal, just return the form content
  if (isModal) {
    return formContent;
  }

  // Standalone page wrapper
  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <button onClick={() => setLocation("/admin/projects")} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm mb-5">
          <ArrowLeft size={14} /> Back to Projects
        </button>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {formContent}
        </div>
      </div>
    </AdminLayout>
  );
}

