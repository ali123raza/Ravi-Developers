"use client";

import { useState } from "react";
import { MapPin, Filter, SortAsc, MessageSquare, Map, Grid3X3, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InquiryForm from "@/components/InquiryForm";
import PlotMap2D from "@/components/PlotMap2D";
import VirtualTour from "@/components/VirtualTour";
import { formatPKR, getStatusColor } from "@/lib/utils";
import { useGetPlots } from "@/lib/api";


interface PlotItem {
  id: string;
  plotNumber: string;
  projectId: string;
  projectName?: string;
  size: string;
  type: string;
  price: number;
  status: string;
  area: number;
  facing?: string | null;
  category?: string | null;
  isCorner?: boolean;
  mapBlock?: string | null;
  mapRow?: number | null;
  mapCol?: number | null;
  createdAt: string;
}

const SIZES = ["3 Marla", "4 Marla", "5 Marla", "6 Marla", "10 Marla", "20 Marla", "1 Kanal", "2 Kanal", "4 Kanal", "8 Kanal"];

type ViewMode = "grid" | "map";

export default function PlotsPage() {
  const [filters, setFilters] = useState({ type: "", status: "Available", size: "", facing: "" });
  const [sortBy, setSortBy] = useState("price-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [inquiryPlotId, setInquiryPlotId] = useState<string | null>(null);
  const [virtualTourPlot, setVirtualTourPlot] = useState<PlotItem | null>(null);

  const { data: plots, isLoading } = useGetPlots();

  const filtered = (plots as PlotItem[] ?? [])
    .filter((p) => {
      if (filters.type && p.type !== filters.type) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (filters.size && p.size !== filters.size) return false;
      if (filters.facing && p.facing !== filters.facing) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "size") return SIZES.indexOf(a.size) - SIZES.indexOf(b.size);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const allPlots = (plots as PlotItem[]) ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-gray-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-3">Available Plots</h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Browse all available plots across our housing societies. View the 2D scheme map or take a Virtual Tour.
          </p>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="bg-white border-b border-gray-200 py-4 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-1.5 text-gray-500 text-sm">
              <Filter size={14} /> Filters:
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm"
            >
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Reserved">Reserved</option>
              <option value="Sold">Sold</option>
            </select>
            <select
              value={filters.type}
              onChange={(e) => setFilters(p => ({ ...p, type: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm"
            >
              <option value="">All Types</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Farmhouse">Farmhouse</option>
            </select>
            <select
              value={filters.size}
              onChange={(e) => setFilters(p => ({ ...p, size: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm"
            >
              <option value="">All Sizes</option>
              {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={filters.facing}
              onChange={(e) => setFilters(p => ({ ...p, facing: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm"
            >
              <option value="">All Facing</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
            </select>

            {(filters.type || filters.status || filters.size || filters.facing) && (
              <button
                onClick={() => setFilters({ type: "", status: "", size: "", facing: "" })}
                className="text-xs text-red-600 hover:underline"
              >
                Clear Filters
              </button>
            )}

            <div className="flex items-center gap-1.5 ml-auto">
              <div className="flex items-center gap-1.5 text-gray-500 text-sm mr-3">
                <SortAsc size={14} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm"
                >
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="size">By Size</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex border border-gray-300 rounded overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${viewMode === "grid" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <Grid3X3 size={14} /> Grid
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${viewMode === "map" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <Map size={14} /> 2D Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <p className="text-gray-600 text-sm">
              Showing <span className="font-semibold text-gray-900">{viewMode === "map" ? allPlots.length : filtered.length}</span> plots
              {viewMode === "map" && <span className="text-gray-400 ml-1">(all plots shown on map)</span>}
            </p>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : viewMode === "map" ? (
            <PlotMap2D
              plots={allPlots.map(p => ({
                ...p,
                isCorner: p.isCorner ?? false,
                mapBlock: p.mapBlock ?? null,
                mapRow: p.mapRow ?? null,
                mapCol: p.mapCol ?? null,
              }))}
              onVirtualTour={(plot) => setVirtualTourPlot(plot as PlotItem)}
            />
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No plots match your current filters.</p>
              <button
                onClick={() => setFilters({ type: "", status: "", size: "", facing: "" })}
                className="mt-3 text-red-600 hover:underline text-sm"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((plot) => (
                <div key={plot.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold text-gray-900">{plot.plotNumber}</div>
                      {plot.projectName && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {plot.projectName}
                        </div>
                      )}
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(plot.status)}`}>
                      {plot.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 my-2">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{plot.size}</span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{plot.type}</span>
                    {plot.isCorner && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Corner</span>}
                    {plot.facing && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{plot.facing} Facing</span>}
                    {plot.category && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">Cat. {plot.category}</span>}
                  </div>
                  <div className="text-red-600 font-bold text-lg mt-2">{formatPKR(plot.price)}</div>
                  <div className="text-gray-500 text-xs">{plot.area.toLocaleString()} sq. ft.</div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setVirtualTourPlot(plot)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white py-1.5 rounded text-xs font-medium transition-colors"
                    >
                      <Eye size={12} /> Virtual Tour
                    </button>
                    {plot.status === "Available" && (
                      <button
                        onClick={() => setInquiryPlotId(plot.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white py-1.5 rounded text-xs font-medium transition-colors"
                      >
                        <MessageSquare size={12} /> Book
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Quick Inquiry Modal */}
      {inquiryPlotId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setInquiryPlotId(null)}>
          <div className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <InquiryForm plotId={inquiryPlotId} title="Plot Inquiry" />
            <button onClick={() => setInquiryPlotId(null)} className="mt-2 w-full text-white text-sm py-2 hover:text-gray-200">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Virtual Tour */}
      {virtualTourPlot && (
        <VirtualTour
          plot={{
            id: virtualTourPlot.id,
            plotNumber: virtualTourPlot.plotNumber,
            size: virtualTourPlot.size,
            type: virtualTourPlot.type,
            price: virtualTourPlot.price,
            status: virtualTourPlot.status,
            area: virtualTourPlot.area,
            facing: virtualTourPlot.facing ?? null,
            isCorner: virtualTourPlot.isCorner ?? false,
            projectName: virtualTourPlot.projectName ?? null,
          }}
          onClose={() => setVirtualTourPlot(null)}
        />
      )}

      <Footer />
    </div>
  );
}

