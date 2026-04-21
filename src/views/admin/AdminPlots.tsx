"use client";

import { useState } from "react";
import { Link } from 'wouter';
import { Plus, Edit, Trash2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useQueryClient } from "@tanstack/react-query";
import { formatPKR, getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useGetPlots, useGetProjects, useDeletePlot, useUpdatePlot, getGetPlotsQueryKey } from "@/lib/api";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import AdminPlotForm from "./AdminPlotForm";

interface Plot {
  id: string;
  plotNumber: string;
  projectId: string;
  projectName?: string;
  size: string;
  type: string;
  price: number;
  status: string;
  isCorner?: boolean;
}

export default function AdminPlots() {
  const [filters, setFilters] = useState({ projectId: "", status: "", type: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlotId, setEditingPlotId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingPlotId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (id: string) => {
    setEditingPlotId(id);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingPlotId(null);
  };
  const { data: plots, isLoading } = useGetPlots();
  const { data: projects } = useGetProjects();
  const deletePlot = useDeletePlot();
  const updatePlot = useUpdatePlot();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const filtered = (plots as Plot[] ?? []).filter((p) => {
    if (filters.projectId && p.projectId !== filters.projectId) return false;
    if (filters.status && p.status !== filters.status) return false;
    if (filters.type && p.type !== filters.type) return false;
    return true;
  });

  const handleDelete = (id: string, plotNumber: string) => {
    if (!confirm(`Delete plot "${plotNumber}"?`)) return;
    deletePlot.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPlotsQueryKey() });
        toast({ title: "Deleted", description: `Plot "${plotNumber}" deleted.` });
      },
    });
  };

  const handleStatusChange = (id: string, status: string) => {
    updatePlot.mutate({ id, data: { status } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetPlotsQueryKey() }),
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Plots</h1>
          <button onClick={handleOpenAdd} className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700">
            <Plus size={14} /> Add Plot
          </button>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogTitle className="sr-only">
              {editingPlotId ? "Edit Plot" : "Add New Plot"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingPlotId ? "Edit plot details" : "Create a new plot"}
            </DialogDescription>
            <AdminPlotForm
              plotId={editingPlotId}
              onClose={handleClose}
            />
          </DialogContent>
        </Dialog>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-gray-200 p-4">
          <select value={filters.projectId} onChange={(e) => setFilters(p => ({ ...p, projectId: e.target.value }))} className="border border-gray-300 rounded px-3 py-1.5 text-sm">
            <option value="">All Projects</option>
            {(projects as { id: string; name: string }[] ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))} className="border border-gray-300 rounded px-3 py-1.5 text-sm">
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="Booked">Booked</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
          </select>
          <select value={filters.type} onChange={(e) => setFilters(p => ({ ...p, type: e.target.value }))} className="border border-gray-300 rounded px-3 py-1.5 text-sm">
            <option value="">All Types</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Farmhouse">Farmhouse</option>
          </select>
          {(filters.projectId || filters.status || filters.type) && (
            <button onClick={() => setFilters({ projectId: "", status: "", type: "" })} className="text-xs text-red-600 hover:underline">
              Clear
            </button>
          )}
          <span className="ml-auto text-sm text-gray-500">{filtered.length} plots</span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Plot #</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Project</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Size</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Type</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Price</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No plots found.</td></tr>
              ) : (
                filtered.map((plot) => (
                  <tr key={plot.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      {plot.plotNumber}
                      {plot.isCorner && <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1 rounded">Corner</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{plot.projectName ?? "—"}</td>
                    <td className="px-4 py-3">{plot.size}</td>
                    <td className="px-4 py-3">{plot.type}</td>
                    <td className="px-4 py-3 font-semibold">{formatPKR(plot.price)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={plot.status}
                        onChange={(e) => handleStatusChange(plot.id, e.target.value)}
                        className={`text-xs font-medium rounded px-2 py-0.5 border-0 cursor-pointer ${getStatusColor(plot.status)}`}
                      >
                        <option value="Available">Available</option>
                        <option value="Booked">Booked</option>
                        <option value="Reserved">Reserved</option>
                        <option value="Sold">Sold</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleOpenEdit(plot.id)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(plot.id, plot.plotNumber)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
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

