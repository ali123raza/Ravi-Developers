"use client";

import { useState } from "react";
import { Link } from 'wouter';
import { MapPin, Search, ArrowRight, Filter } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatPKR, getStatusColor, PLACEHOLDER_IMAGE } from "@/lib/utils";
import { useGetProjects } from "@/lib/api";

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { data: projects, isLoading } = useGetProjects();

  const filtered = (projects ?? []).filter((p: any) => {
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="bg-gray-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-3">Our Projects</h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Explore our TMA-approved housing societies in Rahim Yar Khan. Premium plots with modern amenities and easy installment plans.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-200 py-4 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <main className="flex-1 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-200 animate-pulse">
                  <div className="aspect-[16/10] bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg font-medium">No projects found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((project: any) => (
                <Link key={project.id} href={`/projects/${project.id}`} className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="relative overflow-hidden aspect-[16/10]">
                    <img
                      src={project.images?.[0] ?? PLACEHOLDER_IMAGE}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-red-600 transition-colors">{project.name}</h3>
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1 mb-2">
                      <MapPin size={12} />
                      <span>{project.location}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        {project.startingPrice && (
                          <>
                            <div className="text-xs text-gray-400">Starting from</div>
                            <div className="text-red-600 font-bold">{formatPKR(project.startingPrice)} / Marla</div>
                          </>
                        )}
                      </div>
                      <span className="text-red-600 font-medium text-sm flex items-center gap-1">
                        Details <ArrowRight size={14} />
                      </span>
                    </div>
                    {project.features && project.features.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {project.features.slice(0, 3).map((f: string, i: number) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

