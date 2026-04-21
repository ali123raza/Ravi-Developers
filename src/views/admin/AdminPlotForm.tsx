"use client";

import { useEffect, useState } from "react";
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, X } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useGetPlot, useGetProjects, useCreatePlot, useUpdatePlot, getGetPlotsQueryKey } from "@/lib/api";

const SIZES = ["3 Marla", "4 Marla", "5 Marla", "6 Marla", "10 Marla", "20 Marla", "1 Kanal", "2 Kanal", "4 Kanal", "8 Kanal"];

interface AdminPlotFormProps {
  plotId?: string | null;
  onClose?: () => void;
}

export default function AdminPlotForm({ plotId, onClose }: AdminPlotFormProps = {}) {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Support both standalone page and modal usage
  const isModal = !!onClose;
  const effectiveId = plotId ?? params?.id;
  const isEdit = !!effectiveId && effectiveId !== "new";

  const { data: projects } = useGetProjects();
  const { data: plot } = useGetPlot(effectiveId ?? "", { query: { enabled: isEdit } });
  const createPlot = useCreatePlot();
  const updatePlot = useUpdatePlot();

  const [form, setForm] = useState({
    projectId: "", plotNumber: "", size: "5 Marla", type: "Residential",
    price: "", status: "Available", area: "", facing: "", category: "A", isCorner: false,
  });

  useEffect(() => {
    if (plot) {
      setForm({
        projectId: plot.projectId,
        plotNumber: plot.plotNumber,
        size: plot.size,
        type: plot.type,
        price: plot.price.toString(),
        status: plot.status,
        area: plot.area.toString(),
        facing: plot.facing ?? "",
        category: plot.category ?? "A",
        isCorner: plot.isCorner,
      });
    }
  }, [plot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      projectId: form.projectId,
      plotNumber: form.plotNumber,
      size: form.size,
      type: form.type,
      price: parseFloat(form.price),
      status: form.status,
      area: parseFloat(form.area),
      facing: form.facing || null,
      category: form.category || null,
      isCorner: form.isCorner,
    };

    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getGetPlotsQueryKey() });
      toast({ title: isEdit ? "Plot Updated" : "Plot Created" });
      if (isModal && onClose) {
        onClose();
      } else {
        setLocation("/admin/plots");
      }
    };
    const onError = () => toast({ title: "Error", description: "Failed to save plot.", variant: "destructive" });

    if (isEdit && effectiveId) {
      updatePlot.mutate({ id: effectiveId, data }, { onSuccess, onError });
    } else {
      createPlot.mutate({ data }, { onSuccess, onError });
    }
  };

  const isPending = createPlot.isPending || updatePlot.isPending;

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-900">{isEdit ? "Edit Plot" : "Add New Plot"}</h2>
        {isModal && onClose && (
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        )}
      </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
            <select value={form.projectId} onChange={(e) => setForm(p => ({ ...p, projectId: e.target.value }))} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="">Select Project</option>
              {(projects as { id: string; name: string }[] ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plot Number *</label>
              <input value={form.plotNumber} onChange={(e) => setForm(p => ({ ...p, plotNumber: e.target.value }))} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="A-101" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="A">Category A</option>
                <option value="B">Category B</option>
                <option value="C">Category C</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size *</label>
              <select value={form.size} onChange={(e) => setForm(p => ({ ...p, size: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select value={form.type} onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Farmhouse">Farmhouse</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (PKR) *</label>
              <input type="number" value={form.price} onChange={(e) => setForm(p => ({ ...p, price: e.target.value }))} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="1875000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq. ft.) *</label>
              <input type="number" value={form.area} onChange={(e) => setForm(p => ({ ...p, area: e.target.value }))} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="1125" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facing</label>
              <select value={form.facing} onChange={(e) => setForm(p => ({ ...p, facing: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Select Facing</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="Available">Available</option>
                <option value="Booked">Booked</option>
                <option value="Reserved">Reserved</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isCorner" checked={form.isCorner} onChange={(e) => setForm(p => ({ ...p, isCorner: e.target.checked }))} className="accent-red-600" />
            <label htmlFor="isCorner" className="text-sm font-medium text-gray-700">Corner Plot</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isPending} className="flex-1 bg-red-600 text-white py-2.5 rounded font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50">
              {isPending ? "Saving..." : isEdit ? "Update Plot" : "Create Plot"}
            </button>
            <button type="button" onClick={isModal ? onClose! : () => setLocation("/admin/plots")} className="px-6 border border-gray-300 text-gray-700 py-2.5 rounded font-semibold text-sm hover:bg-gray-50">
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
      <div className="max-w-xl">
        <button onClick={() => setLocation("/admin/plots")} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm mb-5">
          <ArrowLeft size={14} /> Back to Plots
        </button>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {formContent}
        </div>
      </div>
    </AdminLayout>
  );
}

