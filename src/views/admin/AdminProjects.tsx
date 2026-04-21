"use client";

import { useState } from "react";
import { Link } from 'wouter';
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useQueryClient } from "@tanstack/react-query";
import { getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useGetProjects, useDeleteProject, getGetProjectsQueryKey } from "@/lib/api";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import AdminProjectForm from "./AdminProjectForm";

export default function AdminProjects() {
  const { data: projects, isLoading } = useGetProjects();
  const deleteProject = useDeleteProject();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingProjectId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (id: string) => {
    setEditingProjectId(id);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingProjectId(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete project "${name}"? This will also delete all associated plots.`)) return;
    deleteProject.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProjectsQueryKey() });
        toast({ title: "Deleted", description: `Project "${name}" was deleted.` });
      },
      onError: () => toast({ title: "Error", description: "Failed to delete project.", variant: "destructive" }),
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <button onClick={handleOpenAdd} className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700">
            <Plus size={14} /> Add Project
          </button>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogTitle className="sr-only">
              {editingProjectId ? "Edit Project" : "Add New Project"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingProjectId ? "Edit project details" : "Create a new project"}
            </DialogDescription>
            <AdminProjectForm
              projectId={editingProjectId}
              onClose={handleClose}
            />
          </DialogContent>
        </Dialog>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Project</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Location</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Total Area</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-16" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded animate-pulse w-20" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-20" /></td>
                  </tr>
                ))
              ) : (projects ?? []).length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No projects yet. <button onClick={handleOpenAdd} className="text-red-600 hover:underline">Add one.</button></td></tr>
              ) : (
                (projects ?? []).map((project: { id: string; name: string; slug: string; location: string; status: string; totalArea: string; images?: string[] }) => (
                  <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {project.images?.[0] && (
                          <img src={project.images[0]} alt="" className="w-10 h-8 rounded object-cover shrink-0" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{project.name}</div>
                          <div className="text-xs text-gray-500">{project.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{project.location}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{project.totalArea}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/projects/${project.id}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <Eye size={14} />
                        </Link>
                        <button onClick={() => handleOpenEdit(project.id)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(project.id, project.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

