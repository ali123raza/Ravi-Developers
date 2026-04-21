"use client";

import { useState } from "react";
import { useParams } from 'wouter';
import { Link } from 'wouter';
import { MapPin, ArrowLeft, CheckCircle, Calendar, Maximize } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InquiryForm from "@/components/InquiryForm";
import InstallmentCalculator from "@/components/InstallmentCalculator";
import { formatPKR, getStatusColor, PLACEHOLDER_IMAGE } from "@/lib/utils";
import { useGetProject, useGetPlots } from "@/lib/api";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [activeImage, setActiveImage] = useState(0);
  const [plotFilter, setPlotFilter] = useState({ type: "", status: "Available", size: "" });

  const { data: project, isLoading } = useGetProject(id ?? "");
  const { data: allPlots } = useGetPlots(id);

  const filteredPlots = (allPlots ?? []).filter((p: any) => {
    if (plotFilter.type && p.type !== plotFilter.type) return false;
    if (plotFilter.status && p.status !== plotFilter.status) return false;
    if (plotFilter.size && p.size !== plotFilter.size) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-gray-500">Loading project details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Project Not Found</h2>
            <Link href="/projects" className="text-red-600 hover:underline">Back to Projects</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = project.images?.length ? project.images : [PLACEHOLDER_IMAGE];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/projects" className="hover:text-red-600 flex items-center gap-1.5">
              <ArrowLeft size={14} /> Projects
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{project.name}</span>
          </div>
        </div>

        {/* Image Gallery */}
        <section className="bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-4 md:col-span-3">
                <img src={images[activeImage]} alt={project.name} className="w-full aspect-[16/9] object-cover rounded-lg" />
              </div>
              <div className="col-span-4 md:col-span-1 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[400px]">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-24 md:w-full aspect-video md:aspect-[16/9] overflow-hidden rounded border-2 transition-colors ${i === activeImage ? "border-red-500" : "border-transparent"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Project Info */}
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                    <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                      <MapPin size={14} />
                      <span>{project.location}</span>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Total Area</div>
                    <div className="font-semibold text-gray-900">{project.totalArea}</div>
                  </div>
                  {project.launchDate && (
                    <div>
                      <div className="text-xs text-gray-400 mb-0.5">Launch Date</div>
                      <div className="font-semibold text-gray-900 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(project.launchDate).getFullYear()}
                      </div>
                    </div>
                  )}
                  {project.startingPrice && (
                    <div>
                      <div className="text-xs text-gray-400 mb-0.5">Starting Price</div>
                      <div className="font-semibold text-red-600">{formatPKR(project.startingPrice)}/Marla</div>
                    </div>
                  )}
                </div>

                <h2 className="text-lg font-bold text-gray-900 mb-2">About This Project</h2>
                <p className="text-gray-600 leading-relaxed mb-6">{project.description}</p>

                {project.features && project.features.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Key Features & Amenities</h2>
                    <div className="grid grid-cols-2 gap-2">
                      {project.features.map((f: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle size={14} className="text-red-600 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Plots */}
                {(allPlots ?? []).length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Available Plots</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <select
                        value={plotFilter.status}
                        onChange={(e) => setPlotFilter(prev => ({ ...prev, status: e.target.value }))}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm"
                      >
                        <option value="">All Status</option>
                        <option value="Available">Available</option>
                        <option value="Booked">Booked</option>
                        <option value="Reserved">Reserved</option>
                        <option value="Sold">Sold</option>
                      </select>
                      <select
                        value={plotFilter.type}
                        onChange={(e) => setPlotFilter(prev => ({ ...prev, type: e.target.value }))}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm"
                      >
                        <option value="">All Types</option>
                        <option value="Residential">Residential</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Farmhouse">Farmhouse</option>
                      </select>
                      <select
                        value={plotFilter.size}
                        onChange={(e) => setPlotFilter(prev => ({ ...prev, size: e.target.value }))}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm"
                      >
                        <option value="">All Sizes</option>
                        {["3 Marla", "4 Marla", "5 Marla", "6 Marla", "10 Marla", "20 Marla", "1 Kanal", "2 Kanal", "4 Kanal", "8 Kanal"].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-left">
                            <th className="px-4 py-3 font-semibold text-gray-600 border-b border-gray-200">Plot #</th>
                            <th className="px-4 py-3 font-semibold text-gray-600 border-b border-gray-200">Size</th>
                            <th className="px-4 py-3 font-semibold text-gray-600 border-b border-gray-200">Type</th>
                            <th className="px-4 py-3 font-semibold text-gray-600 border-b border-gray-200">Category</th>
                            <th className="px-4 py-3 font-semibold text-gray-600 border-b border-gray-200">Price</th>
                            <th className="px-4 py-3 font-semibold text-gray-600 border-b border-gray-200">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPlots.map((plot: any, i: number) => (
                            <tr key={plot.id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                              <td className="px-4 py-3 font-medium">
                                {plot.plotNumber}
                                {plot.isCorner && <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Corner</span>}
                              </td>
                              <td className="px-4 py-3">{plot.size}</td>
                              <td className="px-4 py-3">{plot.type}</td>
                              <td className="px-4 py-3">{plot.category ?? "—"}</td>
                              <td className="px-4 py-3 font-semibold text-gray-900">{formatPKR(plot.price)}</td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(plot.status)}`}>
                                  {plot.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredPlots.length === 0 && (
                        <p className="text-center py-6 text-gray-500">No plots match your filters.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Map */}
                <div className="mt-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Location</h2>
                  <div className="rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-100">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55054.88068695591!2d70.26987095!3d28.3974449!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393b56e4e8c71b31%3A0x7c4cb7e4a78c8e23!2sRahim%20Yar%20Khan%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1704000000000!5m2!1sen!2s"
                      width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                <InquiryForm projectId={project.id} title={`Inquire About ${project.name}`} />
                {project.startingPrice && (
                  <InstallmentCalculator defaultPrice={project.startingPrice * 5} />
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

